/**
 * Scoring engine for the 6-section OneGrasp Career Assessment.
 *
 * It consumes the section-tagged answers from lib/assessment-questions.ts and
 * produces a PsychometricProfile (the same shape the report renders), plus the
 * new Multiple Intelligences block. Every number in the report is derived here
 * from the student's own answers — there is no per-student hard-coding.
 */

import {
  ALL_QUESTIONS, sectionsForLevel,
  balancedQuestionsForLevel, balancedSectionQuestions, type SamplingProfile,
  type AnswerMap, type Riasec as QRiasec, type Intelligence, type AptitudeSkill,
} from '@/lib/assessment-questions';
import type { AssessmentLevel } from '@/lib/assessment-levels';
import {
  type PsychometricProfile, type Bar, type CareerFit, type MbtiAxis,
  type AnalyticalBreakdown, type DomainFitment, type DomainPenalty, type StreamFit, type SectionScore,
  type Riasec, type Skill, type Eq, type Learning,
  RIASEC_LABELS, MBTI_DESC, SKILL_LABELS, EQ_LABELS, LEARNING_LABELS,
  CAREERS, CLUSTER_BY_RIASEC, clamp, round, ratingFor, levelFor,
} from '@/lib/psychometric';

const INTELLIGENCE_LABELS: Record<Intelligence, string> = {
  linguistic: 'Linguistic (Word Smart)',
  logical: 'Logical–Mathematical (Number Smart)',
  spatial: 'Spatial (Picture Smart)',
  kinesthetic: 'Bodily–Kinesthetic (Body Smart)',
  musical: 'Musical (Music Smart)',
  interpersonal: 'Interpersonal (People Smart)',
  intrapersonal: 'Intrapersonal (Self Smart)',
  naturalist: 'Naturalist (Nature Smart)',
};

/** Share of Yes answers (binary Yes/No) across a set of questions → 0–100 percent.
 *  Order-independent: it checks the chosen option's label, not its index. */
const APTITUDE_LABELS: Record<AptitudeSkill, string> = {
  numerical: 'Numerical reasoning',
  logical: 'Logical reasoning',
  verbal: 'Verbal reasoning',
  spatial: 'Spatial reasoning',
  social: 'Social & co-operation',
  mechanical: 'Mechanical reasoning',
  administrative: 'Administrative & detail',
  leadership: 'Leadership & decision-making',
};

type DomainWeights = { interest: number; aptitude: number; intelligence: number; personality: number; motivator: number; eq: number };
type DomainPenaltyRule = { skill: AptitudeSkill; threshold: number; factor: number; reason: string };
type StreamWeights = { science: number; commerce: number; humanities: number };

const DEFAULT_DOMAIN_WEIGHTS: DomainWeights = { interest: 0.26, aptitude: 0.24, intelligence: 0.16, personality: 0.1, motivator: 0.1, eq: 0.14 };

const DOMAIN_MODELS: {
  key: string;
  label: string;
  focus: string;
  riasec: Riasec[];
  skills: Skill[];
  intelligences: Intelligence[];
  eq: Eq[];
  motivators: string[];
  clusters: string[];
  /** Per-domain component weights (sum ≈ 1). */
  weights: DomainWeights;
  /** Favourable MBTI poles for this domain. */
  mbtiPositive: string[];
  /** Aptitude skills (from the Analytical section) this domain depends on, primary first. */
  aptitude: AptitudeSkill[];
  /** Eligibility floors — a critical aptitude below threshold multiplies the score by factor. */
  penalties: DomainPenaltyRule[];
  /** Stream affinity (0–100) used by the stream-recommendation layer. */
  streams: StreamWeights;
  /** Recommended careers within the domain. */
  careers: string[];
}[] = [
  {
    key: 'engineering-technology',
    label: 'Engineering & Technology',
    focus: 'Systems thinking, design logic, technical build, and applied problem solving.',
    riasec: ['R', 'I', 'C'],
    skills: ['logical', 'numerical', 'spatial', 'mechanical'],
    intelligences: ['logical', 'spatial', 'kinesthetic'],
    eq: ['motivation'],
    motivators: ['continuous-learning', 'structure'],
    clusters: ['Engineering & Technology', 'Information Technology', 'Design & Architecture'],
    weights: { interest: 0.22, aptitude: 0.35, intelligence: 0.15, personality: 0.1, motivator: 0.1, eq: 0.08 },
    mbtiPositive: ['N', 'T'],
    aptitude: ['logical', 'numerical', 'spatial'],
    penalties: [
      { skill: 'logical', threshold: 50, factor: 0.7, reason: 'Logical reasoning below 50% — core to engineering' },
      { skill: 'numerical', threshold: 40, factor: 0.75, reason: 'Numerical reasoning below 40% — a core engineering requirement' },
    ],
    streams: { science: 90, commerce: 20, humanities: 10 },
    careers: ['Software Engineer', 'Mechanical Engineer', 'Civil Engineer', 'Electronics Engineer', 'Data Engineer', 'Robotics Engineer'],
  },
  {
    key: 'research-analytics',
    label: 'Research & Analytics',
    focus: 'Investigation, experimentation, evidence, and analytical modelling.',
    riasec: ['I', 'C', 'A'],
    skills: ['logical', 'numerical', 'verbal'],
    intelligences: ['logical', 'linguistic', 'intrapersonal'],
    eq: ['selfAwareness', 'motivation'],
    motivators: ['continuous-learning', 'independence'],
    clusters: ['Science & Research', 'Information Technology', 'Health Science'],
    weights: { interest: 0.28, aptitude: 0.3, intelligence: 0.16, personality: 0.1, motivator: 0.1, eq: 0.06 },
    mbtiPositive: ['N', 'T'],
    aptitude: ['logical', 'numerical'],
    penalties: [
      { skill: 'logical', threshold: 50, factor: 0.75, reason: 'Logical reasoning below 50% — research depends on it' },
      { skill: 'numerical', threshold: 30, factor: 0.85, reason: 'Numerical reasoning below 30%' },
    ],
    streams: { science: 80, commerce: 60, humanities: 40 },
    careers: ['Data Analyst', 'Research Associate', 'Statistician', 'Market Research Analyst', 'Business Intelligence Analyst', 'UX Researcher'],
  },
  {
    key: 'psychology-human-behaviour',
    label: 'Psychology & Human Behaviour',
    focus: 'People insight, listening, reflection, and behaviour science.',
    riasec: ['S', 'I', 'A'],
    skills: ['social', 'verbal', 'logical'],
    intelligences: ['interpersonal', 'intrapersonal', 'linguistic'],
    eq: ['empathy', 'relationship', 'selfAwareness'],
    motivators: ['social-service', 'continuous-learning'],
    clusters: ['Human Service', 'Education & Training', 'Healthcare'],
    weights: { interest: 0.3, aptitude: 0.12, intelligence: 0.15, personality: 0.13, motivator: 0.15, eq: 0.15 },
    mbtiPositive: ['F', 'N'],
    aptitude: ['verbal', 'logical'],
    penalties: [
      { skill: 'verbal', threshold: 25, factor: 0.8, reason: 'Verbal reasoning below 25% — communication is core to psychology' },
    ],
    streams: { science: 60, commerce: 40, humanities: 80 },
    careers: ['Counsellor', 'Clinical Psychologist', 'HR Specialist', 'Behavioural Analyst', 'School Counsellor', 'Organisational Psychologist'],
  },
  {
    key: 'arts-design-culture',
    label: 'Arts, Design & Culture',
    focus: 'Creative expression, visual thinking, storytelling, and cultural production.',
    riasec: ['A', 'S', 'E'],
    skills: ['spatial', 'verbal', 'social'],
    intelligences: ['spatial', 'linguistic', 'musical'],
    eq: ['empathy'],
    motivators: ['creativity', 'independence'],
    clusters: ['Arts & Media', 'Media & Communication', 'Design & Architecture'],
    weights: { interest: 0.35, aptitude: 0.1, intelligence: 0.2, personality: 0.13, motivator: 0.15, eq: 0.07 },
    mbtiPositive: ['N', 'F'],
    aptitude: ['verbal', 'spatial'],
    penalties: [],
    streams: { science: 20, commerce: 40, humanities: 90 },
    careers: ['Graphic Designer', 'Content Writer', 'Journalist', 'Film-maker', 'UX/UI Designer', 'Animator'],
  },
  {
    key: 'business-entrepreneurship',
    label: 'Business & Entrepreneurship',
    focus: 'Leadership, influence, growth strategy, and execution under ambiguity.',
    riasec: ['E', 'C', 'S'],
    skills: ['leadership', 'verbal', 'organizing'],
    intelligences: ['interpersonal', 'logical'],
    eq: ['relationship', 'motivation'],
    motivators: ['independence', 'high-paced'],
    clusters: ['Business Management', 'Marketing & Advertising', 'Entrepreneurship'],
    weights: { interest: 0.25, aptitude: 0.22, intelligence: 0.15, personality: 0.15, motivator: 0.15, eq: 0.08 },
    mbtiPositive: ['E', 'J'],
    aptitude: ['numerical', 'logical'],
    penalties: [
      { skill: 'numerical', threshold: 30, factor: 0.8, reason: 'Numerical below 30% — business needs basic quantitative skills' },
    ],
    streams: { science: 35, commerce: 90, humanities: 45 },
    careers: ['Marketing Manager', 'Entrepreneur', 'Operations Manager', 'Business Development Manager', 'Brand Strategist', 'Product Manager'],
  },
  {
    key: 'finance-strategy',
    label: 'Finance & Strategy',
    focus: 'Commercial judgment, numbers, systems, and structured decision making.',
    riasec: ['C', 'E', 'I'],
    skills: ['numerical', 'logical', 'organizing'],
    intelligences: ['logical', 'intrapersonal'],
    eq: ['managingEmotions'],
    motivators: ['structure', 'high-paced'],
    clusters: ['Accounts & Finance', 'Government & Legal', 'Administration'],
    weights: { interest: 0.2, aptitude: 0.4, intelligence: 0.14, personality: 0.1, motivator: 0.1, eq: 0.06 },
    mbtiPositive: ['T', 'J'],
    aptitude: ['numerical', 'logical'],
    penalties: [
      { skill: 'numerical', threshold: 40, factor: 0.6, reason: 'Numerical reasoning below 40% — finance requires strong quantitative ability' },
      { skill: 'logical', threshold: 40, factor: 0.75, reason: 'Logical reasoning below 40%' },
    ],
    streams: { science: 50, commerce: 90, humanities: 30 },
    careers: ['Financial Analyst', 'Chartered Accountant', 'Investment Banker', 'Management Consultant', 'Actuary', 'Risk Analyst'],
  },
  {
    key: 'education-social-impact',
    label: 'Education & Social Impact',
    focus: 'Teaching, guidance, communication, and mission-driven contribution.',
    riasec: ['S', 'A', 'E'],
    skills: ['verbal', 'social', 'organizing'],
    intelligences: ['linguistic', 'interpersonal'],
    eq: ['empathy', 'relationship'],
    motivators: ['social-service', 'continuous-learning'],
    clusters: ['Education & Training', 'Human Service', 'Healthcare'],
    weights: { interest: 0.3, aptitude: 0.1, intelligence: 0.15, personality: 0.15, motivator: 0.2, eq: 0.1 },
    mbtiPositive: ['F', 'E'],
    aptitude: ['verbal', 'logical'],
    penalties: [],
    streams: { science: 40, commerce: 40, humanities: 85 },
    careers: ['Teacher / Educator', 'NGO Programme Manager', 'Social Worker', 'Corporate Trainer', 'Education Policy Analyst', 'EdTech Content Creator'],
  },
  {
    key: 'health-life-sciences',
    label: 'Health & Life Sciences',
    focus: 'Care, diagnosis, evidence, and disciplined service.',
    riasec: ['I', 'S', 'C'],
    skills: ['logical', 'social', 'organizing'],
    intelligences: ['logical', 'naturalist', 'interpersonal'],
    eq: ['empathy', 'managingEmotions'],
    motivators: ['social-service', 'structure'],
    clusters: ['Health Science', 'Healthcare', 'Science & Research'],
    weights: { interest: 0.3, aptitude: 0.25, intelligence: 0.14, personality: 0.1, motivator: 0.15, eq: 0.06 },
    mbtiPositive: ['F', 'J'],
    aptitude: ['logical', 'numerical'],
    penalties: [
      { skill: 'logical', threshold: 40, factor: 0.75, reason: 'Logical reasoning below 40% — sciences need structured thinking' },
    ],
    streams: { science: 90, commerce: 15, humanities: 20 },
    careers: ['Doctor (MBBS)', 'Pharmacist', 'Biotechnologist', 'Nutritionist', 'Physiotherapist', 'Public Health Officer'],
  },
];

const STREAM_LABELS: Record<keyof StreamWeights, string> = { science: 'Science', commerce: 'Commerce', humanities: 'Humanities' };

const AXIS_STRENGTHS: Record<string, string> = {
  I: 'Thoughtful independent focus',
  E: 'High social drive and collaboration',
  S: 'Practical execution and detail awareness',
  N: 'Pattern recognition and future thinking',
  T: 'Objective decision discipline',
  F: 'People-sensitive judgment',
  J: 'Planning and follow-through',
  P: 'Adaptability and option scanning',
};

const QUESTION_BY_ID: Record<string, (typeof ALL_QUESTIONS)[number]> =
  Object.fromEntries(ALL_QUESTIONS.map((q) => [q.id, q]));
const average = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);
function ynsPercent(ids: string[], a: AnswerMap): number {
  if (!ids.length) return 0;
  const yes = ids.reduce((s, id) => {
    const sel = a[id];
    const label = sel === undefined ? undefined : QUESTION_BY_ID[id]?.options[sel]?.label;
    return s + (label === 'Yes' ? 1 : 0);
  }, 0);
  return clamp((yes / ids.length) * 100);
}
/** Reverse-aware Yes/No endorsement share over *answered* items (0–100).
 *  A "Yes" on a reverse-keyed item counts against the trait. */
function endorsePercent(qs: (typeof ALL_QUESTIONS)[number][], a: AnswerMap): number {
  let answered = 0; let positive = 0;
  qs.forEach((q) => {
    const sel = a[q.id];
    if (sel === undefined) return;
    answered += 1;
    const yes = q.options[sel]?.label === 'Yes';
    if (q.reverse ? !yes : yes) positive += 1;
  });
  return answered ? clamp((positive / answered) * 100) : 0;
}
/**
 * Spearman–Brown projected reliability for a k-item scale, assuming a typical
 * single-item reliability r1. Returns 0–1. More items → higher reliability.
 */
function reliabilityOf(k: number, r1 = 0.3): number {
  if (k <= 0) return 0;
  return (k * r1) / (1 + (k - 1) * r1);
}
function clampIdx(v: number | undefined, max: number) {
  const n = Math.round(Number.isFinite(v as number) ? (v as number) : 0);
  return Math.max(0, Math.min(max, n));
}

/**
 * Compress a raw 0–100 share toward the middle so coarse binary/forced-choice
 * items never produce absolute 0% or 100% scores (which read as fake). The
 * transform is monotonic, so it preserves the ranking between traits.
 * raw 0→13, 50→50, 100→87.
 */
function normalize(raw: number): number {
  return clamp(Math.round(50 + (raw - 50) * 0.74));
}
/** Five-band label for a normalized 0–100 score. */
export function scoreBand(p: number): 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High' {
  if (p >= 80) return 'Very High';
  if (p >= 64) return 'High';
  if (p >= 46) return 'Moderate';
  if (p >= 32) return 'Low';
  return 'Very Low';
}

export function scoreAssessment(answers: AnswerMap, name?: string, dreamCareer?: string, level: AssessmentLevel = 'secondary', sampling: SamplingProfile = 'standard'): PsychometricProfile {
  const LQ = balancedQuestionsForLevel(level, sampling);
  const qFor = (id: Parameters<typeof balancedSectionQuestions>[1]) => balancedSectionQuestions(level, id, sampling);
  const answeredTotal = LQ.filter((q) => answers[q.id] !== undefined).length;
  const coverage = clamp((answeredTotal / Math.max(1, LQ.length)) * 100);

  /* ---------- 1. PERSONALITY (MBTI) ---------- */
  const personalityQ = qFor('personality');
  const axisTally: Record<MbtiAxis, Record<string, number>> = {
    EI: { E: 0, I: 0 }, SN: { S: 0, N: 0 }, TF: { T: 0, F: 0 }, JP: { J: 0, P: 0 },
  };
  personalityQ.forEach((q) => {
    const sel = answers[q.id];
    if (sel === undefined || !q.axis || !q.poles) return;
    const letter = q.poles[clampIdx(sel, 1)];
    axisTally[q.axis][letter] = (axisTally[q.axis][letter] ?? 0) + 1;
  });
  const AXIS_DEF: { axis: MbtiAxis; left: string; right: string; leftL: string; rightL: string }[] = [
    { axis: 'EI', left: 'Introvert', right: 'Extrovert', leftL: 'I', rightL: 'E' },
    { axis: 'SN', left: 'iNtuitive', right: 'Sensing', leftL: 'N', rightL: 'S' },
    { axis: 'TF', left: 'Feeling', right: 'Thinking', leftL: 'F', rightL: 'T' },
    { axis: 'JP', left: 'Perceiving', right: 'Judging', leftL: 'P', rightL: 'J' },
  ];
  const mbtiAxes = AXIS_DEF.map(({ axis, left, right, leftL, rightL }) => {
    const total = (axisTally[axis][leftL] ?? 0) + (axisTally[axis][rightL] ?? 0) || 1;
    const rightPct = normalize(((axisTally[axis][rightL] ?? 0) / total) * 100);
    const leftPct = 100 - rightPct;
    const dominant = rightPct >= leftPct ? right : left;
    return { axis, left, right, leftPct, rightPct, dominant };
  });
  const letterFor = (a: { axis: MbtiAxis; dominant: string }) => {
    switch (a.axis) {
      case 'EI': return a.dominant === 'Extrovert' ? 'E' : 'I';
      case 'SN': return a.dominant === 'Sensing' ? 'S' : 'N';
      case 'TF': return a.dominant === 'Thinking' ? 'T' : 'F';
      default: return a.dominant === 'Judging' ? 'J' : 'P';
    }
  };
  const mbtiType = mbtiAxes.map(letterFor).join('');
  const personalityBullets = mbtiType.split('').flatMap((c) => MBTI_DESC[c] ?? []);
  const jPct = mbtiAxes.find((a) => a.axis === 'JP')!.rightPct;
  const ePct = mbtiAxes.find((a) => a.axis === 'EI')!.rightPct;

  /* ---------- 2. INTERESTS (RIASEC) ---------- */
  const riasecKeys: Riasec[] = ['R', 'I', 'A', 'S', 'E', 'C'];
  const riasecPct: Record<Riasec, number> = {} as Record<Riasec, number>;
  riasecKeys.forEach((k) => {
    const qs = qFor('interests').filter((q) => q.riasec === (k as QRiasec));
    riasecPct[k] = normalize(endorsePercent(qs, answers));
  });
  const interests: Bar[] = riasecKeys
    .map((k) => ({ key: k, label: RIASEC_LABELS[k], percent: riasecPct[k] }))
    .sort((a, b) => b.percent - a.percent);
  const topInterests = interests.slice(0, 3).map((i) => i.label);
  const topCode = interests.slice(0, 3).map((i) => i.key as Riasec);

  /* ---------- 5. MULTIPLE INTELLIGENCES (used by skills too) ---------- */
  const intKeys: Intelligence[] = ['linguistic', 'logical', 'spatial', 'kinesthetic', 'musical', 'interpersonal', 'intrapersonal', 'naturalist'];
  const intPct: Record<Intelligence, number> = {} as Record<Intelligence, number>;
  intKeys.forEach((k) => {
    const qs = qFor('intelligences').filter((q) => q.intelligence === k);
    intPct[k] = normalize(endorsePercent(qs, answers));
  });
  const intelligences = intKeys
    .map((k) => ({ key: k, label: INTELLIGENCE_LABELS[k], percent: intPct[k], level: levelFor(intPct[k]) }))
    .sort((a, b) => b.percent - a.percent);
  const dominantIntelligence = intelligences[0]?.label ?? '';

  /* ---------- 6. ANALYTICAL & LOGICAL (aptitude correctness) ---------- */
  const analyticalQuestions = qFor('analytical');
  const aptPct: Record<AptitudeSkill, number> = {
    numerical: 0, logical: 0, verbal: 0, spatial: 0,
    social: 0, mechanical: 0, administrative: 0, leadership: 0,
  };
  // Skills actually present in this level's aptitude section, in first-seen order.
  const aptKeys: AptitudeSkill[] = [];
  analyticalQuestions.forEach((q) => { if (q.skill && !aptKeys.includes(q.skill)) aptKeys.push(q.skill); });
  const analyticalBreakdown: AnalyticalBreakdown[] = [];
  aptKeys.forEach((k) => {
    const qs = analyticalQuestions.filter((q) => q.skill === k);
    if (!qs.length) {
      aptPct[k] = 0;
      analyticalBreakdown.push({ key: k, label: APTITUDE_LABELS[k], correct: 0, total: 0, percent: 0 });
      return;
    }
    const correct = qs.reduce((s, q) => s + (answers[q.id] === q.correct ? 1 : 0), 0);
    const percent = normalize((correct / qs.length) * 100);
    aptPct[k] = percent;
    analyticalBreakdown.push({ key: k, label: APTITUDE_LABELS[k], correct, total: qs.length, percent });
  });
  analyticalBreakdown.sort((a, b) => b.percent - a.percent);
  const analyticalCorrect = analyticalQuestions.reduce((s, q) => s + (answers[q.id] === q.correct ? 1 : 0), 0);
  const analyticalTotal = analyticalQuestions.length;

  /* ---------- SKILLS & ABILITIES ----------
   * Measured aptitude (numerical/logical/verbal/spatial) blended with the
   * matching interests and intelligences so the bars reflect the whole test. */
  const skillRaw: Record<Skill, number> = {
    numerical: 0.6 * aptPct.numerical + 0.4 * intPct.logical,
    logical: 0.6 * aptPct.logical + 0.4 * intPct.logical,
    verbal: 0.6 * aptPct.verbal + 0.4 * intPct.linguistic,
    spatial: 0.5 * aptPct.spatial + 0.3 * intPct.spatial + 0.2 * riasecPct.A,
    organizing: 0.5 * riasecPct.C + 0.5 * jPct,
    leadership: 0.55 * riasecPct.E + 0.45 * intPct.interpersonal,
    social: 0.6 * intPct.interpersonal + 0.4 * riasecPct.S,
    mechanical: 0.55 * riasecPct.R + 0.25 * intPct.kinesthetic + 0.2 * aptPct.spatial,
  };
  const skillKeys: Skill[] = ['numerical', 'logical', 'verbal', 'organizing', 'spatial', 'leadership', 'social', 'mechanical'];
  const skillPct: Record<Skill, number> = {} as Record<Skill, number>;
  skillKeys.forEach((s) => { skillPct[s] = clamp(skillRaw[s]); });
  const skills = skillKeys
    .map((s) => ({ key: s, label: SKILL_LABELS[s], percent: skillPct[s], rating: ratingFor(skillPct[s]) }))
    .sort((a, b) => b.percent - a.percent);
  const overallSkills = clamp(skillKeys.reduce((s, x) => s + skillPct[x], 0) / skillKeys.length);

  /* ---------- 3. MOTIVATORS (Always..Definitely No → 3..0) ---------- */
  const motDef: { key: string; label: string; mid: string }[] = [
    { key: 'independence', label: 'Independence', mid: 'm_ind' },
    { key: 'structure', label: 'Structured work environment', mid: 'm_struct' },
    { key: 'continuous-learning', label: 'Continuous Learning', mid: 'm_learn' },
    { key: 'creativity', label: 'Creativity', mid: 'm_create' },
    { key: 'adventure', label: 'Adventure', mid: 'm_adv' },
    { key: 'social-service', label: 'Social Service', mid: 'm_social' },
    { key: 'high-paced', label: 'High Paced Environment', mid: 'm_pace' },
  ];
  const motivators: Bar[] = motDef
    .map((m) => {
      const sel = answers[m.mid];
      // Always=0..DefinitelyNo=3 → invert so Always scores highest.
      const score = sel === undefined ? 0 : (3 - clampIdx(sel, 3));
      return { key: m.key, label: m.label, percent: clamp((score / 3) * 100) };
    })
    .sort((a, b) => b.percent - a.percent);

  /* ---------- 4. LEARNING STYLES (VARK) ---------- */
  const varkCount: Record<Learning, number> = { visual: 0, auditory: 0, readWrite: 0, kinesthetic: 0 };
  const VARK_MAP: Record<string, Learning> = { V: 'visual', A: 'auditory', R: 'readWrite', K: 'kinesthetic' };
  qFor('learning').forEach((q) => {
    const sel = answers[q.id];
    if (sel === undefined) return;
    const tag = q.options[sel]?.vark;
    if (tag) varkCount[VARK_MAP[tag]] += 1;
  });
  const learnKeys: Learning[] = ['visual', 'auditory', 'readWrite', 'kinesthetic'];
  const varkTotal = learnKeys.reduce((s, x) => s + varkCount[x], 0) || 1;
  const learning: Bar[] = learnKeys
    .map((key) => ({ key, label: LEARNING_LABELS[key], percent: round((varkCount[key] / varkTotal) * 100) }))
    .sort((a, b) => b.percent - a.percent);
  const dominantLearning = learning[0].label;

  /* ---------- EQ (derived from intelligences + personality) ---------- */
  const eqRaw: Record<Eq, number> = {
    selfAwareness: intPct.intrapersonal,
    managingEmotions: 0.6 * intPct.intrapersonal + 0.4 * jPct,
    motivation: 0.5 * intPct.intrapersonal + 0.5 * riasecPct.E,
    empathy: 0.7 * intPct.interpersonal + 0.3 * riasecPct.S,
    relationship: 0.6 * intPct.interpersonal + 0.4 * ePct,
  };
  const eqKeys: Eq[] = ['selfAwareness', 'managingEmotions', 'motivation', 'empathy', 'relationship'];
  // If this level has a real EQ section, score it directly (5-point Likert,
  // index 0 = "Completely true"). Reverse-scored items are inverted.
  const eqQuestions = qFor('eq');
  if (eqQuestions.length) {
    (eqKeys as Eq[]).forEach((key) => {
      const qs = eqQuestions.filter((q) => q.eqKey === key);
      const vals = qs
        .map((q) => {
          const idx = answers[q.id];
          if (idx === undefined) return null;
          const max = Math.max(1, q.options.length - 1);
          const agree = 1 - idx / max; // 1 = completely true … 0 = completely false
          return (q.reverse ? 1 - agree : agree) * 100;
        })
        .filter((v): v is number => v !== null);
      if (vals.length) eqRaw[key] = average(vals);
    });
  }
  const eq = eqKeys.map((key) => {
    const percent = normalize(eqRaw[key]);
    return { key, label: EQ_LABELS[key], percent, level: levelFor(percent) };
  });

  /* ---------- MOTIVATOR-influenced clusters & careers ---------- */
  const clusterScore: Record<string, number> = {};
  topCode.forEach((code, idx) => {
    CLUSTER_BY_RIASEC[code].forEach((cl) => {
      clusterScore[cl] = (clusterScore[cl] ?? 0) + (3 - idx) * 10 + riasecPct[code] / 5;
    });
  });
  // Upper levels: boost clusters from the student's direct work-fit & career-field interest.
  const addCluster = (cl: string, pts: number) => { clusterScore[cl] = (clusterScore[cl] ?? 0) + pts; };
  qFor('workfit').forEach((q) => {
    if (!q.cluster) return;
    const sel = answers[q.id];
    if (sel !== undefined && q.options[sel]?.label === 'Yes') addCluster(q.cluster, 22);
  });
  qFor('careerfields').forEach((q) => {
    if (!q.cluster) return;
    const sel = answers[q.id];
    const label = sel === undefined ? undefined : q.options[sel]?.label;
    if (label === 'Yes') addCluster(q.cluster, 26);
    else if (label === 'Not sure') addCluster(q.cluster, 8);
  });
  const clusters: Bar[] = Object.entries(clusterScore)
    .map(([label, v]) => ({ key: label, label, percent: clamp(v, 0, 98) }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 8);

  const careerScored = CAREERS.map((c) => {
    let interestFit = 0; let wsum = 0;
    c.code.forEach((code, idx) => { const w = 3 - idx; interestFit += (riasecPct[code] ?? 0) * w; wsum += w; });
    interestFit = interestFit / (wsum || 1);
    const skillFit = c.skills.reduce((s, sk) => s + (skillPct[sk] ?? 0), 0) / c.skills.length;
    let match = round(interestFit * 0.6 + skillFit * 0.4);
    return { ...c, match };
  }).sort((a, b) => b.match - a.match);

  const verdictFor = (m: number): CareerFit['verdict'] =>
    m >= 78 ? 'Top Choice' : m >= 66 ? 'Good Choice' : m >= 52 ? 'Optional' : m >= 42 ? 'Develop' : 'Avoid';
  const topCareers: CareerFit[] = answeredTotal > 0 ? careerScored.slice(0, 6).map((c) => ({
    title: c.title, roles: c.roles, cluster: c.cluster, match: c.match, verdict: verdictFor(c.match),
  })) : [];
  const careerFocus = answeredTotal > 0 ? careerScored[0]?.title ?? 'Explorer' : 'Answer more questions to unlock career recommendations';
  const favoritePath = careerFocus;

  /* ---------- OVERALL & narrative ---------- */
  const overallScore = answeredTotal === 0 ? 0 : clamp(
    overallSkills * 0.35 + (interests[0]?.percent ?? 0) * 0.25 +
    (intelligences[0]?.percent ?? 0) * 0.2 +
    (eq.reduce((s, e) => s + e.percent, 0) / eq.length) * 0.2
  );
  const matchLabel = answeredTotal === 0 ? 'Insufficient data' : overallScore >= 80 ? 'Future-Ready' : overallScore >= 66 ? 'Clarity' : overallScore >= 50 ? 'Exploring' : 'Getting Started';

  // Consistency rule: only call something a "strength" if it actually scores well.
  // This stops e.g. a 30%-spatial profile from listing Spatial as a top strength.
  const STRONG_FLOOR = 55;
  const strengths = [
    ...skills.filter((s) => s.percent >= STRONG_FLOOR).slice(0, 2).map((s) => `${s.label.replace(' & Decision Making', '').replace(' Ability', '')} (${s.rating})`),
    ...(intelligences[0] && intelligences[0].percent >= STRONG_FLOOR ? [`${intelligences[0].label.split(' (')[0]} intelligence`] : []),
    ...(mbtiType ? [mbtiType.includes('J') ? 'Organised and dependable' : 'Adaptable and flexible'] : []),
  ];
  if (strengths.length === 0) {
    strengths.push('A balanced profile — no single area stands out strongly yet. Keep building through practice and real projects.');
  }
  const lowSkills = skills.filter((s) => s.percent < 55).slice(-2).map((s) => s.label);
  const lowEq = eq.filter((e) => e.level === 'Low').map((e) => e.label);
  const gaps = answeredTotal === 0 ? [
    'Answer the assessment questions first — that is the fair way to get a career recommendation.',
    'Right now there is no answer data, so the engine should not guess a career path.',
  ] : [
    ...lowSkills.map((s) => `Build your ${s.toLowerCase()} — it is below the level your top careers need.`),
    ...lowEq.map((e) => `Develop your ${e.toLowerCase()} for stronger professional relationships.`),
    `Gain real exposure to ${careerFocus} through projects, internships or shadowing.`,
  ].slice(0, 4);
  const nextSteps = answeredTotal === 0 ? [
    'Go back and answer the 6-section assessment to unlock accurate recommendations.',
    'A career report without answers would be guesswork, not guidance.',
    'After you answer, the report will show your strongest pathways and next steps.',
  ] : [
    `Explore the day-to-day reality of ${topCareers[0]?.title} and ${topCareers[1]?.title}.`,
    `Pick subjects / courses that build towards ${topCareers[0]?.cluster}.`,
    `Strengthen your ${skills[skills.length - 1].label.toLowerCase()} with weekly practice.`,
    `Talk to a OneGrasp counsellor to lock your career execution plan.`,
  ];

  const motivatorPct = Object.fromEntries(motivators.map((item) => [item.key, item.percent])) as Record<string, number>;
  const eqPct = Object.fromEntries(eq.map((item) => [item.key, item.percent])) as Record<Eq, number>;
  const clusterPct = Object.fromEntries(clusters.map((item) => [item.label, item.percent])) as Record<string, number>;
  const axisMargins = mbtiAxes
    .map((axis) => ({ axis, margin: Math.abs(axis.rightPct - axis.leftPct), letter: letterFor(axis) }))
    .sort((a, b) => b.margin - a.margin);

  const sectionScores: SectionScore[] = answeredTotal === 0 ? [] : [
    {
      id: 'personality',
      title: 'Personality',
      score: clamp(average(mbtiAxes.map((axis) => Math.max(axis.leftPct, axis.rightPct)))),
      basis: 'Consistency across your four decision-style axes.',
      strengths: axisMargins.slice(0, 2).map((item) => AXIS_STRENGTHS[item.letter]),
      weaknesses: axisMargins.slice(-2).map((item) => `Balance between ${item.axis.left.toLowerCase()} and ${item.axis.right.toLowerCase()} styles may need deliberate routines.`),
    },
    {
      id: 'interests',
      title: 'Interests',
      score: clamp(average(interests.slice(0, 3).map((item) => item.percent))),
      basis: 'Strength of your dominant RIASEC interest themes.',
      strengths: interests.slice(0, 3).map((item) => `${item.label} interest`),
      weaknesses: interests.slice(-2).map((item) => `Lower natural pull toward ${item.label.toLowerCase()} tasks.`),
    },
    {
      id: 'motivators',
      title: 'Motivators',
      score: clamp(average(motivators.slice(0, 3).map((item) => item.percent))),
      basis: 'Clarity of the work conditions that energise you.',
      strengths: motivators.slice(0, 2).map((item) => `${item.label} is a strong work driver`),
      weaknesses: motivators.slice(-2).map((item) => `${item.label} is less likely to sustain long-term motivation.`),
    },
    {
      id: 'learning',
      title: 'Learning',
      score: clamp((learning[0]?.percent ?? 0) + (learning[1]?.percent ?? 0)),
      basis: 'Concentration of your preferred learning channels.',
      strengths: learning.slice(0, 2).map((item) => `${item.label} supports faster comprehension`),
      weaknesses: learning.slice(-2).map((item) => `${item.label} is a lower-efficiency study mode right now.`),
    },
    {
      id: 'intelligences',
      title: 'Intelligences',
      score: clamp(average(intelligences.slice(0, 3).map((item) => item.percent))),
      basis: 'Strength of your highest multiple-intelligence signals.',
      strengths: intelligences.filter((item) => item.percent >= 50).slice(0, 3).map((item) => `${item.label.split(' (')[0]} intelligence`),
      weaknesses: intelligences.slice(-2).map((item) => `${item.label.split(' (')[0]} is less expressed and may need more deliberate use.`),
    },
    {
      id: 'analytical',
      title: 'Analytical reasoning',
      score: analyticalTotal ? clamp((analyticalCorrect / analyticalTotal) * 100) : 0,
      basis: `${analyticalCorrect}/${analyticalTotal} correct across numerical, logical, verbal, and spatial reasoning.`,
      strengths: analyticalBreakdown.slice(0, 2).map((item) => `${item.label}: ${item.correct}/${item.total} correct`),
      weaknesses: analyticalBreakdown.slice(-2).map((item) => `${item.label} needs more structured practice.`),
    },
  ];

  // Raw (un-normalized) aptitude % per skill — used for realistic eligibility floors.
  const rawAptPct: Partial<Record<AptitudeSkill, number>> = {};
  aptKeys.forEach((k) => {
    const qs = analyticalQuestions.filter((q) => q.skill === k);
    if (qs.length) rawAptPct[k] = (qs.reduce((s, q) => s + (answers[q.id] === q.correct ? 1 : 0), 0) / qs.length) * 100;
  });

  const domainFitments: DomainFitment[] = answeredTotal === 0 ? [] : DOMAIN_MODELS.map((domain) => {
    const w = domain.weights;
    const domainInterestRaw = average(domain.riasec.map((key) => riasecPct[key] ?? 0));
    const domainClusters = average(domain.clusters.map((key) => clusterPct[key] ?? 0));
    // fold the student's direct work-fit / career-field answers into interest
    const domainInterest = clamp(0.75 * domainInterestRaw + 0.25 * domainClusters);
    const domainAptitude = average(domain.aptitude.map((key) => aptPct[key] ?? 0));
    const domainIntelligence = average(domain.intelligences.map((key) => intPct[key] ?? 0));
    const personalityMatch = domain.mbtiPositive.length
      ? (domain.mbtiPositive.filter((p) => mbtiType.includes(p)).length / domain.mbtiPositive.length) * 100
      : 0;
    const domainMotivators = average(domain.motivators.map((key) => motivatorPct[key] ?? 0));
    const domainEq = average(domain.eq.map((key) => eqPct[key] ?? 0));

    const base =
      domainInterest * w.interest +
      domainAptitude * w.aptitude +
      domainIntelligence * w.intelligence +
      personalityMatch * w.personality +
      domainMotivators * w.motivator +
      domainEq * w.eq;

    // Eligibility penalties: a critical aptitude below its floor scales the score down
    // (stops e.g. a low-numerical student getting an unrealistic Finance score).
    const penalties: DomainPenalty[] = [];
    let penaltyMul = 1;
    domain.penalties.forEach((rule) => {
      const actual = rawAptPct[rule.skill];
      if (actual !== undefined && actual < rule.threshold) {
        penaltyMul *= rule.factor;
        penalties.push({ skill: APTITUDE_LABELS[rule.skill], actual: round(actual), threshold: rule.threshold, reason: rule.reason });
      }
    });
    const score = clamp(base * penaltyMul);
    const strongestInterest = domain.riasec
      .map((key) => ({ label: RIASEC_LABELS[key], percent: riasecPct[key] ?? 0 }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 2);
    const strongestSkills = domain.skills
      .map((key) => ({ label: SKILL_LABELS[key].replace(' & Decision Making', '').replace(' Ability', ''), percent: skillPct[key] ?? 0 }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 2);
    const strongestSupport = [...domain.eq.map((key) => EQ_LABELS[key]), ...domain.intelligences.map((key) => INTELLIGENCE_LABELS[key].split(' (')[0])]
      .map((label) => {
        const eqKey = eqKeys.find((key) => EQ_LABELS[key] === label);
        if (eqKey) return { label, percent: eqPct[eqKey] ?? 0 };
        const intKey = intKeys.find((key) => INTELLIGENCE_LABELS[key].startsWith(label));
        return { label, percent: intKey ? intPct[intKey] ?? 0 : 0 };
      })
      .sort((a, b) => b.percent - a.percent)[0];
    const signals = [
      `${strongestInterest.map((item) => item.label).join(' + ')} interests`,
      `${strongestSkills.map((item) => item.label).join(' and ')} capability`,
      strongestSupport ? `${strongestSupport.label} support signal` : '',
    ].filter(Boolean);

    return {
      key: domain.key,
      label: domain.label,
      score,
      focus: domain.focus,
      rationale: `This domain fits because your profile combines ${signals[0]?.toLowerCase() ?? 'relevant interests'}, ${signals[1]?.toLowerCase() ?? 'relevant capability'}, and ${signals[2]?.toLowerCase() ?? 'supportive behavioural evidence'}.`,
      signals,
      careers: domain.careers,
      penalties: penalties.length ? penalties : undefined,
    };
  }).sort((a, b) => b.score - a.score).slice(0, 6);

  /* ---------- STREAM RECOMMENDATION (Science / Commerce / Humanities) ---------- */
  // Aggregate each domain's stream affinity, weighted by its fit, then nudge by
  // the student's actual aptitude + interests so the stream tracks their answers.
  const streamKeys: (keyof StreamWeights)[] = ['science', 'commerce', 'humanities'];
  const streams = answeredTotal === 0 ? undefined : (() => {
    const allFits = DOMAIN_MODELS.map((d) => {
      const f = domainFitments.find((x) => x.key === d.key);
      return { d, fit: f?.score ?? 0 };
    });
    const apt = (k: AptitudeSkill) => aptPct[k] ?? 0;
    const raw: Record<keyof StreamWeights, number> = { science: 0, commerce: 0, humanities: 0 };
    streamKeys.forEach((sk) => {
      let num = 0; let den = 0;
      allFits.forEach(({ d, fit }) => { num += fit * (d.streams[sk] / 100); den += d.streams[sk]; });
      let v = den > 0 ? (num / den) * 100 : 0;
      // aptitude/interest nudge (30%)
      const boost = sk === 'science'
        ? apt('logical') * 0.4 + apt('numerical') * 0.4 + apt('spatial') * 0.2
        : sk === 'commerce'
          ? apt('numerical') * 0.5 + apt('verbal') * 0.3 + apt('logical') * 0.2
          : apt('verbal') * 0.5 + (riasecPct.S ?? 0) * 0.3 + (riasecPct.A ?? 0) * 0.2;
      raw[sk] = clamp(v * 0.7 + boost * 0.3);
    });
    const band = (s: number) => (s >= 70 ? 'Strong fit' : s >= 50 ? 'Moderate fit' : 'Weak fit');
    const scores: StreamFit[] = streamKeys
      .map((sk) => ({ key: sk, label: STREAM_LABELS[sk], score: raw[sk], band: band(raw[sk]) }))
      .sort((a, b) => b.score - a.score);
    return { recommended: scores[0].key, recommendedLabel: scores[0].label, scores };
  })();

  /* ---------- section completion meta + confidence ---------- */
  const sectionMeta = sectionsForLevel(level).map((s) => {
    const qs = qFor(s.id);
    const answered = qs.filter((q) => answers[q.id] !== undefined).length;
    return { id: s.id, title: s.title, answered, total: qs.length };
  });
  // Coverage = how completely the test was answered.
  const confidence = {
    percent: coverage,
    answered: answeredTotal,
    total: LQ.length,
    label: answeredTotal === 0 ? 'No answers yet' : coverage >= 90 ? 'Fully answered' : coverage >= 70 ? 'Mostly answered' : coverage >= 50 ? 'Partly answered' : 'Low — answer more questions',
  };

  /* ---------- MEASUREMENT RELIABILITY (Spearman–Brown) ---------- */
  // Each trait's reliability rises with the number of items the student actually
  // answered for it; the test reliability is the average across all dimensions.
  const answeredCount = (qs: (typeof ALL_QUESTIONS)[number][]) => qs.filter((q) => answers[q.id] !== undefined).length;
  const dimReliabilities: number[] = [];
  riasecKeys.forEach((k) => dimReliabilities.push(reliabilityOf(answeredCount(qFor('interests').filter((q) => q.riasec === (k as QRiasec))))));
  intKeys.forEach((k) => dimReliabilities.push(reliabilityOf(answeredCount(qFor('intelligences').filter((q) => q.intelligence === k)))));
  (['EI', 'SN', 'TF', 'JP'] as MbtiAxis[]).forEach((ax) => dimReliabilities.push(reliabilityOf(answeredCount(personalityQ.filter((q) => q.axis === ax)))));
  motDef.forEach((m) => dimReliabilities.push(reliabilityOf(answeredCount(qFor('motivators').filter((q) => q.motivator === m.key)))));
  aptKeys.forEach((k) => dimReliabilities.push(reliabilityOf(answeredCount(analyticalQuestions.filter((q) => q.skill === k)))));
  if (eqQuestions.length) eqKeys.forEach((k) => dimReliabilities.push(reliabilityOf(answeredCount(eqQuestions.filter((q) => q.eqKey === k)))));
  const evaluated = dimReliabilities.filter((r) => r > 0);
  const reliabilityPct = evaluated.length ? clamp(average(evaluated) * 100) : 0;
  const reliability = {
    percent: reliabilityPct,
    label: answeredTotal === 0 ? 'Not yet measured' : reliabilityPct >= 80 ? 'High' : reliabilityPct >= 65 ? 'Good' : reliabilityPct >= 50 ? 'Moderate' : 'Indicative only',
  };

  /* ---------- RESPONSE QUALITY (attention + reverse-item consistency) ---------- */
  const attentionItems = LQ.filter((q) => q.attentionAnswer);
  let attnEvaluated = 0; let attnPassed = 0;
  attentionItems.forEach((q) => {
    const sel = answers[q.id];
    if (sel === undefined) return;
    attnEvaluated += 1;
    if (q.options[sel]?.label === q.attentionAnswer) attnPassed += 1;
  });
  const attentionPassed = attnEvaluated === 0 || attnPassed === attnEvaluated;

  // Reverse-item consistency: a reverse item should disagree with the trait's
  // normal-item direction. Count how often the student is internally consistent.
  let consistChecks = 0; let consistOk = 0;
  const checkConsistency = (
    section: Parameters<typeof qFor>[0],
    keyOf: (q: (typeof ALL_QUESTIONS)[number]) => string | undefined,
  ) => {
    const qs = qFor(section);
    const byKey: Record<string, { normal: typeof qs; reverse: typeof qs }> = {};
    qs.forEach((q) => {
      const key = keyOf(q);
      if (!key) return;
      byKey[key] ??= { normal: [], reverse: [] };
      (q.reverse ? byKey[key].reverse : byKey[key].normal).push(q);
    });
    Object.values(byKey).forEach(({ normal, reverse }) => {
      if (!reverse.length || !normal.length) return;
      const normalShare = endorsePercent(normal, answers); // 0–100 toward trait
      reverse.forEach((rq) => {
        const sel = answers[rq.id];
        if (sel === undefined) return;
        consistChecks += 1;
        const yes = rq.options[sel]?.label === 'Yes';
        const reverseTowardTrait = !yes; // reverse: "No" = endorses trait
        const expected = normalShare >= 50;
        if (reverseTowardTrait === expected) consistOk += 1;
      });
    });
  };
  checkConsistency('interests', (q) => q.riasec);
  checkConsistency('intelligences', (q) => q.intelligence);
  const consistencyPercent = consistChecks ? Math.round((consistOk / consistChecks) * 100) : 100;

  // Acquiescence / ceiling effect: a student who says "Yes" to almost every
  // Yes/No item produces undifferentiated scores. Measure the raw Yes-rate over
  // the (non-reverse, non-attention) interest + intelligence items.
  const yesNoItems = [...qFor('interests'), ...qFor('intelligences')]
    .filter((q) => !q.reverse && !q.attentionAnswer && (q.riasec || q.intelligence));
  let ynAnswered = 0; let ynYes = 0;
  yesNoItems.forEach((q) => {
    const sel = answers[q.id];
    if (sel === undefined) return;
    ynAnswered += 1;
    if (q.options[sel]?.label === 'Yes') ynYes += 1;
  });
  const yesRate = ynAnswered ? Math.round((ynYes / ynAnswered) * 100) : 0;
  const ceilingEffect = ynAnswered >= 8 && yesRate >= 85;

  const qNotes: string[] = [];
  if (!attentionPassed) qNotes.push('An attention-check question was answered incorrectly.');
  if (consistChecks && consistencyPercent < 75) qNotes.push('Some answers contradicted each other (reverse-worded items).');
  if (ceilingEffect) qNotes.push(`“Yes” was chosen on ${yesRate}% of items, so the scores are less differentiated — read the ranking, not the exact numbers.`);
  if (coverage < 70) qNotes.push('Part of the test was left unanswered.');
  const qualityLevel: 'good' | 'review' | 'low' =
    (!attentionPassed || (consistChecks > 0 && consistencyPercent < 50)) ? 'low'
      : (coverage < 70 || ceilingEffect || (consistChecks > 0 && consistencyPercent < 75)) ? 'review'
        : 'good';
  const dataQuality = {
    level: qualityLevel,
    attentionPassed,
    consistencyPercent,
    notes: qNotes.length ? qNotes : ['Answers look careful and internally consistent.'],
  };

  return {
    kind: 'psychometric',
    name: name?.trim() || 'Student',
    dreamCareer: dreamCareer?.trim() || undefined,
    favoritePath,
    generatedAt: new Date().toISOString(),
    overallScore, matchLabel,
    mbtiType, mbtiAxes, personalityBullets, strengths,
    interests, topInterests, motivators, learning, dominantLearning,
    eq, skills, overallSkills, clusters, topCareers, careerFocus, gaps, nextSteps,
    intelligences, dominantIntelligence, sectionMeta,
    analyticalScore: { correct: analyticalCorrect, total: analyticalTotal },
    analyticalBreakdown,
    sectionScores,
    domainFitments,
    streams,
    confidence,
    reliability,
    dataQuality,
  };
}

export { questionsForLevel, sectionsForLevel } from '@/lib/assessment-questions';
