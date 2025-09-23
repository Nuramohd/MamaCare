// Kenya Antenatal Care (ANC) Guidelines 2024
// Based on Kenya Ministry of Health and WHO recommendations

interface AncGuideline {
  category: 'tetanus' | 'ifas' | 'visits' | 'screening' | 'nutrition';
  title: string;
  description: string;
  timing: string;
  dosage?: string;
  purpose: string;
  sideEffects?: string[];
  tips: string[];
  importance: 'critical' | 'important' | 'recommended';
}

interface AncVisitSchedule {
  visitNumber: number;
  gestationalWeeks: number;
  date: string;
  purpose: string[];
  tests: string[];
}

const ANC_GUIDELINES: AncGuideline[] = [
  {
    category: 'tetanus',
    title: 'Tetanus Vaccination During Pregnancy',
    description: 'Tetanus vaccination protects both mother and baby from tetanus infection',
    timing: '27-36 weeks gestation (ideally as early as possible in that window)',
    purpose: 'Prevents tetanus in mother and provides passive immunity to newborn for first 2 months',
    tips: [
      'Can be given at any time during pregnancy if needed',
      'Safe for both mother and baby',
      'Free at all public health facilities',
      'Brings vaccination card to every visit',
      'If previous tetanus vaccination unknown, start 3-dose series'
    ],
    importance: 'critical'
  },
  {
    category: 'ifas',
    title: 'Iron-Folic Acid Supplementation (IFAS)',
    description: 'Daily iron and folic acid supplements prevent anemia and support baby development',
    timing: 'Throughout pregnancy, starting as early as possible',
    dosage: '30-60mg elemental iron + 400μg (0.4mg) folic acid daily',
    purpose: 'Prevents iron deficiency anemia in mother and supports baby brain and spinal cord development',
    sideEffects: ['Nausea (take with food)', 'Constipation (increase fluids)', 'Dark colored stool (normal)', 'Stomach upset'],
    tips: [
      'Take with Vitamin C foods (oranges, tomatoes) for better absorption',
      'Avoid tea or coffee within 2 hours of taking IFAS',
      'Take with meals if stomach upset occurs',
      'Free distribution at all ANC visits',
      'Continue throughout breastfeeding',
      'Report severe side effects to healthcare provider'
    ],
    importance: 'critical'
  },
  {
    category: 'visits',
    title: 'ANC Visit Schedule',
    description: 'Regular antenatal visits ensure healthy pregnancy and early problem detection',
    timing: 'Minimum 4 visits for low-risk pregnancies, more if complications',
    purpose: 'Monitor maternal and fetal health, prevent complications, provide education',
    tips: [
      'First visit before 16 weeks (ideally 8-12 weeks)',
      'Bring urine sample to each visit',
      'Ask questions about any concerns',
      'Follow all recommendations from healthcare provider',
      'Attend all scheduled visits even if feeling well'
    ],
    importance: 'critical'
  },
  {
    category: 'screening',
    title: 'Essential ANC Screening Tests',
    description: 'Laboratory tests to detect and prevent pregnancy complications',
    timing: 'Various tests at different gestational ages',
    purpose: 'Early detection of conditions that could affect mother or baby',
    tips: [
      'Blood type and Rh factor testing',
      'Hemoglobin levels for anemia',
      'HIV, syphilis, and hepatitis B screening',
      'Urine testing for protein and infection',
      'Blood pressure monitoring',
      'All tests are confidential and important'
    ],
    importance: 'critical'
  },
  {
    category: 'nutrition',
    title: 'Pregnancy Nutrition Guidelines',
    description: 'Proper nutrition supports healthy pregnancy and baby development',
    timing: 'Throughout pregnancy',
    purpose: 'Ensure adequate nutrients for mother and growing baby',
    tips: [
      'Eat variety of foods from all food groups',
      'Include iron-rich foods: green leafy vegetables, beans, meat',
      'Consume calcium-rich foods: milk, yogurt, sardines',
      'Eat fruits rich in Vitamin C: oranges, guavas, mangoes',
      'Avoid alcohol and limit caffeine',
      'Stay hydrated with clean water',
      'Small frequent meals help with nausea'
    ],
    importance: 'important'
  }
];

export function getAncGuidelines(): AncGuideline[] {
  return ANC_GUIDELINES;
}

export function calculatePregnancyWeeks(lmpDate: string): { weeks: number; days: number; trimester: number } {
  const today = new Date();
  const lmp = new Date(lmpDate);
  const diffTime = Math.abs(today.getTime() - lmp.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  
  let trimester = 1;
  if (weeks >= 14 && weeks <= 27) trimester = 2;
  else if (weeks >= 28) trimester = 3;

  return { weeks, days, trimester };
}

export function calculateDueDate(lmpDate: string): string {
  const lmp = new Date(lmpDate);
  const dueDate = new Date(lmp.getTime() + (280 * 24 * 60 * 60 * 1000)); // Add 280 days
  return dueDate.toISOString().split('T')[0];
}

export function generateAncSchedule(lmpDate: string): AncVisitSchedule[] {
  const lmp = new Date(lmpDate);
  const schedule: AncVisitSchedule[] = [];

  const visits = [
    {
      visitNumber: 1,
      gestationalWeeks: 12,
      purpose: ['Initial assessment', 'Risk evaluation', 'Health education'],
      tests: ['Blood type & Rh', 'Hemoglobin', 'HIV/Syphilis/HepB', 'Urine analysis', 'Weight & BP']
    },
    {
      visitNumber: 2,
      gestationalWeeks: 20,
      purpose: ['Fetal development check', 'IFAS compliance', 'Nutritional counseling'],
      tests: ['Hemoglobin', 'Urine analysis', 'Weight & BP', 'Fetal heart rate']
    },
    {
      visitNumber: 3,
      gestationalWeeks: 28,
      purpose: ['Third trimester assessment', 'Tetanus vaccination', 'Birth preparedness'],
      tests: ['Hemoglobin', 'Urine analysis', 'Weight & BP', 'Fetal position']
    },
    {
      visitNumber: 4,
      gestationalWeeks: 36,
      purpose: ['Pre-delivery assessment', 'Birth plan discussion', 'Newborn care education'],
      tests: ['Hemoglobin', 'Urine analysis', 'Weight & BP', 'Fetal presentation']
    }
  ];

  for (const visit of visits) {
    const visitDate = new Date(lmp);
    visitDate.setDate(lmp.getDate() + (visit.gestationalWeeks * 7));

    schedule.push({
      visitNumber: visit.visitNumber,
      gestationalWeeks: visit.gestationalWeeks,
      date: visitDate.toISOString().split('T')[0],
      purpose: visit.purpose,
      tests: visit.tests
    });
  }

  return schedule;
}

export function getTimingForTetanus(currentWeeks: number): {
  canReceive: boolean;
  recommended: boolean;
  message: string;
} {
  if (currentWeeks < 27) {
    return {
      canReceive: true,
      recommended: false,
      message: 'Tetanus vaccination can be given anytime, but optimal timing is 27-36 weeks'
    };
  } else if (currentWeeks >= 27 && currentWeeks <= 36) {
    return {
      canReceive: true,
      recommended: true,
      message: 'This is the optimal time for tetanus vaccination (27-36 weeks)'
    };
  } else {
    return {
      canReceive: true,
      recommended: true,
      message: 'Tetanus vaccination should be given soon - you are past the optimal window'
    };
  }
}

export function getIfasCompliance(startDate?: string, currentWeeks?: number): {
  shouldStart: boolean;
  duration: number;
  message: string;
} {
  if (!startDate) {
    return {
      shouldStart: true,
      duration: 0,
      message: 'IFAS supplements should be started immediately. They are critical for preventing anemia and supporting baby development.'
    };
  }

  const start = new Date(startDate);
  const today = new Date();
  const daysOnIfas = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  return {
    shouldStart: false,
    duration: daysOnIfas,
    message: `You have been taking IFAS for ${daysOnIfas} days. Continue daily throughout pregnancy and breastfeeding.`
  };
}

export function getAncComplianceStatus(
  lmpDate: string, 
  completedVisits: number, 
  currentWeeks: number
): {
  onTrack: boolean;
  missedVisits: number;
  nextVisitDue: string;
  message: string;
} {
  const expectedVisits = Math.min(Math.floor(currentWeeks / 8), 4); // Rough estimate
  const missedVisits = Math.max(0, expectedVisits - completedVisits);
  
  const schedule = generateAncSchedule(lmpDate);
  const nextVisit = schedule.find(visit => visit.gestationalWeeks > currentWeeks);
  
  return {
    onTrack: missedVisits === 0,
    missedVisits,
    nextVisitDue: nextVisit?.date || 'No more visits scheduled',
    message: missedVisits > 0 
      ? `You have missed ${missedVisits} ANC visits. Please visit your health facility soon.`
      : 'You are on track with your ANC visits. Keep up the good work!'
  };
}

export function getPregnancyRiskFactors(
  age: number,
  currentWeeks: number,
  tetanusVaccinated: boolean,
  ifasStarted: boolean,
  ancVisits: number
): {
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
} {
  const factors: string[] = [];
  const recommendations: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  // Age-related risks
  if (age < 18) {
    factors.push('Young maternal age (under 18)');
    recommendations.push('Extra nutritional support needed');
    riskLevel = 'medium';
  }
  if (age > 35) {
    factors.push('Advanced maternal age (over 35)');
    recommendations.push('More frequent monitoring may be needed');
    riskLevel = 'medium';
  }

  // Vaccination status
  if (currentWeeks > 36 && !tetanusVaccinated) {
    factors.push('Tetanus vaccination overdue');
    recommendations.push('Get tetanus vaccination immediately');
    riskLevel = 'high';
  }

  // IFAS compliance
  if (!ifasStarted && currentWeeks > 12) {
    factors.push('IFAS supplements not started');
    recommendations.push('Start iron and folic acid supplements immediately');
    riskLevel = 'medium';
  }

  // ANC compliance
  const expectedVisits = Math.min(Math.floor(currentWeeks / 8), 4);
  if (ancVisits < expectedVisits) {
    factors.push('Missed ANC visits');
    recommendations.push('Catch up on missed antenatal care visits');
    if (expectedVisits - ancVisits > 1) riskLevel = 'high';
  }

  return { riskLevel, factors, recommendations };
}
