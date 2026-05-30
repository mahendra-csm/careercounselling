import type { AssessmentAnswers } from '@/types/assessment';

export type QuickAssessmentAnswer = {
  id: string;
  text?: string;
  value: number;
};

export type CareerChoice = {
  title: string;
  reason: string;
  matchPercent: number;
};

// Improved, more discriminative 15-question set. Each question is a 5-point Likert.
export const QUICK_ASSESSMENT_QUESTIONS: { id: string; text: string; options: string[] }[] = [
  { id: 'q1', text: 'I enjoy solving complex logical problems (puzzles, math, coding).', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
  { id: 'q2', text: 'I like running experiments or investigating how things work (science).', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
  { id: 'q3', text: 'I learn best by doing hands-on projects rather than reading theory.', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
  { id: 'q4', text: 'I often create art, designs, music, or stories for fun.', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
  { id: 'q5', text: 'I enjoy explaining ideas and helping others understand things.', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
  { id: 'q6', text: 'I like organizing tasks, planning projects, and following steps.', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
  { id: 'q7', text: 'I feel comfortable using computers, software, or building simple tech tools.', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
  { id: 'q8', text: 'I get satisfaction from supporting people’s wellbeing or learning.', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
  { id: 'q9', text: 'I keep working on hard problems until I understand them.', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
  { id: 'q10', text: 'I like taking responsibility and leading small groups or projects.', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
  { id: 'q11', text: 'I pay attention to details and care about accuracy.', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
  { id: 'q12', text: 'I enjoy building things with tools or experimenting physically (DIY).', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
  { id: 'q13', text: 'Doing well in school (grades) is important to me right now.', options: ['Very important', 'Important', 'Neutral', 'Less important', 'Not important'] },
  { id: 'q14', text: 'I prefer focused solo work rather than always working in teams.', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
  { id: 'q15', text: 'I enjoy sharing my ideas publicly (presentations, videos, writing).', options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'] },
];

// Career match profiles with weights tuned for the question set.
const CAREER_MATCHES = [
  {
    title: 'Scientist',
    reason: 'Curiosity, experiments and persistence make scientific paths a good fit.',
    weights: { q2: 5, q9: 4, q1: 3, q3: 2, q11: 2 },
  },
  {
    title: 'Engineer',
    reason: 'Problem solving, hands-on building and technical skills align with engineering.',
    weights: { q1: 4, q3: 4, q7: 3, q12: 4, q11: 2, q9: 2 },
  },
  {
    title: 'Designer',
    reason: 'Creativity, visual thinking and hands-on prototyping point to design careers.',
    weights: { q4: 5, q3: 3, q12: 2, q15: 3, q11: 2 },
  },
  {
    title: 'Teacher / Educator',
    reason: 'Explaining ideas, patience and helping others suit teaching and education.',
    weights: { q5: 5, q8: 4, q15: 2, q13: 2, q9: 2 },
  },
  {
    title: 'Healthcare (Doctor/Nurse)',
    reason: 'Helping others, persistence and attention to detail match healthcare roles.',
    weights: { q8: 5, q11: 3, q9: 3, q2: 2, q13: 2 },
  },
  {
    title: 'Entrepreneur / Leader',
    reason: 'Leadership, initiative and responsibility fit entrepreneurial paths.',
    weights: { q10: 5, q6: 3, q15: 3, q1: 2, q13: 2 },
  },
  {
    title: 'Psychologist / Counselor',
    reason: 'Empathy, helping others and teamwork point to counseling and psychology.',
    weights: { q8: 5, q5: 3, q14: 2, q9: 2, q15: 1 },
  },
  {
    title: 'Software Developer',
    reason: 'Logical thinking, tech comfort and persistence match coding careers.',
    weights: { q1: 4, q7: 5, q9: 3, q11: 2, q3: 2 },
  },
  {
    title: 'Content Creator / Communicator',
    reason: 'Creativity plus public sharing skills are strong for content and media roles.',
    weights: { q4: 4, q15: 5, q5: 3, q14: 2, q11: 1 },
  },
];

function normalizedPoints(value: number) {
  // convert 0..4 answer scale to higher-is-better signal (0 = strongly agree -> 4)
  return Math.max(0, 4 - value);
}

function chooseTopValues(values: string[], count: number) {
  return values.slice(0, count);
}

export function scoreQuickAssessment(
  answers: QuickAssessmentAnswer[],
  name?: string,
  futureCareer?: string
) {
  const byId = Object.fromEntries(answers.map((a) => [a.id, a.value]));

  // compute raw weighted scores for each career
  const scores = CAREER_MATCHES.map((career) => {
    const raw = Object.entries(career.weights).reduce((sum, [qid, weight]) => {
      const v = Number(byId[qid] ?? 2);
      return sum + normalizedPoints(v) * weight;
    }, 0);
    return { title: career.title, reason: career.reason, raw };
  });

  const maxRaw = Math.max(...scores.map((s) => s.raw), 1);
  const topCareerChoices: CareerChoice[] = scores
    .sort((a, b) => b.raw - a.raw)
    .slice(0, 3)
    .map((item, idx) => ({ title: item.title, reason: item.reason, matchPercent: Math.max(50, Math.round((item.raw / maxRaw) * 100) - idx * 3) }));

  // strengths and weakness signals built from thematic aggregations
  const strengthSignals = [
    { key: 'Analytical thinking', score: normalizedPoints(Number(byId.q1 ?? 2)) + normalizedPoints(Number(byId.q9 ?? 2)) },
    { key: 'Practical skills', score: normalizedPoints(Number(byId.q3 ?? 2)) + normalizedPoints(Number(byId.q12 ?? 2)) },
    { key: 'Creativity', score: normalizedPoints(Number(byId.q4 ?? 2)) + normalizedPoints(Number(byId.q15 ?? 2)) },
    { key: 'Communication & teaching', score: normalizedPoints(Number(byId.q5 ?? 2)) + normalizedPoints(Number(byId.q15 ?? 2)) },
    { key: 'Leadership & initiative', score: normalizedPoints(Number(byId.q10 ?? 2)) + normalizedPoints(Number(byId.q6 ?? 2)) },
  ].sort((a, b) => b.score - a.score);

  const weaknessSignals = [
    { key: 'Public speaking confidence', score: normalizedPoints(Number(byId.q15 ?? 2)) },
    { key: 'Team collaboration', score: normalizedPoints(Number(byId.q14 ?? 2)) },
    { key: 'Focus on grades over skills', score: normalizedPoints(Number(byId.q13 ?? 2)) },
    { key: 'Technical exposure', score: normalizedPoints(Number(byId.q7 ?? 2)) },
  ].sort((a, b) => a.score - b.score);

  const improvementAreas = chooseTopValues(weaknessSignals.map((s) => s.key).slice(0, 3), 3);
  const abilities = chooseTopValues(strengthSignals.map((s) => s.key), 4);

  const interests = chooseTopValues(
    [
      Number(byId.q2 ?? 2) <= 1 ? 'Science & discovery' : '',
      Number(byId.q4 ?? 2) <= 1 ? 'Creative arts' : '',
      Number(byId.q7 ?? 2) <= 1 ? 'Technology & computing' : '',
      Number(byId.q12 ?? 2) <= 1 ? 'Hands-on building' : '',
      Number(byId.q8 ?? 2) <= 1 ? 'People & wellbeing' : '',
    ].filter(Boolean),
    3
  );

  const overallRaw = answers.reduce((s, a) => s + normalizedPoints(a.value), 0);
  const overallScore = Math.max(40, Math.min(98, Math.round(50 + (overallRaw / (answers.length * 4)) * 48)));

  const studentName = name?.trim() || 'Student';
  const aspiration = futureCareer?.trim() || topCareerChoices[0]?.title || 'Explorer';

  const assessmentAnswers: AssessmentAnswers = {
    name: studentName,
    currentRole: 'Student',
    yearsExperience: 0,
    industry: 'Education',
    currentSkills: chooseTopValues([...abilities, ...interests, 'Curiosity'], 5),
    targetRole: aspiration,
    companyType: 'School / NGO',
    locationPreference: 'Local',
    salaryMin: 0,
    salaryMax: 0,
    workPace: Number(byId.q6 ?? 2) <= 1 ? 'Structured' : 'Flexible',
    teamSize: Number(byId.q14 ?? 2) <= 1 ? 'Solo' : 'Small',
    managementStyle: Number(byId.q10 ?? 2) <= 1 ? 'Leadership-oriented' : 'Collaborative',
    learningStyle: Number(byId.q3 ?? 2) <= 1 ? 'Hands-on' : 'Reading',
    timeline: Number(byId.q13 ?? 2) <= 1 ? '1 year' : '6 months',
    topPriority: Number(byId.q13 ?? 2) <= 1 ? 'Grades' : 'Skills',
  };

  return {
    overallScore,
    topCareerChoices,
    strengths: chooseTopValues(strengthSignals.map((s) => s.key), 3),
    weaknesses: chooseTopValues(weaknessSignals.map((s) => s.key), 3),
    improvementAreas,
    abilities,
    interests,
    futureCareer: aspiration,
    assessmentAnswers,
  };
}
