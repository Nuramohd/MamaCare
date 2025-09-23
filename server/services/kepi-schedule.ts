// Kenya Expanded Programme on Immunisation (KEPI) Schedule 2024
// Based on official Kenya guidelines and WHO recommendations

interface Vaccine {
  name: string;
  dose: number;
  ageWeeks: number;
  ageDays?: number;
  method: string;
  purpose: string;
  sideEffects?: string[];
  preVaccinationTips?: string[];
  postVaccinationTips?: string[];
}

interface VaccinationScheduleItem {
  name: string;
  dose: number;
  date: string;
  ageAtVaccination: string;
  method: string;
  purpose: string;
}

const KEPI_SCHEDULE: Vaccine[] = [
  // At Birth
  {
    name: 'BCG',
    dose: 1,
    ageWeeks: 0,
    ageDays: 0,
    method: '0.05ml intradermal injection, left forearm',
    purpose: 'Protects against tuberculosis (TB)',
    preVaccinationTips: ['Ensure baby is healthy', 'No fever or illness'],
    postVaccinationTips: ['Small scar is normal', 'Keep injection site clean', 'Avoid tight clothing on arm']
  },
  {
    name: 'OPV',
    dose: 1,
    ageWeeks: 0,
    ageDays: 0,
    method: '2 oral drops',
    purpose: 'Protects against polio',
    preVaccinationTips: ['Baby should not be sick', 'No diarrhea or vomiting'],
    postVaccinationTips: ['Continue breastfeeding normally', 'Watch for any unusual symptoms']
  },

  // 6 Weeks
  {
    name: 'Pentavalent',
    dose: 1,
    ageWeeks: 6,
    method: '0.5ml intramuscular, outer thigh',
    purpose: 'Protects against diphtheria, pertussis (whooping cough), tetanus, hepatitis B, and Haemophilus influenzae type b',
    sideEffects: ['Mild fever', 'Swelling at injection site', 'Fussiness'],
    preVaccinationTips: ['Ensure baby is well', 'Bring vaccination card'],
    postVaccinationTips: ['Give paracetamol if fever develops', 'Apply cool compress to injection site', 'Continue normal feeding']
  },
  {
    name: 'OPV',
    dose: 2,
    ageWeeks: 6,
    method: 'Oral drops',
    purpose: 'Booster protection against polio',
    postVaccinationTips: ['Do not give other oral medications for 1 hour']
  },
  {
    name: 'PCV',
    dose: 1,
    ageWeeks: 6,
    method: '0.5ml intramuscular',
    purpose: 'Protects against pneumonia and meningitis',
    sideEffects: ['Mild fever', 'Injection site tenderness'],
    postVaccinationTips: ['Monitor for fever', 'Seek medical care if breathing difficulties occur']
  },
  {
    name: 'Rotavirus',
    dose: 1,
    ageWeeks: 6,
    method: '1.5ml oral',
    purpose: 'Protects against severe diarrhea',
    preVaccinationTips: ['Baby should not have diarrhea or vomiting'],
    postVaccinationTips: ['Continue breastfeeding', 'Watch for signs of intussusception (rare)']
  },

  // 10 Weeks
  {
    name: 'Pentavalent',
    dose: 2,
    ageWeeks: 10,
    method: '0.5ml intramuscular',
    purpose: 'Second dose for continued protection',
    sideEffects: ['Similar to first dose, may be slightly more reaction'],
    postVaccinationTips: ['Same care as first dose', 'Complete rest for baby']
  },
  {
    name: 'OPV',
    dose: 3,
    ageWeeks: 10,
    method: 'Oral drops',
    purpose: 'Third dose of polio protection',
  },
  {
    name: 'PCV',
    dose: 2,
    ageWeeks: 10,
    method: '0.5ml intramuscular',
    purpose: 'Second dose for pneumonia protection',
  },
  {
    name: 'Rotavirus',
    dose: 2,
    ageWeeks: 10,
    method: '1.5ml oral',
    purpose: 'Second dose for rotavirus protection',
  },

  // 14 Weeks
  {
    name: 'Pentavalent',
    dose: 3,
    ageWeeks: 14,
    method: '0.5ml intramuscular',
    purpose: 'Final dose of pentavalent series',
    postVaccinationTips: ['This completes the pentavalent series', 'Important milestone in protection']
  },
  {
    name: 'OPV',
    dose: 4,
    ageWeeks: 14,
    method: 'Oral drops',
    purpose: 'Fourth dose of polio protection',
  },
  {
    name: 'PCV',
    dose: 3,
    ageWeeks: 14,
    method: '0.5ml intramuscular',
    purpose: 'Third dose completes primary PCV series',
  },
  {
    name: 'IPV',
    dose: 1,
    ageWeeks: 14,
    method: '0.5ml injection',
    purpose: 'Inactivated polio vaccine for additional protection',
    preVaccinationTips: ['This is an injection, not oral drops'],
    postVaccinationTips: ['Provides stronger immunity than oral vaccine alone']
  },

  // 9 Months
  {
    name: 'Measles-Rubella',
    dose: 1,
    ageWeeks: 39, // approximately 9 months
    method: '0.5ml injection',
    purpose: 'Protects against measles and rubella',
    sideEffects: ['Mild fever 7-12 days after vaccination', 'Mild rash'],
    preVaccinationTips: ['Very important vaccine', 'Child should be healthy'],
    postVaccinationTips: ['Fever after 1 week is normal', 'Give paracetamol for fever', 'Avoid crowded places for few days']
  },
  {
    name: 'Vitamin A',
    dose: 1,
    ageWeeks: 39,
    method: '200,000 IU oral',
    purpose: 'Supports immune system and vision',
    postVaccinationTips: ['Given every 6 months until age 5', 'Very safe and important']
  },

  // 18 Months
  {
    name: 'Measles-Rubella',
    dose: 2,
    ageWeeks: 78, // approximately 18 months
    method: '0.5ml injection',
    purpose: 'Booster dose for measles and rubella protection',
    preVaccinationTips: ['Second dose ensures full protection', 'Critical for community immunity'],
    postVaccinationTips: ['This completes measles vaccination series', 'Child now has strong protection']
  },
  {
    name: 'Vitamin A',
    dose: 2,
    ageWeeks: 78,
    method: '200,000 IU oral',
    purpose: 'Continued vitamin A supplementation',
  }
];

export function getKepiSchedule(): Vaccine[] {
  return KEPI_SCHEDULE;
}

export function generateVaccinationSchedule(dateOfBirth: string): VaccinationScheduleItem[] {
  const birthDate = new Date(dateOfBirth);
  const schedule: VaccinationScheduleItem[] = [];

  for (const vaccine of KEPI_SCHEDULE) {
    const vaccinationDate = new Date(birthDate);
    
    if (vaccine.ageDays !== undefined) {
      vaccinationDate.setDate(birthDate.getDate() + vaccine.ageDays);
    } else {
      vaccinationDate.setDate(birthDate.getDate() + (vaccine.ageWeeks * 7));
    }

    schedule.push({
      name: vaccine.name,
      dose: vaccine.dose,
      date: vaccinationDate.toISOString().split('T')[0],
      ageAtVaccination: vaccine.ageWeeks === 0 ? 'At birth' : `${vaccine.ageWeeks} weeks`,
      method: vaccine.method,
      purpose: vaccine.purpose
    });
  }

  return schedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getNextVaccination(dateOfBirth: string, completedVaccinations: any[]): any | null {
  const schedule = generateVaccinationSchedule(dateOfBirth);
  const today = new Date();

  // Find the next pending vaccination
  for (const scheduledVaccine of schedule) {
    const isCompleted = completedVaccinations.some(completed => 
      completed.vaccineName === scheduledVaccine.name && 
      completed.doseNumber === scheduledVaccine.dose &&
      completed.status === 'administered'
    );

    if (!isCompleted) {
      const scheduledDate = new Date(scheduledVaccine.date);
      const isOverdue = scheduledDate < today;
      
      return {
        vaccineName: scheduledVaccine.name,
        doseNumber: scheduledVaccine.dose,
        scheduledDate: scheduledVaccine.date,
        status: isOverdue ? 'overdue' : 'scheduled',
        method: scheduledVaccine.method,
        purpose: scheduledVaccine.purpose
      };
    }
  }

  return null; // All vaccinations completed
}

export function getVaccineInfo(vaccineName: string, dose: number): Vaccine | undefined {
  return KEPI_SCHEDULE.find(v => v.name === vaccineName && v.dose === dose);
}

export function getAgeAppropriateVaccines(ageInWeeks: number): Vaccine[] {
  return KEPI_SCHEDULE.filter(vaccine => {
    const vaccineAge = vaccine.ageWeeks;
    // Return vaccines that are due within a 2-week window
    return ageInWeeks >= vaccineAge && ageInWeeks <= vaccineAge + 2;
  });
}

export function calculateVaccinationProgress(dateOfBirth: string, completedVaccinations: any[]): {
  totalVaccines: number;
  completedVaccines: number;
  progressPercentage: number;
  nextDue: any | null;
} {
  const schedule = generateVaccinationSchedule(dateOfBirth);
  const today = new Date();
  
  // Count vaccines that should have been given by now
  const dueVaccines = schedule.filter(v => new Date(v.date) <= today);
  const completed = completedVaccinations.filter(v => v.status === 'administered');
  
  const nextDue = getNextVaccination(dateOfBirth, completedVaccinations);
  
  return {
    totalVaccines: dueVaccines.length,
    completedVaccines: completed.length,
    progressPercentage: dueVaccines.length > 0 ? Math.round((completed.length / dueVaccines.length) * 100) : 0,
    nextDue
  };
}
