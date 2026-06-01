/**
 * OneGrasp report model — shared types, reference data and helpers.
 *
 * The scoring now lives in lib/assessment-engine.ts (the 6-section test). This
 * module keeps the PsychometricProfile shape, the RIASEC/MBTI/skill reference
 * data and the small numeric helpers the engine and report both rely on.
 */

export type MbtiAxis = 'EI' | 'SN' | 'TF' | 'JP';
export type Riasec = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type Eq = 'selfAwareness' | 'managingEmotions' | 'motivation' | 'empathy' | 'relationship';
export type Learning = 'visual' | 'auditory' | 'readWrite' | 'kinesthetic';
export type Skill =
  | 'numerical' | 'logical' | 'verbal' | 'organizing'
  | 'spatial' | 'leadership' | 'social' | 'mechanical';

// ---------- Reference data ----------
export const RIASEC_LABELS: Record<Riasec, string> = {
  R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional',
};

export const MBTI_DESC: Record<string, string[]> = {
  E: ['You are energised by people and the outer world.', 'You think out loud and act quickly.'],
  I: ['You are energised by reflection and depth.', 'You do your best work with focus and quiet.'],
  S: ['You trust facts, detail and proven paths.', 'You are practical and results-focused.'],
  N: ['You trust patterns, meaning and possibilities.', 'You enjoy big-picture, future thinking.'],
  T: ['You decide with logic, growth and fairness.', 'You value competence and objective analysis.'],
  F: ['You decide with values and people in mind.', 'You are warm, caring and seek positive impact.'],
  J: ['You like structure, plans and clear next steps.', 'You are organised, decisive and reliable.'],
  P: ['You like flexibility and keeping options open.', 'You are adaptable, curious and spontaneous.'],
};

export const SKILL_LABELS: Record<Skill, string> = {
  numerical: 'Numerical Ability', logical: 'Logical Ability', verbal: 'Verbal Ability',
  organizing: 'Administrative & Organising Skills', spatial: 'Spatial & Visualisation Ability',
  leadership: 'Leadership & Decision Making', social: 'Social & Co-operation Skills', mechanical: 'Mechanical Abilities',
};
export const EQ_LABELS: Record<Eq, string> = {
  selfAwareness: 'Emotional Self Awareness', managingEmotions: 'Managing Emotions',
  motivation: 'Motivation', empathy: 'Empathy', relationship: 'Relationship Management',
};
export const LEARNING_LABELS: Record<Learning, string> = {
  visual: 'Visual Learning', auditory: 'Auditory Learning', readWrite: 'Read & Write Learning', kinesthetic: 'Kinesthetic Learning',
};

export interface CareerDef { title: string; roles: string; cluster: string; code: Riasec[]; skills: Skill[]; }
export const CAREERS: CareerDef[] = [
  { title: 'Software Developer', roles: 'Engineer, Programmer, App Developer', cluster: 'Information Technology', code: ['I', 'R', 'C'], skills: ['logical', 'numerical', 'spatial'] },
  { title: 'Data & AI Scientist', roles: 'Data Analyst, ML Engineer, Researcher', cluster: 'Information Technology', code: ['I', 'C', 'A'], skills: ['numerical', 'logical', 'verbal'] },
  { title: 'Mechanical / Civil Engineer', roles: 'Design Engineer, Site Engineer', cluster: 'Engineering & Technology', code: ['R', 'I', 'C'], skills: ['mechanical', 'spatial', 'numerical'] },
  { title: 'Doctor / Healthcare', roles: 'Physician, Nurse, Therapist', cluster: 'Health Science', code: ['I', 'S', 'C'], skills: ['logical', 'social', 'organizing'] },
  { title: 'Psychologist / Counsellor', roles: 'Counsellor, Clinical Psychologist', cluster: 'Human Service', code: ['S', 'I', 'A'], skills: ['social', 'verbal', 'logical'] },
  { title: 'Teacher / Educator', roles: 'Teacher, Trainer, Academic', cluster: 'Education & Training', code: ['S', 'A', 'E'], skills: ['verbal', 'social', 'organizing'] },
  { title: 'Designer (UX / Graphic)', roles: 'UX Designer, Graphic Designer', cluster: 'Arts & Media', code: ['A', 'R', 'E'], skills: ['spatial', 'verbal', 'logical'] },
  { title: 'Content & Media Creator', roles: 'Writer, Journalist, Film-maker', cluster: 'Media & Communication', code: ['A', 'S', 'E'], skills: ['verbal', 'social', 'spatial'] },
  { title: 'Entrepreneur / Business Leader', roles: 'Founder, Product Manager', cluster: 'Business Management', code: ['E', 'C', 'S'], skills: ['leadership', 'verbal', 'organizing'] },
  { title: 'Marketing & Sales', roles: 'Marketer, Brand Manager, BDM', cluster: 'Marketing & Advertising', code: ['E', 'A', 'S'], skills: ['verbal', 'leadership', 'social'] },
  { title: 'Finance & Investment', roles: 'Analyst, Banker, Financial Planner', cluster: 'Accounts & Finance', code: ['C', 'E', 'I'], skills: ['numerical', 'logical', 'organizing'] },
  { title: 'Chartered Accountant', roles: 'Accountant, Auditor, CFO', cluster: 'Accounts & Finance', code: ['C', 'I', 'E'], skills: ['numerical', 'organizing', 'logical'] },
  { title: 'Civil Services / Law', roles: 'Civil Servant, Lawyer, Policy', cluster: 'Government & Legal', code: ['S', 'E', 'C'], skills: ['verbal', 'logical', 'leadership'] },
  { title: 'Human Resources', roles: 'HR Manager, Recruiter, Trainer', cluster: 'Business Management', code: ['S', 'E', 'C'], skills: ['social', 'organizing', 'verbal'] },
  { title: 'Architect / Interior Design', roles: 'Architect, Interior Designer', cluster: 'Arts & Engineering', code: ['A', 'R', 'I'], skills: ['spatial', 'mechanical', 'organizing'] },
  { title: 'Hospitality & Tourism', roles: 'Hotelier, Event Manager, Chef', cluster: 'Hospitality & Tourism', code: ['E', 'S', 'R'], skills: ['social', 'organizing', 'leadership'] },
];

export const CLUSTER_BY_RIASEC: Record<Riasec, string[]> = {
  R: ['Engineering & Technology', 'Logistics & Manufacturing', 'Agriculture & Environment'],
  I: ['Information Technology', 'Health Science', 'Science & Research'],
  A: ['Arts & Media', 'Media & Communication', 'Design & Architecture'],
  S: ['Human Service', 'Education & Training', 'Healthcare'],
  E: ['Business Management', 'Marketing & Advertising', 'Entrepreneurship'],
  C: ['Accounts & Finance', 'Government & Legal', 'Administration'],
};

// ---------- Output types ----------
export interface Bar { key: string; label: string; percent: number; }
export interface CareerFit {
  title: string; roles: string; cluster: string; match: number;
  verdict: 'Top Choice' | 'Good Choice' | 'Optional' | 'Develop' | 'Avoid';
}
export interface PsychometricProfile {
  kind: 'psychometric';
  name: string;
  dreamCareer?: string;
  favoritePath?: string;
  generatedAt: string;
  overallScore: number;
  matchLabel: string;
  mbtiType: string;
  mbtiAxes: { axis: MbtiAxis; left: string; right: string; leftPct: number; rightPct: number; dominant: string }[];
  personalityBullets: string[];
  strengths: string[];
  interests: Bar[];
  topInterests: string[];
  motivators: Bar[];
  learning: Bar[];
  dominantLearning: string;
  eq: (Bar & { level: 'Low' | 'Medium' | 'High' })[];
  skills: (Bar & { rating: string })[];
  overallSkills: number;
  clusters: Bar[];
  topCareers: CareerFit[];
  careerFocus: string;
  gaps: string[];
  nextSteps: string[];
  /** Gardner multiple intelligences (added by the 6-section engine). */
  intelligences?: (Bar & { level: 'Low' | 'Medium' | 'High' })[];
  dominantIntelligence?: string;
  /** Per-section completion meta for the report cover. */
  sectionMeta?: { id: string; title: string; answered: number; total: number }[];
  /** Headline aptitude score from the Analytical & Logical section. */
  analyticalScore?: { correct: number; total: number };
  /** How much of the test was answered → how reliable the profile is. */
  confidence?: { percent: number; answered: number; total: number; label: string };
}

// ---------- helpers ----------
export const round = (n: number) => Math.round(n);
export const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, round(n)));
export function ratingFor(p: number) { return p >= 80 ? 'Excellent' : p >= 67 ? 'Good' : p >= 50 ? 'Average' : 'Needs work'; }
export function levelFor(p: number): 'Low' | 'Medium' | 'High' { return p >= 66 ? 'High' : p >= 45 ? 'Medium' : 'Low'; }
