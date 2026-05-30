/**
 * OneGrasp psychometric engine — 20 career-decision questions.
 *
 * The questions are framed around the student's next 20 years: which domain they
 * want to spend a career in, what genuinely interests them, the kind of work and
 * impact they want. From these 20 answers we compute one personalised profile:
 * MBTI-style personality, RIASEC interests, motivators, learning style, EQ,
 * skills & abilities, career clusters and the best-fit career paths.
 *
 * Answer scale (index): 0 Strongly agree · 1 Agree · 2 Neutral · 3 Disagree · 4 Strongly disagree
 */

export type LikertOptions = string[];
export const AGREE_SCALE: LikertOptions = ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'];

export type MbtiAxis = 'EI' | 'SN' | 'TF' | 'JP';
export type Riasec = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type Eq = 'selfAwareness' | 'managingEmotions' | 'motivation' | 'empathy' | 'relationship';
export type Learning = 'visual' | 'auditory' | 'readWrite' | 'kinesthetic';
export type Skill =
  | 'numerical' | 'logical' | 'verbal' | 'organizing'
  | 'spatial' | 'leadership' | 'social' | 'mechanical';

export interface Question {
  id: string;
  text: string;
  options: LikertOptions;
  group: 'personality' | 'interest' | 'eq' | 'learning' | 'skill';
  axis?: MbtiAxis;
  riasec?: Riasec;
  eq?: Eq;
  learning?: Learning;
  skill?: Skill;
}

function agreePoints(value: number) {
  return Math.max(0, 4 - clampInt(value, 0, 4));
}
function clampInt(n: number, lo: number, hi: number) {
  n = Math.round(Number.isFinite(n) ? n : 2);
  return Math.max(lo, Math.min(hi, n));
}

// 20 career-focused questions.
export const QUESTIONS: Question[] = [
  // --- the kind of work you want for the next 20 years (RIASEC) ---
  { id: 'i1', text: 'For the next 20 years, I would love a career building, engineering or working hands-on with machines, devices or structures.', options: AGREE_SCALE, group: 'interest', riasec: 'R' },
  { id: 'i2', text: 'A career spent researching, analysing data and solving complex technical or scientific problems would excite me.', options: AGREE_SCALE, group: 'interest', riasec: 'I' },
  { id: 'i3', text: 'I am drawn to understanding how things really work — technology, science, systems — more than most other things.', options: AGREE_SCALE, group: 'interest', riasec: 'I' },
  { id: 'i4', text: 'I see my future in a creative field — design, content, media, writing, music or the arts.', options: AGREE_SCALE, group: 'interest', riasec: 'A' },
  { id: 'i5', text: 'I want a career where I directly help, teach, heal or guide other people.', options: AGREE_SCALE, group: 'interest', riasec: 'S' },
  { id: 'i6', text: 'Making a real, positive difference in people’s lives matters more to me than status or a big salary.', options: AGREE_SCALE, group: 'interest', riasec: 'S' },
  { id: 'i7', text: 'I picture myself leading teams, starting a business or driving big decisions in my career.', options: AGREE_SCALE, group: 'interest', riasec: 'E' },
  { id: 'i8', text: 'I would be happy in a structured career working with numbers, finance, records or well-defined systems.', options: AGREE_SCALE, group: 'interest', riasec: 'C' },

  // --- how you want to choose & shape that career (personality) ---
  { id: 'p1', text: 'I see my future work surrounded by people, clients and teams rather than working mostly alone.', options: AGREE_SCALE, group: 'personality', axis: 'EI' },
  { id: 'p2', text: 'When choosing a career path, I trust proven, practical routes over experimental or untested ones.', options: AGREE_SCALE, group: 'personality', axis: 'SN' },
  { id: 'p3', text: 'I would pick a career mainly on logic, growth and pay rather than on feelings or a cause.', options: AGREE_SCALE, group: 'personality', axis: 'TF' },
  { id: 'p4', text: 'I want a clear, structured career plan with defined steps rather than keeping things open-ended.', options: AGREE_SCALE, group: 'personality', axis: 'JP' },

  // --- abilities you would build a career on (skills) ---
  { id: 'k1', text: 'I am strong with numbers, data and quantitative work, and I’d use that in my career.', options: AGREE_SCALE, group: 'skill', skill: 'numerical' },
  { id: 'k2', text: 'I communicate and persuade well through speaking and writing — a strength I want to use at work.', options: AGREE_SCALE, group: 'skill', skill: 'verbal' },
  { id: 'k3', text: 'I can break down hard problems and reason through them logically.', options: AGREE_SCALE, group: 'skill', skill: 'logical' },
  { id: 'k4', text: 'People look to me to take charge and make decisions, and I’d want a career that uses that.', options: AGREE_SCALE, group: 'skill', skill: 'leadership' },

  // --- what drives you (EQ / motivation) ---
  { id: 'q1', text: 'Once I commit to a career goal, I push through setbacks until I reach it.', options: AGREE_SCALE, group: 'eq', eq: 'motivation' },
  { id: 'q2', text: 'I build strong relationships and work well with many different kinds of people.', options: AGREE_SCALE, group: 'eq', eq: 'relationship' },

  // --- how you learn new career skills ---
  { id: 'm1', text: 'I learn a new career skill best by doing real projects, not just reading about it.', options: AGREE_SCALE, group: 'learning', learning: 'kinesthetic' },
  { id: 'm2', text: 'I understand a new field best through visuals, demos and seeing real examples.', options: AGREE_SCALE, group: 'learning', learning: 'visual' },
];

export type AnswerMap = Record<string, number>;

// ---------- Reference data ----------
export const RIASEC_LABELS: Record<Riasec, string> = {
  R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional',
};

const MBTI_DESC: Record<string, string[]> = {
  E: ['You are energised by people and the outer world.', 'You think out loud and act quickly.'],
  I: ['You are energised by reflection and depth.', 'You do your best work with focus and quiet.'],
  S: ['You trust facts, detail and proven paths.', 'You are practical and results-focused.'],
  N: ['You trust patterns, meaning and possibilities.', 'You enjoy big-picture, future thinking.'],
  T: ['You decide with logic, growth and fairness.', 'You value competence and objective analysis.'],
  F: ['You decide with values and people in mind.', 'You are warm, caring and seek positive impact.'],
  J: ['You like structure, plans and clear next steps.', 'You are organised, decisive and reliable.'],
  P: ['You like flexibility and keeping options open.', 'You are adaptable, curious and spontaneous.'],
};

const SKILL_LABELS: Record<Skill, string> = {
  numerical: 'Numerical Ability', logical: 'Logical Ability', verbal: 'Verbal Ability',
  organizing: 'Administrative & Organising Skills', spatial: 'Spatial & Visualisation Ability',
  leadership: 'Leadership & Decision Making', social: 'Social & Co-operation Skills', mechanical: 'Mechanical Abilities',
};
const EQ_LABELS: Record<Eq, string> = {
  selfAwareness: 'Emotional Self Awareness', managingEmotions: 'Managing Emotions',
  motivation: 'Motivation', empathy: 'Empathy', relationship: 'Relationship Management',
};
const LEARNING_LABELS: Record<Learning, string> = {
  visual: 'Visual Learning', auditory: 'Auditory Learning', readWrite: 'Read & Write Learning', kinesthetic: 'Kinesthetic Learning',
};

interface CareerDef { title: string; roles: string; cluster: string; code: Riasec[]; skills: Skill[]; }
const CAREERS: CareerDef[] = [
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

const CLUSTER_BY_RIASEC: Record<Riasec, string[]> = {
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
}

// ---------- helpers ----------
const round = (n: number) => Math.round(n);
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, round(n)));
function ratingFor(p: number) { return p >= 80 ? 'Excellent' : p >= 67 ? 'Good' : p >= 50 ? 'Average' : 'Needs work'; }
function levelFor(p: number): 'Low' | 'Medium' | 'High' { return p >= 66 ? 'High' : p >= 45 ? 'Medium' : 'Low'; }

export function scorePsychometric(answers: AnswerMap, name?: string, dreamCareer?: string): PsychometricProfile {
  const get = (id: string) => agreePoints(answers[id] ?? 2);
  const gp = (id: string) => (get(id) / 4) * 100; // single-question percent 0-100

  // --- interests (dynamic counts per RIASEC) ---
  const riasecKeys: Riasec[] = ['R', 'I', 'A', 'S', 'E', 'C'];
  const riasecQ: Record<Riasec, string[]> = { R: [], I: [], A: [], S: [], E: [], C: [] };
  QUESTIONS.filter((q) => q.group === 'interest').forEach((q) => riasecQ[q.riasec!].push(q.id));
  const riasecPct: Record<Riasec, number> = {} as Record<Riasec, number>;
  riasecKeys.forEach((k) => {
    const ids = riasecQ[k];
    const raw = ids.reduce((s, id) => s + get(id), 0);
    riasecPct[k] = ids.length ? clamp((raw / (ids.length * 4)) * 100) : 0;
  });
  const interests: Bar[] = riasecKeys
    .map((k) => ({ key: k, label: RIASEC_LABELS[k], percent: riasecPct[k] }))
    .sort((a, b) => b.percent - a.percent);
  const topInterests = interests.slice(0, 3).map((i) => i.label);
  const topCode = interests.slice(0, 3).map((i) => i.key as Riasec);

  // --- personality (single question per axis) ---
  const axisDefs: { axis: MbtiAxis; left: string; right: string; q: string; agreeToward: 'left' | 'right' }[] = [
    { axis: 'EI', left: 'Introvert', right: 'Extrovert', q: 'p1', agreeToward: 'right' },
    { axis: 'SN', left: 'iNtuitive', right: 'Sensing', q: 'p2', agreeToward: 'right' },
    { axis: 'TF', left: 'Thinking', right: 'Feeling', q: 'p3', agreeToward: 'left' },
    { axis: 'JP', left: 'Perceiving', right: 'Judging', q: 'p4', agreeToward: 'right' },
  ];
  const mbtiAxes = axisDefs.map(({ axis, left, right, q, agreeToward }) => {
    const frac = get(q) / 4; // 1 = fully agree
    const rightPct = clamp((agreeToward === 'right' ? frac : 1 - frac) * 100);
    const leftPct = 100 - rightPct;
    const dominant = rightPct >= leftPct ? right : left;
    return { axis, left, right, leftPct, rightPct, dominant };
  });
  const letterFor = (a: { axis: MbtiAxis; dominant: string }) => {
    switch (a.axis) {
      case 'EI': return a.dominant === 'Extrovert' ? 'E' : 'I';
      case 'SN': return a.dominant === 'Sensing' ? 'S' : 'N';
      case 'TF': return a.dominant === 'Feeling' ? 'F' : 'T';
      default: return a.dominant === 'Judging' ? 'J' : 'P';
    }
  };
  const mbtiType = mbtiAxes.map(letterFor).join('');
  const personalityBullets = mbtiType.split('').flatMap((c) => MBTI_DESC[c] ?? []);
  const jPct = mbtiAxes.find((a) => a.axis === 'JP')!.rightPct;
  const ePct = mbtiAxes.find((a) => a.axis === 'EI')!.rightPct;

  // --- skills (8, blended from direct skill answers + interests) ---
  const k = { num: gp('k1'), verb: gp('k2'), log: gp('k3'), lead: gp('k4') };
  const rel = gp('q2'); const mot = gp('q1');
  const skillRaw: Record<Skill, number> = {
    numerical: 0.6 * k.num + 0.4 * riasecPct.C,
    logical: 0.6 * k.log + 0.4 * riasecPct.I,
    verbal: 0.6 * k.verb + 0.4 * riasecPct.S,
    organizing: 0.5 * riasecPct.C + 0.5 * jPct,
    spatial: 0.5 * riasecPct.A + 0.5 * riasecPct.R,
    leadership: 0.6 * k.lead + 0.4 * riasecPct.E,
    social: 0.6 * riasecPct.S + 0.4 * rel,
    mechanical: 0.7 * riasecPct.R + 0.3 * riasecPct.I,
  };
  const skillKeys: Skill[] = ['numerical', 'logical', 'verbal', 'organizing', 'spatial', 'leadership', 'social', 'mechanical'];
  const skillPct: Record<Skill, number> = {} as Record<Skill, number>;
  skillKeys.forEach((s) => { skillPct[s] = clamp(skillRaw[s]); });
  const skills = skillKeys
    .map((s) => ({ key: s, label: SKILL_LABELS[s], percent: skillPct[s], rating: ratingFor(skillPct[s]) }))
    .sort((a, b) => b.percent - a.percent);
  const overallSkills = clamp(skillKeys.reduce((s, x) => s + skillPct[x], 0) / skillKeys.length);

  // --- EQ (5, from 2 measured + blends) ---
  const eqRaw: Record<Eq, number> = {
    motivation: mot,
    relationship: rel,
    selfAwareness: 0.6 * rel + 0.4 * riasecPct.I,
    managingEmotions: 0.6 * mot + 0.4 * jPct,
    empathy: 0.7 * riasecPct.S + 0.3 * rel,
  };
  const eqKeys: Eq[] = ['selfAwareness', 'managingEmotions', 'motivation', 'empathy', 'relationship'];
  const eq = eqKeys.map((key) => {
    const percent = clamp(eqRaw[key]);
    return { key, label: EQ_LABELS[key], percent, level: levelFor(percent) };
  });

  // --- learning (4, 2 measured + 2 derived, normalised to 100) ---
  const learnRaw: Record<Learning, number> = {
    kinesthetic: gp('m1'),
    visual: gp('m2'),
    auditory: 0.6 * ePct + 0.4 * riasecPct.S,
    readWrite: 0.5 * riasecPct.I + 0.5 * jPct,
  };
  const learnKeys: Learning[] = ['visual', 'auditory', 'readWrite', 'kinesthetic'];
  const learnTotal = learnKeys.reduce((s, x) => s + learnRaw[x], 0) || 1;
  const learning: Bar[] = learnKeys
    .map((key) => ({ key, label: LEARNING_LABELS[key], percent: round((learnRaw[key] / learnTotal) * 100) }))
    .sort((a, b) => b.percent - a.percent);
  const dominantLearning = learning[0].label;

  // --- motivators ---
  const motRaw = [
    { key: 'social-service', label: 'Social Service', raw: riasecPct.S },
    { key: 'creativity', label: 'Creativity', raw: riasecPct.A },
    { key: 'continuous-learning', label: 'Continuous Learning', raw: riasecPct.I },
    { key: 'high-paced', label: 'High Paced Environment', raw: riasecPct.E },
    { key: 'structure', label: 'Structured Environment', raw: riasecPct.C },
    { key: 'independence', label: 'Independence', raw: 100 - ePct },
    { key: 'adventure', label: 'Adventure', raw: (riasecPct.R + (100 - jPct)) / 2 },
  ];
  const motMax = Math.max(...motRaw.map((m) => m.raw), 1);
  const motivators: Bar[] = motRaw
    .map((m) => ({ key: m.key, label: m.label, percent: clamp((m.raw / motMax) * 100) }))
    .sort((a, b) => b.percent - a.percent);

  // --- clusters ---
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

  // --- career fit ---
  const careerScored = CAREERS.map((c) => {
    let interestFit = 0; let wsum = 0;
    c.code.forEach((code, idx) => { const w = 3 - idx; interestFit += (riasecPct[code] ?? 0) * w; wsum += w; });
    interestFit = interestFit / (wsum || 1);
    const skillFit = c.skills.reduce((s, sk) => s + (skillPct[sk] ?? 0), 0) / c.skills.length;
    let match = round(interestFit * 0.65 + skillFit * 0.35);
    if (dreamCareer && dreamCareer.trim().length > 2 && (c.title + ' ' + c.roles).toLowerCase().includes(dreamCareer.toLowerCase().trim())) {
      match = Math.min(99, match + 8);
    }
    return { ...c, match };
  }).sort((a, b) => b.match - a.match);

  const verdictFor = (m: number): CareerFit['verdict'] =>
    m >= 78 ? 'Top Choice' : m >= 66 ? 'Good Choice' : m >= 52 ? 'Optional' : m >= 42 ? 'Develop' : 'Avoid';
  const topCareers: CareerFit[] = careerScored.slice(0, 6).map((c) => ({
    title: c.title, roles: c.roles, cluster: c.cluster, match: c.match, verdict: verdictFor(c.match),
  }));
  const careerFocus = careerScored[0]?.title ?? 'Explorer';
  const favoritePath = dreamCareer?.trim() || careerFocus;

  // --- overall + label ---
  const overallScore = clamp(
    overallSkills * 0.4 + (interests[0]?.percent ?? 0) * 0.3 + (eq.reduce((s, e) => s + e.percent, 0) / eq.length) * 0.3
  );
  const matchLabel = overallScore >= 80 ? 'Future-Ready' : overallScore >= 66 ? 'Clarity' : overallScore >= 50 ? 'Exploring' : 'Getting Started';

  const strengths = [
    ...skills.slice(0, 2).map((s) => `${s.label.replace(' & Decision Making', '').replace(' Ability', '')} (${s.rating})`),
    mbtiType.includes('F') ? 'Strong interpersonal awareness' : 'Objective, logical thinking',
    mbtiType.includes('J') ? 'Organised and dependable' : 'Adaptable and flexible',
  ];
  const lowSkills = skills.filter((s) => s.percent < 55).slice(-2).map((s) => s.label);
  const lowEq = eq.filter((e) => e.level === 'Low').map((e) => e.label);
  const gaps = [
    ...lowSkills.map((s) => `Build your ${s.toLowerCase()} — it is below the level your top careers need.`),
    ...lowEq.map((e) => `Develop your ${e.toLowerCase()} for stronger professional relationships.`),
    `Gain real exposure to ${careerFocus} through projects, internships or shadowing.`,
  ].slice(0, 4);
  const nextSteps = [
    `Explore the day-to-day reality of ${topCareers[0]?.title} and ${topCareers[1]?.title}.`,
    `Pick subjects / courses that build towards ${topCareers[0]?.cluster}.`,
    `Strengthen your ${skills[skills.length - 1].label.toLowerCase()} with weekly practice.`,
    `Talk to a OneGrasp counsellor to lock your 20-year execution plan.`,
  ];

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
  };
}
