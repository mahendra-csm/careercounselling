export interface AssessmentAnswers {
  // Step 1
  name: string;
  currentRole: string;
  yearsExperience: number;
  industry: string;

  // Step 2
  currentSkills: string[];

  // Step 3
  targetRole: string;
  companyType: string;
  locationPreference: string;
  salaryMin: number;
  salaryMax: number;

  // Step 4
  workPace: string;
  teamSize: string;
  managementStyle: string;
  learningStyle: string;

  // Step 5
  timeline: string;
  topPriority: string;
}

export type AssessmentStep = 1 | 2 | 3 | 4 | 5;

export interface StepProps {
  onNext: () => void;
  onBack?: () => void;
}
