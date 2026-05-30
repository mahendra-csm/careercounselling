import type { AssessmentAnswers } from '@/types/assessment';
import type { Report } from '@/types/report';

export const LOCAL_SESSION_COOKIE = 'onegrasp-local-session';

export interface LocalSessionUser {
  id: string;
  email: string;
  name: string;
}

export interface LocalProfile {
  id: string;
  name: string;
  email: string;
  job_title: string;
  industry: string;
  years_experience: number;
  assessments_completed: number;
  last_report_id: string;
  updated_at: string;
}

export interface LocalAssessment {
  id: string;
  user_id: string;
  answers: AssessmentAnswers;
  created_at: string;
}

export interface LocalReportRow {
  id: string;
  user_id: string;
  assessment_id: string;
  generated_at: string;
  share_token: string;
  report_data: Report;
}

type LocalState = {
  profiles: LocalProfile[];
  assessments: LocalAssessment[];
  reports: LocalReportRow[];
};

declare global {
  // eslint-disable-next-line no-var
  var __ONEGRASP_LOCAL_STATE__: LocalState | undefined;
}

function now() {
  return new Date().toISOString();
}

function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function defaultNameFromEmail(email: string) {
  const prefix = email.split('@')[0] || 'Career Explorer';
  return (
    prefix
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim() || 'Career Explorer'
  );
}

export function isLocalMode() {
  return true;
}

export function createLocalUser(email: string, name?: string): LocalSessionUser {
  return {
    id: `local-user-${email.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    email,
    name: name?.trim() || defaultNameFromEmail(email),
  };
}

export function serializeLocalSession(user: LocalSessionUser) {
  return encodeURIComponent(JSON.stringify(user));
}

export function parseLocalSession(value: string | undefined | null): LocalSessionUser | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<LocalSessionUser>;
    if (!parsed.id || !parsed.email || !parsed.name) return null;
    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
    };
  } catch {
    return null;
  }
}

function getState(): LocalState {
  if (!globalThis.__ONEGRASP_LOCAL_STATE__) {
    globalThis.__ONEGRASP_LOCAL_STATE__ = {
      profiles: [],
      assessments: [],
      reports: [],
    };
  }
  return globalThis.__ONEGRASP_LOCAL_STATE__;
}

type LocalTable = 'profiles' | 'assessments' | 'reports';
type Filter = { field: string; value: unknown };
type Row = Record<string, unknown>;

function filtersMatch(row: Row, filters: Filter[]) {
  return filters.every(({ field, value }) => row[field] === value);
}

function tableRows(table: LocalTable): Row[] {
  const state = getState();
  return state[table] as unknown as Row[];
}

/**
 * Make sure a profile row exists for the signed-in local user. Called on every
 * auth.getUser() so downstream code that reads `profiles` always finds a row.
 */
export function ensureLocalSeedData(user: LocalSessionUser) {
  const profiles = tableRows('profiles');
  const existing = profiles.find((p) => p.id === user.id);
  if (!existing) {
    profiles.push({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: null,
      job_title: 'Student',
      industry: 'School',
      years_experience: 0,
      assessments_completed: 0,
      last_report_id: null,
      created_at: now(),
      updated_at: now(),
    });
  }
}

export function selectLocalRows(table: LocalTable, filters: Filter[] = []): Row[] {
  return tableRows(table)
    .filter((row) => filtersMatch(row, filters))
    .map((row) => clone(row));
}

export function maybeSingleLocalRow(table: LocalTable, filters: Filter[] = []): Row | null {
  const rows = selectLocalRows(table, filters);
  return rows[0] ?? null;
}

function withGeneratedFields(table: LocalTable, values: Row): Row {
  const base: Row = { ...values };
  if (base.id === undefined) base.id = createId(table.slice(0, -1));
  if (base.created_at === undefined) base.created_at = now();
  if (table === 'reports') {
    if (base.share_token === undefined) base.share_token = createId('share');
    if (base.generated_at === undefined) base.generated_at = now();
  }
  if (table === 'assessments' && base.completed_at === undefined) {
    base.completed_at = now();
  }
  return base;
}

export function insertLocalRow(table: LocalTable, values: Row | Row[]): Row[] {
  const rows = tableRows(table);
  const incoming = Array.isArray(values) ? values : [values];
  const inserted = incoming.map((value) => {
    const row = withGeneratedFields(table, value);
    rows.push(row);
    return clone(row);
  });
  return inserted;
}

export function updateLocalRows(table: LocalTable, values: Row, filters: Filter[] = []): Row[] {
  const rows = tableRows(table);
  const updated: Row[] = [];
  rows.forEach((row) => {
    if (filtersMatch(row, filters)) {
      Object.assign(row, values);
      updated.push(clone(row));
    }
  });
  return updated;
}

export function createLocalAssessmentAnswers(user: LocalSessionUser): AssessmentAnswers {
  return {
    name: user.name,
    currentRole: 'Student',
    yearsExperience: 0,
    industry: 'School',
    currentSkills: ['Curiosity', 'Study Habits', 'Communication'],
    targetRole: 'Undecided',
    companyType: 'School',
    locationPreference: 'School / Home',
    salaryMin: 6,
    salaryMax: 10,
    workPace: 'Balanced',
    teamSize: 'Small',
    managementStyle: 'Collaborative',
    learningStyle: 'Balanced',
    timeline: '6 months',
    topPriority: 'Explore',
  };
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function buildLocalDemoReport(
  answers: AssessmentAnswers,
  userId: string,
  assessmentId: string,
  generatedAt = now()
): Report {
  const shareToken = `share-${assessmentId}-${createId('token').split('-').pop()}`;

  // Derive simple heuristics for strengths, weaknesses and interests
  const strengths = (answers.currentSkills || []).slice(0, 5);
  const interests = [] as string[];
  const abilities = [] as string[];

  // Basic mapping from keywords
  const skillsText = (answers.currentSkills || []).join(' ').toLowerCase();
  if (/math|numbers|analytics|data/.test(skillsText) || /math|science|numbers/.test(answers.targetRole?.toLowerCase() || '')) {
    interests.push('Numeracy & Problem Solving');
    abilities.push('Analytical thinking');
  }
  if (/design|art|creative|media/.test(skillsText) || /design|creative/.test(answers.targetRole?.toLowerCase() || '')) {
    interests.push('Creative & Design');
    abilities.push('Visual & creative thinking');
  }
  if (/read|write|essay|language|story/.test(skillsText) || /humanities|english/.test(answers.targetRole?.toLowerCase() || '')) {
    interests.push('Reading & Writing');
    abilities.push('Communication');
  }
  if (/code|computer|program|tech/.test(skillsText) || /computer|coding|technology/.test(answers.targetRole?.toLowerCase() || '')) {
    interests.push('Technology & Coding');
    abilities.push('Logical problem solving');
  }
  if (interests.length === 0) {
    interests.push('General curiosity');
    abilities.push('Adaptability');
  }

  // Improvement areas: pick subjects not present in currentSkills from a small set
  const core = ['mathematics', 'science', 'english', 'communication', 'coding', 'design'];
  const present = skillsText;
  const improvementAreas = core.filter((c) => !present.includes(c)).slice(0, 4).map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase()));

  // Compute a simple score based on number of strengths, timeline, learningStyle, topPriority
  let score = 50;
  score += Math.min(30, (strengths.length || 1) * 6);
  if (/hands-on|hands on/i.test(answers.learningStyle || '')) score += 5;
  if (/1yr|6 months|6month|6-month|6mo/i.test(answers.timeline || '')) score += 4;
  if (/Skills|Explore/i.test(answers.topPriority || '')) score += 3;
  score = clamp(score, 30, 95);

  // Top 3 career choices: heuristic based on interests and abilities
  const potential = [
    { title: 'Science stream', reason: 'Strong subject curiosity and practical thinking', match: 0 },
    { title: 'Commerce stream', reason: 'Good numeracy and planning ability', match: 0 },
    { title: 'Humanities stream', reason: 'Communication and reading strengths', match: 0 },
    { title: 'Computer science focus', reason: 'Interest in technology and logical thinking', match: 0 },
    { title: 'Creative path', reason: 'Creative interests and expressive ability', match: 0 },
    { title: 'Teaching & Helping', reason: 'Interest in helping others and clear communication', match: 0 },
  ];

  const lowerTarget = (answers.targetRole || '').toLowerCase();
  potential.forEach((p) => {
    const t = p.title.toLowerCase();
    let m = 50;
    if (lowerTarget && t.includes(lowerTarget)) m += 25;
    if (interests.some((i) => i.toLowerCase().includes(t.split(' ')[0]))) m += 10;
    if (abilities.some((a) => a.toLowerCase().includes(t.split(' ')[0]))) m += 5;
    // boost based on score
    m += Math.round((score - 50) / 5);
    p.match = clamp(m, 40, 98);
  });

  potential.sort((a, b) => b.match - a.match);
  const topCareerChoices = potential.slice(0, 3).map((p) => ({ title: p.title, matchPercent: p.match, reason: p.reason }));

  const report: Report = {
    id: assessmentId,
    userId,
    assessmentId,
    generatedAt,
    shareToken,
    favoritePath: answers.targetRole,
    overallScore: score,
    matchLabel: score >= 85 ? 'Excellent fit' : score >= 70 ? 'Ready to Explore' : score >= 55 ? 'Developing' : 'Getting Started',
    executiveSummary: `${answers.name || 'Student'} shows ${strengths.slice(0, 3).join(', ')} as strengths. Based on the answers provided, the top suggested study directions are ${topCareerChoices.map((c) => c.title).join(', ')}. Focus on small, regular steps to build the identified improvement areas.`,
    skillScores: [
      { dimension: 'Subject Strengths', userScore: Math.min(90, score - 6), targetScore: Math.min(95, score + 8), gap: 8, priority: 'high', improvementAdvice: 'Practice core subject concepts regularly.' },
      { dimension: 'Communication', userScore: Math.min(88, score - 4), targetScore: Math.min(94, score + 6), gap: 6, priority: 'medium', improvementAdvice: 'Try short speaking exercises and presentations.' },
      { dimension: 'Confidence', userScore: Math.min(86, score - 10), targetScore: Math.min(92, score + 4), gap: 10, priority: 'high', improvementAdvice: 'Take small leadership roles or group tasks.' },
    ],
    opportunityScore: {
      overall: clamp(score + 1, 40, 98),
      marketDemand: clamp(score + 2, 40, 98),
      skillFit: clamp(score, 40, 98),
      growthPotential: clamp(score + 8, 40, 98),
      marketInsight: 'Students who combine subject clarity with regular practice tend to have stronger outcomes after school. Try one small project each month.',
      salaryBenchmark: { min: answers.salaryMin || 6, max: answers.salaryMax || 10, median: Math.round(((answers.salaryMin || 6) + (answers.salaryMax || 10)) / 2) },
    },
    skillGapAnalysis: improvementAreas.map((imp) => ({ skill: imp, currentLevel: 'beginner', requiredLevel: 'intermediate', importance: 'important', learningPath: [{ resource: 'Daily practice', type: 'project', estimatedHours: 4, url: null }] })),
    jobMatches: potential.slice(0, 5).map((p) => ({ title: p.title, company: 'School guidance', companyType: 'guidance', location: 'In school', salaryMin: 5, salaryMax: 10, matchPercent: p.match, matchedSkills: strengths, gapSkills: improvementAreas, whyGoodFit: p.reason })),
    roadmap: [
      { phase: 1, label: 'Foundation', weeks: '1-4', theme: 'Set up habits', tasks: [{ id: 'p1-t1', title: 'Weekly revision plan', description: 'Short daily practice', estimatedHours: 4, priority: 'high', category: 'learn', resource: 'Study timetable', completed: false }] },
    ],
    interviewQuestions: [],
    personalityInsights: {
      workStyle: `You prefer a ${answers.workPace || 'balanced'} pace and ${answers.teamSize || 'small'} teams.`,
      strengthsNarrative: `Strengths: ${strengths.join(', ')}`,
      blindSpots: `Key areas to improve: ${improvementAreas.join(', ')}`,
      teamFitNote: `Good fit for ${answers.managementStyle || 'collaborative'} environments.`,
    },
    competitiveAnalysis: { percentileRank: Math.min(90, score), topCompetitorSkills: [], uniqueAdvantages: strengths, differentiationStrategy: 'Show practical examples from school and projects.' },
    userName: answers.name,
    targetRole: answers.targetRole,
    currentRole: answers.currentRole,
    yearsExperience: answers.yearsExperience,
    industry: answers.industry,
    currentSkills: answers.currentSkills,
    companyType: answers.companyType,
    locationPreference: answers.locationPreference,
    salaryMin: answers.salaryMin,
    salaryMax: answers.salaryMax,
    timeline: answers.timeline,
    topPriority: answers.topPriority,
    // custom quick insights
    topCareerChoices,
    strengths,
    abilities,
    interests,
    improvementAreas,
  };

  return clone(report);
}
