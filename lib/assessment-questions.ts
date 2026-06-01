/**
 * OneGrasp Career Assessment — 6-section question bank.
 *
 * The test is split into 6 clearly-labelled sections. Each question carries its
 * own per-question time budget (40–50s) and the scoring metadata needed to turn
 * the student's answers into a personalised career report.
 *
 *   1. Personality            — MBTI 4 axes (forced-choice A/B)
 *   2. Interests              — RIASEC six interest themes (No / Not sure / Yes)
 *   3. Motivators             — career values (Always … Definitely No)
 *   4. Learning styles        — VARK (each option tagged V/A/R/K)
 *   5. Multiple intelligences — Gardner's 8 intelligences (No / Not sure / Yes)
 *   6. Analytical & Logical   — aptitude MCQs with a correct answer
 *
 * Every answer is stored by question id in an AnswerMap as the selected option
 * index. The scoring engine (lib/assessment-engine.ts) reads this metadata to
 * build the profile — nothing in the report is hard-coded per student.
 */

export type SectionId =
  | 'personality'
  | 'interests'
  | 'motivators'
  | 'learning'
  | 'intelligences'
  | 'analytical';

export type MbtiAxis = 'EI' | 'SN' | 'TF' | 'JP';
export type Riasec = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type Vark = 'V' | 'A' | 'R' | 'K';
export type Intelligence =
  | 'linguistic' | 'logical' | 'spatial' | 'kinesthetic'
  | 'musical' | 'interpersonal' | 'intrapersonal' | 'naturalist';
export type AptitudeSkill = 'numerical' | 'logical' | 'verbal' | 'spatial';

export type MotivatorKey =
  | 'adventure' | 'independence' | 'continuous-learning'
  | 'high-paced' | 'structure' | 'creativity' | 'social-service';

export interface Option {
  /** Label shown to the student. */
  label: string;
  /** VARK tag — only on learning-style questions. */
  vark?: Vark;
}

export interface Question {
  id: string;
  section: SectionId;
  prompt: string;
  options: Option[];
  /** Per-question time budget in seconds (40–50). */
  timeSec: number;

  // --- scoring metadata (depends on section) ---
  /** personality: axis + the letter each option (A=0, B=1) scores toward. */
  axis?: MbtiAxis;
  poles?: [string, string]; // [option0 letter, option1 letter] e.g. ['I','E']
  /** interests: which RIASEC theme this question loads on. */
  riasec?: Riasec;
  /** motivators: which value this measures. */
  motivator?: MotivatorKey;
  /** intelligences: which Gardner intelligence this measures. */
  intelligence?: Intelligence;
  /** analytical: which aptitude skill + the index of the correct option. */
  skill?: AptitudeSkill;
  correct?: number;
}

export interface SectionMeta {
  id: SectionId;
  index: number; // 1..6
  title: string;
  short: string;
  blurb: string;
  scale: string; // human description of the answer scale
  instructions: string[];
}

export const SECTIONS: SectionMeta[] = [
  {
    id: 'personality',
    index: 1,
    title: 'Personality',
    short: 'Personality',
    blurb: 'How you are wired — where you draw energy, how you take in information, decide and organise your world.',
    scale: 'Pick the statement that is closest to you.',
    instructions: [
      'There are no right or wrong answers — choose what feels most like you.',
      'Two statements are shown; pick the ONE closest to your natural style.',
      'Go with your first instinct rather than over-thinking.',
    ],
  },
  {
    id: 'interests',
    index: 2,
    title: 'Interests',
    short: 'Interests',
    blurb: 'The kinds of activities and work you are naturally drawn to (the RIASEC interest themes).',
    scale: 'Rate each statement: No · Not sure · Yes.',
    instructions: [
      'Read each statement and decide how much it sounds like you.',
      'Answer based on what you genuinely enjoy — not what you think you should pick.',
      'There is no time pressure beyond the per-question timer.',
    ],
  },
  {
    id: 'motivators',
    index: 3,
    title: 'Motivators',
    short: 'Motivators',
    blurb: 'The values that make work feel satisfying and fulfilling for you.',
    scale: 'How much would you want this in your dream job: Always … Definitely No.',
    instructions: [
      'Imagine your ideal future job while answering.',
      'Indicate how often or how strongly you would want each value.',
      'Be honest about what truly motivates YOU.',
    ],
  },
  {
    id: 'learning',
    index: 4,
    title: 'Learning Styles',
    short: 'Learning',
    blurb: 'How you absorb and remember new information best (Visual, Auditory, Read/Write, Kinesthetic).',
    scale: 'Choose the option that fits you best.',
    instructions: [
      'Each question has 4 options — pick the single best fit for you.',
      'Think about how you actually learn, not how you are told to learn.',
      'Choose the closest match even if more than one feels true.',
    ],
  },
  {
    id: 'intelligences',
    index: 5,
    title: 'Multiple Intelligences',
    short: 'Intelligences',
    blurb: 'Your natural strengths across the 8 intelligences — words, logic, pictures, body, music, people, self and nature.',
    scale: 'Rate each statement: No · Not sure · Yes.',
    instructions: [
      'Decide how strongly each statement applies to you.',
      'These map your strongest kinds of intelligence.',
      'Answer for who you are today, not who you wish to be.',
    ],
  },
  {
    id: 'analytical',
    index: 6,
    title: 'Analytical & Logical Thinking',
    short: 'Analytical',
    blurb: 'A short aptitude check of your numerical, logical, verbal and spatial reasoning.',
    scale: 'Solve each question and select the correct answer.',
    instructions: [
      'These questions DO have a correct answer — read carefully.',
      'Work it out before the timer runs out; an unanswered question scores zero.',
      'Do not use a calculator — this measures your own reasoning.',
    ],
  },
];

const T = 45; // default per-question seconds

/* ------------------------------------------------------------------ */
/* 1. PERSONALITY — forced-choice A/B, 4 questions per MBTI axis        */
/* ------------------------------------------------------------------ */
const PERSONALITY: Question[] = [
  // EI
  { id: 'p_ei1', section: 'personality', timeSec: T, axis: 'EI', poles: ['E', 'I'], prompt: 'Which describes you best?', options: [{ label: 'I usually like to have many people around me.' }, { label: 'I enjoy spending time by myself.' }] },
  { id: 'p_ei2', section: 'personality', timeSec: T, axis: 'EI', poles: ['E', 'I'], prompt: 'Which describes you best?', options: [{ label: 'I talk more than I listen.' }, { label: 'I listen more than I talk.' }] },
  { id: 'p_ei3', section: 'personality', timeSec: T, axis: 'EI', poles: ['E', 'I'], prompt: 'Which describes you best?', options: [{ label: 'It is easy for me to approach others and make new friends.' }, { label: 'I am more reserved and approach new relationships carefully.' }] },
  { id: 'p_ei4', section: 'personality', timeSec: T, axis: 'EI', poles: ['E', 'I'], prompt: 'Which describes you best?', options: [{ label: 'I develop new ideas through discussion with others.' }, { label: 'I develop new ideas when I focus within myself.' }] },
  // SN
  { id: 'p_sn1', section: 'personality', timeSec: T, axis: 'SN', poles: ['S', 'N'], prompt: 'Which describes you best?', options: [{ label: 'I like to do things in proven, established ways.' }, { label: 'I like to do things in new, original ways.' }] },
  { id: 'p_sn2', section: 'personality', timeSec: T, axis: 'SN', poles: ['S', 'N'], prompt: 'Which describes you best?', options: [{ label: 'I usually begin with facts and then build a bigger idea.' }, { label: 'I usually build a bigger idea first and then find the facts.' }] },
  { id: 'p_sn3', section: 'personality', timeSec: T, axis: 'SN', poles: ['S', 'N'], prompt: 'Which describes you best?', options: [{ label: 'I prefer to trust my actual, concrete experience.' }, { label: 'I prefer to trust my gut instincts and hunches.' }] },
  { id: 'p_sn4', section: 'personality', timeSec: T, axis: 'SN', poles: ['S', 'N'], prompt: 'Which describes you best?', options: [{ label: 'I learn best through observation and practical activities.' }, { label: 'I learn best through intensive thinking and imagination.' }] },
  // TF
  { id: 'p_tf1', section: 'personality', timeSec: T, axis: 'TF', poles: ['T', 'F'], prompt: 'How do you take decisions?', options: [{ label: 'With my head — I focus on facts and logic.' }, { label: 'With my heart — I consider other people’s feelings.' }] },
  { id: 'p_tf2', section: 'personality', timeSec: T, axis: 'TF', poles: ['T', 'F'], prompt: 'Which describes you best?', options: [{ label: 'I usually give direct and honest opinions.' }, { label: 'I am careful not to hurt others with my comments.' }] },
  { id: 'p_tf3', section: 'personality', timeSec: T, axis: 'TF', poles: ['T', 'F'], prompt: 'Which describes you best?', options: [{ label: 'I am usually tough-minded.' }, { label: 'I am usually soft-hearted.' }] },
  { id: 'p_tf4', section: 'personality', timeSec: T, axis: 'TF', poles: ['T', 'F'], prompt: 'Which describes you best?', options: [{ label: 'I give more importance to facts, tasks and logic.' }, { label: 'I give more importance to values and social considerations.' }] },
  // JP
  { id: 'p_jp1', section: 'personality', timeSec: T, axis: 'JP', poles: ['J', 'P'], prompt: 'Which describes you best?', options: [{ label: 'I make plans and schedules and try to stick with them.' }, { label: 'I like to be flexible and keep plans to a minimum.' }] },
  { id: 'p_jp2', section: 'personality', timeSec: T, axis: 'JP', poles: ['J', 'P'], prompt: 'Which describes you best?', options: [{ label: 'I plan everything in advance before moving into action.' }, { label: 'I usually take tasks on without making a plan.' }] },
  { id: 'p_jp3', section: 'personality', timeSec: T, axis: 'JP', poles: ['J', 'P'], prompt: 'Which describes you best?', options: [{ label: 'I prefer to narrow down options and conclude.' }, { label: 'I prefer to keep options open and explore.' }] },
  { id: 'p_jp4', section: 'personality', timeSec: T, axis: 'JP', poles: ['J', 'P'], prompt: 'Which describes you best?', options: [{ label: 'I am usually punctual and finish work on time.' }, { label: 'I am less time-conscious and often run late.' }] },
];

/* ------------------------------------------------------------------ */
/* 2. INTERESTS — RIASEC, No / Not sure / Yes, 3 per theme             */
/* ------------------------------------------------------------------ */
const YNS: Option[] = [{ label: 'No' }, { label: 'Not sure' }, { label: 'Yes' }];
const ynsQ = (id: string, riasec: Riasec, prompt: string): Question =>
  ({ id, section: 'interests', timeSec: 40, riasec, prompt, options: YNS });

const INTERESTS: Question[] = [
  // Realistic
  ynsQ('i_r1', 'R', 'Do you enjoy repairing or fixing gadgets, appliances or machines?'),
  ynsQ('i_r2', 'R', 'Do you like building or assembling objects and working with a tool kit?'),
  ynsQ('i_r3', 'R', 'Do you often take part in outdoor sports, activities or adventures?'),
  // Investigative
  ynsQ('i_i1', 'I', 'Do you enjoy taking part in science projects and experiments?'),
  ynsQ('i_i2', 'I', 'Do you like learning how new technologies and systems actually work?'),
  ynsQ('i_i3', 'I', 'Do you enjoy applying logic to solve complex problems?'),
  // Artistic
  ynsQ('i_a1', 'A', 'Do you like to work with a variety of colours, shapes and designs?'),
  ynsQ('i_a2', 'A', 'Do you enjoy writing stories, performing, or creative activities?'),
  ynsQ('i_a3', 'A', 'Do you like to show creativity using your imagination?'),
  // Social
  ynsQ('i_s1', 'S', 'Do you like to interact, listen and help solve other people’s problems?'),
  ynsQ('i_s2', 'S', 'Do you like to take part in social welfare, community service or volunteering?'),
  ynsQ('i_s3', 'S', 'Do you enjoy teaching, guiding or training others?'),
  // Enterprising
  ynsQ('i_e1', 'E', 'Do you like to take command of a situation and lead others?'),
  ynsQ('i_e2', 'E', 'Are you good at influencing and convincing people?'),
  ynsQ('i_e3', 'E', 'Do you like marketing, selling or persuading people to your point of view?'),
  // Conventional
  ynsQ('i_c1', 'C', 'Do you enjoy working with data, written records and details?'),
  ynsQ('i_c2', 'C', 'Do you like to plan, organise and prioritise activities?'),
  ynsQ('i_c3', 'C', 'Do you have an affinity for numbers, business and the economy?'),
];

/* ------------------------------------------------------------------ */
/* 3. MOTIVATORS — Always … Definitely No (value 3..0)                 */
/* ------------------------------------------------------------------ */
const FREQ: Option[] = [{ label: 'Always' }, { label: 'Most of the time' }, { label: 'Not really' }, { label: 'Definitely No' }];
const motQ = (id: string, motivator: MotivatorKey, prompt: string): Question =>
  ({ id, section: 'motivators', timeSec: T, motivator, prompt, options: FREQ });

const MOTIVATORS: Question[] = [
  motQ('m_adv', 'adventure', 'In my dream job I want adventure and excitement, even if it involves physical risk.'),
  motQ('m_ind', 'independence', 'I want the freedom to work alone, make my own decisions and plan my own work.'),
  motQ('m_learn', 'continuous-learning', 'I want to work on the frontiers of knowledge with continuous learning.'),
  motQ('m_pace', 'high-paced', 'I want a high degree of competition, challenge, pace and excitement.'),
  motQ('m_struct', 'structure', 'I want a structured environment with high accuracy, reliability and set procedures.'),
  motQ('m_create', 'creativity', 'I want to engage in creative work in some form of art.'),
  motQ('m_social', 'social-service', 'I want work involving social service, responsibility and the welfare of people.'),
];

/* ------------------------------------------------------------------ */
/* 4. LEARNING STYLES — VARK, each option tagged                       */
/* ------------------------------------------------------------------ */
const LEARNING: Question[] = [
  {
    id: 'l1', section: 'learning', timeSec: T, prompt: 'When you study, what helps you learn best?',
    options: [
      { label: 'Reading and re-writing notes and headings.', vark: 'R' },
      { label: 'Listening to a lecture, discussing it or repeating it aloud.', vark: 'A' },
      { label: 'Moving around and learning through practicals and demos.', vark: 'K' },
      { label: 'Turning text into diagrams, flowcharts and images.', vark: 'V' },
    ],
  },
  {
    id: 'l2', section: 'learning', timeSec: T, prompt: 'To learn how a computer works, would you rather…',
    options: [
      { label: 'Watch a demo video about it.', vark: 'V' },
      { label: 'Listen to someone explain it.', vark: 'A' },
      { label: 'Take it apart and figure it out yourself.', vark: 'K' },
      { label: 'Read the instructions and manual.', vark: 'R' },
    ],
  },
  {
    id: 'l3', section: 'learning', timeSec: T, prompt: 'In a class or seminar, you usually…',
    options: [
      { label: 'Make plenty of written notes.', vark: 'R' },
      { label: 'Listen carefully and make a few notes.', vark: 'A' },
      { label: 'Draw pictures and illustrations while listening.', vark: 'V' },
      { label: 'Prefer examples, demos and real-time applications.', vark: 'K' },
    ],
  },
  {
    id: 'l4', section: 'learning', timeSec: T, prompt: 'You have to present an idea to your class. You would prefer to…',
    options: [
      { label: 'Create a working model and demonstrate it.', vark: 'K' },
      { label: 'Create diagrams, flowcharts and graphs.', vark: 'V' },
      { label: 'Practise a few key words by saying them aloud.', vark: 'A' },
      { label: 'Write out your speech and read it over and over.', vark: 'R' },
    ],
  },
  {
    id: 'l5', section: 'learning', timeSec: T, prompt: 'You prefer a teacher or presenter who uses…',
    options: [
      { label: 'Diagrams, charts or graphs.', vark: 'V' },
      { label: 'Discussion, Q&A or guest speakers.', vark: 'A' },
      { label: 'Handouts, books or readings.', vark: 'R' },
      { label: 'Demonstrations, models or practical sessions.', vark: 'K' },
    ],
  },
  {
    id: 'l6', section: 'learning', timeSec: T, prompt: 'Buying a new phone (apart from price), what influences you most?',
    options: [
      { label: 'Trying or testing it myself.', vark: 'K' },
      { label: 'Reading the details and features online.', vark: 'R' },
      { label: 'Its modern design and sleek looks.', vark: 'V' },
      { label: 'The salesperson telling me about it.', vark: 'A' },
    ],
  },
  {
    id: 'l7', section: 'learning', timeSec: T, prompt: 'Not sure how to spell a word, you would…',
    options: [
      { label: 'Look it up in the dictionary.', vark: 'R' },
      { label: 'Picture the word and choose how it looks.', vark: 'V' },
      { label: 'Say it aloud to hear if it sounds right.', vark: 'A' },
      { label: 'Write both versions down and choose one.', vark: 'K' },
    ],
  },
  {
    id: 'l8', section: 'learning', timeSec: T, prompt: 'Remembering when you last learned something new, you learned best by…',
    options: [
      { label: 'Watching a demonstration.', vark: 'V' },
      { label: 'Listening to someone explain and asking questions.', vark: 'A' },
      { label: 'Trying it out and doing it hands-on.', vark: 'K' },
      { label: 'Following written instructions, a manual or book.', vark: 'R' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 5. MULTIPLE INTELLIGENCES — Gardner, No / Not sure / Yes, 2 each    */
/* ------------------------------------------------------------------ */
const miQ = (id: string, intelligence: Intelligence, prompt: string): Question =>
  ({ id, section: 'intelligences', timeSec: 40, intelligence, prompt, options: YNS });

const INTELLIGENCES: Question[] = [
  miQ('mi_lin1', 'linguistic', 'I enjoy reading, writing, word games and expressing myself in words.'),
  miQ('mi_lin2', 'linguistic', 'I find it easy to explain things and remember what I read or hear.'),
  miQ('mi_log1', 'logical', 'I like solving puzzles, patterns and logical or numerical problems.'),
  miQ('mi_log2', 'logical', 'I can analyse problems step by step and reason them out.'),
  miQ('mi_spa1', 'spatial', 'I can easily picture objects, maps and designs in my mind.'),
  miQ('mi_spa2', 'spatial', 'I enjoy drawing, designing or working with shapes and visuals.'),
  miQ('mi_kin1', 'kinesthetic', 'I learn best by doing, building or moving rather than sitting still.'),
  miQ('mi_kin2', 'kinesthetic', 'I am good with my hands and at physical or sporting activities.'),
  miQ('mi_mus1', 'musical', 'I notice rhythms, melodies and sounds and enjoy music.'),
  miQ('mi_mus2', 'musical', 'I can easily remember tunes or pick up the beat of a song.'),
  miQ('mi_inter1', 'interpersonal', 'I understand how others feel and get along well with many people.'),
  miQ('mi_inter2', 'interpersonal', 'People often come to me for advice or to resolve disagreements.'),
  miQ('mi_intra1', 'intrapersonal', 'I understand my own feelings, strengths and goals well.'),
  miQ('mi_intra2', 'intrapersonal', 'I like to reflect, set personal goals and work independently.'),
  miQ('mi_nat1', 'naturalist', 'I enjoy being in nature and care about plants, animals or the environment.'),
  miQ('mi_nat2', 'naturalist', 'I am good at noticing and classifying things in the natural world.'),
];

/* ------------------------------------------------------------------ */
/* 6. ANALYTICAL & LOGICAL — aptitude MCQs with a correct answer       */
/* ------------------------------------------------------------------ */
const aptQ = (
  id: string, skill: AptitudeSkill, prompt: string, options: string[], correct: number
): Question => ({
  id, section: 'analytical', timeSec: 50, skill, correct, prompt,
  options: options.map((label) => ({ label })),
});

const ANALYTICAL: Question[] = [
  // Numerical
  aptQ('a_n1', 'numerical', 'The speed of a water current is 5 km/hr and a man swims at 15 km/hr in this water. What is his speed in still water?', ['20 km/hr', '10 km/hr', '15 km/hr', '13 km/hr'], 1),
  aptQ('a_n2', 'numerical', "Mathew's salary is increased by 10% and then reduced by 10%. What is the net percentage change?", ['2% decrease', '1% decrease', '20% decrease', 'No change'], 1),
  aptQ('a_n3', 'numerical', 'A man buys a cycle for ₹1000 and sells it at a 15% loss. What is the selling price?', ['₹800', '₹900', '₹850', '₹750'], 2),
  aptQ('a_n4', 'numerical', 'Ram cleans a house in 3 hours and Shyam in 2 hours. How long together (approx)?', ['72 minutes', '32 minutes', '84 minutes', '94 minutes'], 0),
  // Logical
  aptQ('a_l1', 'logical', 'Complete the series: ELFA, GLHA, ____, MLNA', ['OLPA', 'KLMA', 'ILJA', 'KLLA'], 2),
  aptQ('a_l2', 'logical', 'Sue & Jennifer are fair. Brian & Robyn are dark. Sue & Robyn are tall. Who is fair AND tall?', ['Sue', 'Jennifer', 'Brian', 'Robyn'], 0),
  aptQ('a_l3', 'logical', 'apples : fruit :: novel : ?', ['bookstore', 'magazine', 'book', 'shopping'], 2),
  aptQ('a_l4', 'logical', 'If all roses are flowers and some flowers fade quickly, then…', ['All roses fade quickly', 'Some roses may fade quickly', 'No rose fades', 'Roses are not flowers'], 1),
  // Verbal
  aptQ('a_v1', 'verbal', 'Choose the correctly spelled word.', ['Excesive', 'Occassion', 'Occurrence', 'Continous'], 2),
  aptQ('a_v2', 'verbal', 'Fill in the blanks: "I have ____ the presentation for you. I ____ it during my lunch break."', ['wrote & done', 'prepared & did', 'write & did', 'prepared & done'], 3),
  aptQ('a_v3', 'verbal', 'Replace the underlined words: "The population of Tokyo is GREATER THEN THAT OF ANY OTHER town in the world."', ['greater than that of any other', 'greatest among any other', 'greater than all other', 'No correction required'], 0),
  // Spatial
  aptQ('a_s1', 'spatial', 'A cube is painted on all faces and cut into 27 equal smaller cubes. How many have exactly one painted face?', ['6', '8', '12', '1'], 0),
  aptQ('a_s2', 'spatial', 'How many triangles are formed when both diagonals are drawn inside a square?', ['4', '6', '8', '2'], 2),
];

export const QUESTIONS: Question[] = [
  ...PERSONALITY,
  ...INTERESTS,
  ...MOTIVATORS,
  ...LEARNING,
  ...INTELLIGENCES,
  ...ANALYTICAL,
];

export type AnswerMap = Record<string, number>;

/** Questions belonging to a section, in order. */
export function questionsForSection(id: SectionId): Question[] {
  return QUESTIONS.filter((q) => q.section === id);
}

/** Total seconds budgeted for the whole test (used for the global timer). */
export const TOTAL_TIME_SEC = QUESTIONS.reduce((s, q) => s + q.timeSec, 0);
