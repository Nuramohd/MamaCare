import OpenAI from "openai";
import type { User, Pregnancy, Child } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "your-openai-api-key" 
});

interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: 'pregnancy' | 'childcare' | 'vaccination' | 'nutrition' | 'general';
  priority: 'low' | 'normal' | 'high';
  targetWeeks?: number;
  targetAge?: string;
}

export async function generateHealthTip(
  user: User, 
  pregnancy?: Pregnancy | null, 
  children?: Child[]
): Promise<HealthTip[]> {
  try {
    // Build context for AI
    let context = `Generate health tips for a Kenyan mother named ${user.firstName}.`;
    
    if (pregnancy) {
      context += ` She is currently ${pregnancy.currentWeeks} weeks pregnant.`;
      if (!pregnancy.tetanusVaccinated) {
        context += ` She hasn't received her tetanus vaccination yet.`;
      }
      if (!pregnancy.ifasStartDate) {
        context += ` She hasn't started IFAS supplements yet.`;
      }
    }
    
    if (children && children.length > 0) {
      context += ` She has ${children.length} children:`;
      children.forEach((child, index) => {
        const age = calculateAge(child.dateOfBirth);
        context += ` Child ${index + 1} is ${age} old.`;
      });
    }

    context += ` Provide health tips based on Kenya's health guidelines, WHO recommendations, and local practices. Include Kenya EPI vaccination information and ANC care guidelines.`;

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a Kenyan maternal and child health expert. Provide practical, culturally appropriate health advice following Kenya's health guidelines. Always mention relevant Kenya EPI vaccination schedules, ANC care protocols, and local health practices. Respond with JSON in this format: 
          {
            "tips": [
              {
                "id": "unique_id",
                "title": "Short title",
                "content": "Detailed health advice (2-3 sentences)",
                "category": "pregnancy|childcare|vaccination|nutrition|general",
                "priority": "low|normal|high",
                "targetWeeks": number_if_pregnancy_related,
                "targetAge": "string_if_child_related"
              }
            ]
          }`
        },
        {
          role: "user",
          content: context
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"tips": []}');
    return result.tips || [];

  } catch (error) {
    console.error("AI health tip generation error:", error);
    
    // Fallback to static tips based on Kenya guidelines
    return generateFallbackTips(user, pregnancy, children);
  }
}

export async function analyzeHealthData(
  healthData: {
    pregnancyWeeks?: number;
    childrenAges?: string[];
    vaccinationStatus?: string[];
    ancVisits?: number;
  }
): Promise<{
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  urgentActions: string[];
}> {
  try {
    const context = `Analyze this health data for a Kenyan mother and provide risk assessment: ${JSON.stringify(healthData)}`;

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a Kenyan health data analyst. Analyze maternal and child health data and provide risk assessment based on Kenya's health standards. Respond with JSON: 
          {
            "riskLevel": "low|medium|high",
            "recommendations": ["recommendation1", "recommendation2"],
            "urgentActions": ["action1", "action2"]
          }`
        },
        {
          role: "user",
          content: context
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      riskLevel: result.riskLevel || 'low',
      recommendations: result.recommendations || [],
      urgentActions: result.urgentActions || []
    };

  } catch (error) {
    console.error("Health data analysis error:", error);
    return {
      riskLevel: 'low',
      recommendations: ['Continue regular health check-ups', 'Follow Kenya EPI vaccination schedule'],
      urgentActions: []
    };
  }
}

function calculateAge(dateOfBirth: string): string {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  
  if (ageInMonths < 12) {
    return `${ageInMonths} months`;
  } else {
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    return months > 0 ? `${years} years, ${months} months` : `${years} years`;
  }
}

function generateFallbackTips(user: User, pregnancy?: Pregnancy | null, children?: Child[]): HealthTip[] {
  const tips: HealthTip[] = [];

  if (pregnancy) {
    if (pregnancy.currentWeeks && pregnancy.currentWeeks >= 27 && !pregnancy.tetanusVaccinated) {
      tips.push({
        id: 'tetanus-vaccine',
        title: 'Tetanus Vaccination Due',
        content: 'You should receive your tetanus vaccination between 27-36 weeks of pregnancy. This protects both you and your baby from tetanus infection. Visit your nearest health facility.',
        category: 'pregnancy',
        priority: 'high',
        targetWeeks: pregnancy.currentWeeks || undefined
      });
    }

    if (!pregnancy.ifasStartDate) {
      tips.push({
        id: 'ifas-supplements',
        title: 'Start IFAS Supplements',
        content: 'Iron and Folic Acid supplements are essential throughout pregnancy. Take 30-60mg iron + 400μg folic acid daily. Available free at all public health facilities.',
        category: 'nutrition',
        priority: 'high',
        targetWeeks: pregnancy.currentWeeks || undefined
      });
    }

    tips.push({
      id: 'pregnancy-nutrition',
      title: `Nutrition at ${pregnancy.currentWeeks} Weeks`,
      content: 'Eat a balanced diet with plenty of vegetables, fruits, and protein. Include iron-rich foods like green leafy vegetables, beans, and lean meat. Stay hydrated.',
      category: 'nutrition',
      priority: 'normal',
      targetWeeks: pregnancy.currentWeeks
    });
  }

  if (children && children.length > 0) {
    tips.push({
      id: 'vaccination-importance',
      title: 'Why Vaccinations Matter',
      content: 'Following Kenya EPI schedule protects your children from serious diseases. All routine vaccines are free at public health facilities. Keep vaccination cards safe.',
      category: 'vaccination',
      priority: 'normal'
    });
  }

  tips.push({
    id: 'general-health',
    title: 'Stay Healthy in Kenya',
    content: 'Regular handwashing, clean water, and nutritious local foods keep you and your family healthy. Visit your nearest health facility for any concerns.',
    category: 'general',
    priority: 'normal'
  });

  return tips;
}
