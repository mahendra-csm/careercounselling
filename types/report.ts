export interface SkillScore {
  dimension: string;
  userScore: number;
  targetScore: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
  improvementAdvice: string;
}

export interface LearningResource {
  resource: string;
  type: 'course' | 'book' | 'project' | 'community';
  estimatedHours: number;
  url?: string | null;
}

export interface SkillGap {
  skill: string;
  currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced';
  requiredLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  importance: 'critical' | 'important' | 'nice-to-have';
  learningPath: LearningResource[];
}

export interface OpportunityScore {
  overall: number;
  marketDemand: number;
  skillFit: number;
  growthPotential: number;
  marketInsight: string;
  salaryBenchmark: {
    min: number;
    max: number;
    median: number;
  };
}

export interface JobMatch {
  title: string;
  company: string;
  companyType: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  matchPercent: number;
  matchedSkills: string[];
  gapSkills: string[];
  whyGoodFit: string;
  applyUrl?: string;
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'high' | 'medium' | 'low';
  category: 'learn' | 'build' | 'network' | 'apply';
  resource?: string;
  completed: boolean;
}

export interface RoadmapPhase {
  phase: 1 | 2 | 3;
  label: string;
  weeks: string;
  theme: string;
  tasks: RoadmapTask[];
}

export interface InterviewQuestion {
  type: 'behavioral' | 'technical' | 'situational' | 'cultural';
  question: string;
  whyAsked: string;
  frameworkHint: string;
  sampleAnswer: string;
}

export interface PersonalityInsights {
  workStyle: string;
  strengthsNarrative: string;
  blindSpots: string;
  teamFitNote: string;
}

export interface CompetitiveAnalysis {
  percentileRank: number;
  topCompetitorSkills: string[];
  uniqueAdvantages: string[];
  differentiationStrategy: string;
}

export interface CareerChoice {
  title: string;
  reason: string;
  matchPercent: number;
}

export interface Report {
  id: string;
  userId: string;
  assessmentId: string;
  generatedAt: string;
  shareToken: string;
  favoritePath?: string;

  overallScore: number;
  matchLabel: string;
  executiveSummary: string;

  skillScores: SkillScore[];
  opportunityScore: OpportunityScore;
  skillGapAnalysis: SkillGap[];
  jobMatches: JobMatch[];
  roadmap: RoadmapPhase[];
  interviewQuestions: InterviewQuestion[];
  personalityInsights: PersonalityInsights;
  competitiveAnalysis: CompetitiveAnalysis;
  topCareerChoices?: CareerChoice[];

  // Convenience fields for quick reports
  strengths?: string[];
  abilities?: string[];
  interests?: string[];
  improvementAreas?: string[];

  // User answers snapshot
  userName: string;
  targetRole: string;
  currentRole: string;
  yearsExperience: number;
  industry: string;
  currentSkills: string[];
  companyType: string;
  locationPreference: string;
  salaryMin: number;
  salaryMax: number;
  timeline: string;
  topPriority: string;
}

export type ReportSection =
  | 'summary'
  | 'skills'
  | 'opportunity'
  | 'jobs'
  | 'roadmap'
  | 'competitive'
  | 'interview'
  | 'personality';
