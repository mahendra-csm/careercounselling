/**
 * Scoring engine for the 6-section OneGrasp Career Assessment.
 *
 * It consumes the section-tagged answers from lib/assessment-questions.ts and
 * produces a PsychometricProfile (the same shape the report renders), plus the
 * new Multiple Intelligences block. Every number in the report is derived here
 * from the student's own answers — there is no per-student hard-coding.
 */

import {
  QUESTIONS, SECTIONS, questionsForSection,
  type AnswerMap, type Riasec as QRiasec, type Intelligence, type AptitudeSkill,
} from '@/lib/assessment-questions';
import {
  type PsychometricProfile, type Bar, type CareerFit, type MbtiAxis,
  type AnalyticalBreakdown, type DomainFitment, type SectionScore,
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
};

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
  },
];

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

const QUESTION_BY_ID: Record<string, (typeof QUESTIONS)[number]> =
  Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
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
function clampIdx(v: number | undefined, max: number) {
  const n = Math.round(Number.isFinite(v as number) ? (v as number) : 0);
  return Math.max(0, Math.min(max, n));
}

export function scoreAssessment(answers: AnswerMap, name?: string, dreamCareer?: string): PsychometricProfile {
  const answeredTotal = QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
  const coverage = clamp((answeredTotal / QUESTIONS.length) * 100);

  /* ---------- 1. PERSONALITY (MBTI) ---------- */
  const personalityQ = questionsForSection('personality');
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
    const rightPct = clamp(((axisTally[axis][rightL] ?? 0) / total) * 100);
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
    const ids = questionsForSection('interests').filter((q) => q.riasec === (k as QRiasec)).map((q) => q.id);
    riasecPct[k] = ynsPercent(ids, answers);
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
    const ids = questionsForSection('intelligences').filter((q) => q.intelligence === k).map((q) => q.id);
    intPct[k] = ynsPercent(ids, answers);
  });
  const intelligences = intKeys
    .map((k) => ({ key: k, label: INTELLIGENCE_LABELS[k], percent: intPct[k], level: levelFor(intPct[k]) }))
    .sort((a, b) => b.percent - a.percent);
  const dominantIntelligence = intelligences[0]?.label ?? '';

  /* ---------- 6. ANALYTICAL & LOGICAL (aptitude correctness) ---------- */
  const aptKeys: AptitudeSkill[] = ['numerical', 'logical', 'verbal', 'spatial'];
  const analyticalQuestions = questionsForSection('analytical');
  const aptPct: Record<AptitudeSkill, number> = { numerical: 0, logical: 0, verbal: 0, spatial: 0 };
  const analyticalBreakdown: AnalyticalBreakdown[] = [];
  aptKeys.forEach((k) => {
    const qs = analyticalQuestions.filter((q) => q.skill === k);
    if (!qs.length) {
      aptPct[k] = 0;
      analyticalBreakdown.push({ key: k, label: APTITUDE_LABELS[k], correct: 0, total: 0, percent: 0 });
      return;
    }
    const correct = qs.reduce((s, q) => s + (answers[q.id] === q.correct ? 1 : 0), 0);
    const percent = clamp((correct / qs.length) * 100);
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
  questionsForSection('learning').forEach((q) => {
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
  const eq = eqKeys.map((key) => {
    const percent = clamp(eqRaw[key]);
    return { key, label: EQ_LABELS[key], percent, level: levelFor(percent) };
  });

  /* ---------- MOTIVATOR-influenced clusters & careers ---------- */
  const clusterScore: Record<string, number> = {};
  topCode.forEach((code, idx) => {
    CLUSTER_BY_RIASEC[code].forEach((cl) => {
      clusterScore[cl] = (clusterScore[cl] ?? 0) + (3 - idx) * 10 + riasecPct[code] / 5;
    });
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

  const strengths = [
    ...skills.slice(0, 2).map((s) => `${s.label.replace(' & Decision Making', '').replace(' Ability', '')} (${s.rating})`),
    `${intelligences[0]?.label.split(' (')[0]} intelligence`,
    mbtiType.includes('J') ? 'Organised and dependable' : 'Adaptable and flexible',
  ];
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
      strengths: intelligences.slice(0, 3).map((item) => `${item.label.split(' (')[0]} intelligence`),
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

  const domainFitments: DomainFitment[] = answeredTotal === 0 ? [] : DOMAIN_MODELS.map((domain) => {
    const domainInterest = average(domain.riasec.map((key) => riasecPct[key] ?? 0));
    const domainSkills = average(domain.skills.map((key) => skillPct[key] ?? 0));
    const domainIntelligence = average(domain.intelligences.map((key) => intPct[key] ?? 0));
    const domainEq = average(domain.eq.map((key) => eqPct[key] ?? 0));
    const domainMotivators = average(domain.motivators.map((key) => motivatorPct[key] ?? 0));
    const domainClusters = average(domain.clusters.map((key) => clusterPct[key] ?? 0));
    const score = clamp(
      domainInterest * 0.24 +
      domainSkills * 0.26 +
      domainIntelligence * 0.16 +
      domainEq * 0.14 +
      domainMotivators * 0.1 +
      domainClusters * 0.1
    );
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
    };
  }).sort((a, b) => b.score - a.score).slice(0, 6);

  /* ---------- section completion meta + confidence ---------- */
  const sectionMeta = SECTIONS.map((s) => {
    const qs = questionsForSection(s.id);
    const answered = qs.filter((q) => answers[q.id] !== undefined).length;
    return { id: s.id, title: s.title, answered, total: qs.length };
  });
  // Reliability of the profile = how completely the test was answered. A fully
  // answered test gives the engine the full signal it needs (≥90% target).
  const confidence = {
    percent: coverage,
    answered: answeredTotal,
    total: QUESTIONS.length,
    label: answeredTotal === 0 ? 'No answers yet' : coverage >= 90 ? 'High reliability' : coverage >= 70 ? 'Good reliability' : coverage >= 50 ? 'Moderate reliability' : 'Low — answer more questions',
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
    confidence,
  };
}

export { QUESTIONS, SECTIONS };
