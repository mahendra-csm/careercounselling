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

import type { AssessmentLevel } from './assessment-levels';
import { getLevel } from './assessment-levels';

export type SectionId =
  | 'personality'
  | 'interests'
  | 'motivators'
  | 'learning'
  | 'intelligences'
  | 'analytical'
  | 'eq'
  | 'workfit'
  | 'careerfields';

export type MbtiAxis = 'EI' | 'SN' | 'TF' | 'JP';
export type Riasec = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type Vark = 'V' | 'A' | 'R' | 'K';
export type Intelligence =
  | 'linguistic' | 'logical' | 'spatial' | 'kinesthetic'
  | 'musical' | 'interpersonal' | 'intrapersonal' | 'naturalist';
/** Aptitude skills measured across levels (upper levels add more). */
export type AptitudeSkill =
  | 'numerical' | 'logical' | 'verbal' | 'spatial'
  | 'social' | 'mechanical' | 'administrative' | 'leadership';

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
  /** Which level bank this question belongs to. Undefined = secondary (8–10). */
  level?: AssessmentLevel;

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
  /** eq: which emotional-quotient component this measures (+ reverse-scored?). */
  eqKey?: EqComponent;
  /** reverse-scored item (Yes/agreement counts AGAINST the trait). Used for
   *  EQ, and for interest/intelligence consistency checks. */
  reverse?: boolean;
  /** workfit / careerfields: which career cluster this loads on. */
  cluster?: string;
  /** Quality control: the option label the student MUST pick to pass an
   *  instructed-response attention check. Such items score no trait. */
  attentionAnswer?: string;
}

export type EqComponent =
  | 'selfAwareness' | 'managingEmotions' | 'motivation' | 'empathy' | 'relationship';

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
    scale: 'For each statement, choose Yes or No.',
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
    scale: 'For each statement, choose Yes or No.',
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
  {
    id: 'eq',
    index: 7,
    title: 'Emotional Quotient',
    short: 'Emotional Quotient',
    blurb: 'How well you understand and manage your own emotions and connect with others.',
    scale: 'For each statement, choose how true it is for you.',
    instructions: [
      'There are no right or wrong answers — answer honestly.',
      'Decide how strongly each statement applies to you.',
      'Go with your first, honest reaction.',
    ],
  },
  {
    id: 'workfit',
    index: 8,
    title: 'Work Preferences',
    short: 'Work Fit',
    blurb: 'The kinds of real-world work and fields you would choose to spend your time on.',
    scale: 'For each option, choose Yes or No.',
    instructions: [
      'Imagine you had to choose work to do — pick what appeals to you.',
      'Answer based on genuine interest, not what sounds impressive.',
      'There are no wrong answers.',
    ],
  },
  {
    id: 'careerfields',
    index: 9,
    title: 'Career-Field Interest',
    short: 'Career Fields',
    blurb: 'How interested you are in specific real-world career fields and what they involve.',
    scale: 'For each field, choose No, Not sure or Yes.',
    instructions: [
      'Read the short description of each field and how interested you are.',
      'Answer based on whether the work itself appeals to you.',
      'It is fine to be unsure — choose "Not sure".',
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
  { id: 'p_ei5', section: 'personality', timeSec: T, axis: 'EI', poles: ['E', 'I'], prompt: 'Which describes you best?', options: [{ label: 'I recharge by being around other people.' }, { label: 'I recharge by having quiet time on my own.' }] },
  // SN
  { id: 'p_sn1', section: 'personality', timeSec: T, axis: 'SN', poles: ['S', 'N'], prompt: 'Which describes you best?', options: [{ label: 'I like to do things in proven, established ways.' }, { label: 'I like to do things in new, original ways.' }] },
  { id: 'p_sn2', section: 'personality', timeSec: T, axis: 'SN', poles: ['S', 'N'], prompt: 'Which describes you best?', options: [{ label: 'I usually begin with facts and then build a bigger idea.' }, { label: 'I usually build a bigger idea first and then find the facts.' }] },
  { id: 'p_sn3', section: 'personality', timeSec: T, axis: 'SN', poles: ['S', 'N'], prompt: 'Which describes you best?', options: [{ label: 'I prefer to trust my actual, concrete experience.' }, { label: 'I prefer to trust my gut instincts and hunches.' }] },
  { id: 'p_sn4', section: 'personality', timeSec: T, axis: 'SN', poles: ['S', 'N'], prompt: 'Which describes you best?', options: [{ label: 'I learn best through observation and practical activities.' }, { label: 'I learn best through intensive thinking and imagination.' }] },
  { id: 'p_sn5', section: 'personality', timeSec: T, axis: 'SN', poles: ['S', 'N'], prompt: 'Which describes you best?', options: [{ label: 'I focus on what is real and happening now.' }, { label: 'I focus on what could be possible in the future.' }] },
  // TF
  { id: 'p_tf1', section: 'personality', timeSec: T, axis: 'TF', poles: ['T', 'F'], prompt: 'How do you take decisions?', options: [{ label: 'With my head — I focus on facts and logic.' }, { label: 'With my heart — I consider other people’s feelings.' }] },
  { id: 'p_tf2', section: 'personality', timeSec: T, axis: 'TF', poles: ['T', 'F'], prompt: 'Which describes you best?', options: [{ label: 'I usually give direct and honest opinions.' }, { label: 'I am careful not to hurt others with my comments.' }] },
  { id: 'p_tf3', section: 'personality', timeSec: T, axis: 'TF', poles: ['T', 'F'], prompt: 'Which describes you best?', options: [{ label: 'I am usually tough-minded.' }, { label: 'I am usually soft-hearted.' }] },
  { id: 'p_tf4', section: 'personality', timeSec: T, axis: 'TF', poles: ['T', 'F'], prompt: 'Which describes you best?', options: [{ label: 'I give more importance to facts, tasks and logic.' }, { label: 'I give more importance to values and social considerations.' }] },
  { id: 'p_tf5', section: 'personality', timeSec: T, axis: 'TF', poles: ['T', 'F'], prompt: 'Which describes you best?', options: [{ label: 'I value being fair and consistent above all.' }, { label: 'I value being kind and considerate above all.' }] },
  // JP
  { id: 'p_jp1', section: 'personality', timeSec: T, axis: 'JP', poles: ['J', 'P'], prompt: 'Which describes you best?', options: [{ label: 'I make plans and schedules and try to stick with them.' }, { label: 'I like to be flexible and keep plans to a minimum.' }] },
  { id: 'p_jp2', section: 'personality', timeSec: T, axis: 'JP', poles: ['J', 'P'], prompt: 'Which describes you best?', options: [{ label: 'I plan everything in advance before moving into action.' }, { label: 'I usually take tasks on without making a plan.' }] },
  { id: 'p_jp3', section: 'personality', timeSec: T, axis: 'JP', poles: ['J', 'P'], prompt: 'Which describes you best?', options: [{ label: 'I prefer to narrow down options and conclude.' }, { label: 'I prefer to keep options open and explore.' }] },
  { id: 'p_jp4', section: 'personality', timeSec: T, axis: 'JP', poles: ['J', 'P'], prompt: 'Which describes you best?', options: [{ label: 'I am usually punctual and finish work on time.' }, { label: 'I am less time-conscious and often run late.' }] },
  { id: 'p_jp5', section: 'personality', timeSec: T, axis: 'JP', poles: ['J', 'P'], prompt: 'Which describes you best?', options: [{ label: 'I like to settle things and have them decided.' }, { label: 'I like to keep my options open as long as possible.' }] },
];

/* ------------------------------------------------------------------ */
/* 2. INTERESTS — RIASEC, No / Not sure / Yes, 3 per theme             */
/* ------------------------------------------------------------------ */
const YNS: Option[] = [{ label: 'Yes' }, { label: 'No' }];
const ynsQ = (id: string, riasec: Riasec, prompt: string, reverse = false): Question =>
  ({ id, section: 'interests', timeSec: 40, riasec, prompt, options: YNS, reverse });

const INTERESTS: Question[] = [
  // Realistic
  ynsQ('i_r1', 'R', 'Do you enjoy repairing or fixing gadgets, appliances or machines?'),
  ynsQ('i_r2', 'R', 'Do you like building or assembling objects and working with a tool kit?'),
  ynsQ('i_r3', 'R', 'Do you often take part in outdoor sports, activities or adventures?'),
  ynsQ('i_r4', 'R', 'Do you like working with your hands on practical, physical tasks?'),
  ynsQ('i_r5', 'R', 'Would you enjoy operating equipment, vehicles or machinery?'),
  ynsQ('i_r6', 'R', 'Do you dislike hands-on, mechanical or physical work?', true),
  // Investigative
  ynsQ('i_i1', 'I', 'Do you enjoy taking part in science projects and experiments?'),
  ynsQ('i_i2', 'I', 'Do you like learning how new technologies and systems actually work?'),
  ynsQ('i_i3', 'I', 'Do you enjoy applying logic to solve complex problems?'),
  ynsQ('i_i4', 'I', 'Do you like to investigate a question deeply until you understand it?'),
  ynsQ('i_i5', 'I', 'Do you enjoy analysing data, patterns or evidence?'),
  ynsQ('i_i6', 'I', 'Do you avoid problems that need careful analysis or research?', true),
  // Artistic
  ynsQ('i_a1', 'A', 'Do you like to work with a variety of colours, shapes and designs?'),
  ynsQ('i_a2', 'A', 'Do you enjoy writing stories, performing, or creative activities?'),
  ynsQ('i_a3', 'A', 'Do you like to show creativity using your imagination?'),
  ynsQ('i_a4', 'A', 'Do you enjoy expressing ideas through art, music, writing or performance?'),
  ynsQ('i_a5', 'A', 'Do you prefer making original things over following a fixed method?'),
  // Social
  ynsQ('i_s1', 'S', 'Do you like to interact, listen and help solve other people’s problems?'),
  ynsQ('i_s2', 'S', 'Do you like to take part in social welfare, community service or volunteering?'),
  ynsQ('i_s3', 'S', 'Do you enjoy teaching, guiding or training others?'),
  ynsQ('i_s4', 'S', 'Do you feel satisfied when you help someone through a personal problem?'),
  ynsQ('i_s5', 'S', 'Do you enjoy working closely with people more than with things or data?'),
  ynsQ('i_s6', 'S', 'Do you prefer to work with things and data rather than with people?', true),
  // Enterprising
  ynsQ('i_e1', 'E', 'Do you like to take command of a situation and lead others?'),
  ynsQ('i_e2', 'E', 'Are you good at influencing and convincing people?'),
  ynsQ('i_e3', 'E', 'Do you like marketing, selling or persuading people to your point of view?'),
  ynsQ('i_e4', 'E', 'Do you enjoy persuading others to support your idea or plan?'),
  ynsQ('i_e5', 'E', 'Would you like to start or run your own venture one day?'),
  // Conventional
  ynsQ('i_c1', 'C', 'Do you enjoy working with data, written records and details?'),
  ynsQ('i_c2', 'C', 'Do you like to plan, organise and prioritise activities?'),
  ynsQ('i_c3', 'C', 'Do you have an affinity for numbers, business and the economy?'),
  ynsQ('i_c4', 'C', 'Do you like keeping things accurate, orderly and well-organised?'),
  ynsQ('i_c5', 'C', 'Do you find detailed rules, records and procedures boring?', true),
  // Attention check (scores no trait)
  { id: 'i_att1', section: 'interests', timeSec: 30, prompt: 'Attention check — to show you are reading carefully, please choose “No” for this question.', options: YNS, attentionAnswer: 'No' },
];

/* ------------------------------------------------------------------ */
/* 3. MOTIVATORS — Always … Definitely No (value 3..0)                 */
/* ------------------------------------------------------------------ */
const FREQ: Option[] = [{ label: 'Always' }, { label: 'Most of the time' }, { label: 'Not really' }, { label: 'Definitely No' }];
const motQ = (id: string, motivator: MotivatorKey, prompt: string): Question =>
  ({ id, section: 'motivators', timeSec: T, motivator, prompt, options: FREQ });

const MOTIVATORS: Question[] = [
  motQ('m_adv', 'adventure', 'In my dream job I want adventure and excitement, even if it involves physical risk.'),
  motQ('m_adv2', 'adventure', 'I would enjoy a job that keeps taking me to new places and situations.'),
  motQ('m_adv3', 'adventure', 'I am willing to take risks for an exciting opportunity.'),
  motQ('m_ind', 'independence', 'I want the freedom to work alone, make my own decisions and plan my own work.'),
  motQ('m_ind2', 'independence', 'I prefer to organise my own work rather than be told exactly what to do.'),
  motQ('m_ind3', 'independence', 'Being my own boss matters a lot to me.'),
  motQ('m_learn', 'continuous-learning', 'I want to work on the frontiers of knowledge with continuous learning.'),
  motQ('m_learn2', 'continuous-learning', 'I would feel bored in a job where I stop learning new things.'),
  motQ('m_learn3', 'continuous-learning', 'I enjoy mastering new skills and ideas on a regular basis.'),
  motQ('m_pace', 'high-paced', 'I want a high degree of competition, challenge, pace and excitement.'),
  motQ('m_pace2', 'high-paced', 'I do my best work when there is challenge and competition.'),
  motQ('m_pace3', 'high-paced', 'A fast, busy environment energises me rather than tiring me out.'),
  motQ('m_struct', 'structure', 'I want a structured environment with high accuracy, reliability and set procedures.'),
  motQ('m_struct2', 'structure', 'I like clear rules, routines and well-defined expectations.'),
  motQ('m_struct3', 'structure', 'I feel most comfortable when my work is organised and predictable.'),
  motQ('m_create', 'creativity', 'I want to engage in creative work in some form of art.'),
  motQ('m_create2', 'creativity', 'I want a job where I can create and express original ideas.'),
  motQ('m_create3', 'creativity', 'I would feel restricted in a job with no room for creativity.'),
  motQ('m_social', 'social-service', 'I want work involving social service, responsibility and the welfare of people.'),
  motQ('m_social2', 'social-service', 'It matters to me that my work clearly helps other people.'),
  motQ('m_social3', 'social-service', 'I would choose meaningful work over simply a higher salary.'),
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
const miQ = (id: string, intelligence: Intelligence, prompt: string, reverse = false): Question =>
  ({ id, section: 'intelligences', timeSec: 40, intelligence, prompt, options: YNS, reverse });

const INTELLIGENCES: Question[] = [
  miQ('mi_lin1', 'linguistic', 'I enjoy reading, writing, word games and expressing myself in words.'),
  miQ('mi_lin2', 'linguistic', 'I find it easy to explain things and remember what I read or hear.'),
  miQ('mi_lin3', 'linguistic', 'I express myself clearly and enjoy debates or discussions.'),
  miQ('mi_lin4', 'linguistic', 'I find reading and writing tiring and avoid it when I can.', true),
  miQ('mi_log1', 'logical', 'I like solving puzzles, patterns and logical or numerical problems.'),
  miQ('mi_log2', 'logical', 'I can analyse problems step by step and reason them out.'),
  miQ('mi_log3', 'logical', 'I enjoy strategy games and working things out with numbers.'),
  miQ('mi_log4', 'logical', 'I avoid problems that involve numbers or careful logic.', true),
  miQ('mi_spa1', 'spatial', 'I can easily picture objects, maps and designs in my mind.'),
  miQ('mi_spa2', 'spatial', 'I enjoy drawing, designing or working with shapes and visuals.'),
  miQ('mi_spa3', 'spatial', 'I can read maps and find my way around new places easily.'),
  miQ('mi_spa4', 'spatial', 'I notice visual details, colours and how things are arranged.'),
  miQ('mi_kin1', 'kinesthetic', 'I learn best by doing, building or moving rather than sitting still.'),
  miQ('mi_kin2', 'kinesthetic', 'I am good with my hands and at physical or sporting activities.'),
  miQ('mi_kin3', 'kinesthetic', 'I enjoy activities like sports, dance, crafts or building.'),
  miQ('mi_kin4', 'kinesthetic', 'I remember things better when I physically do them.'),
  miQ('mi_mus1', 'musical', 'I notice rhythms, melodies and sounds and enjoy music.'),
  miQ('mi_mus2', 'musical', 'I can easily remember tunes or pick up the beat of a song.'),
  miQ('mi_mus3', 'musical', 'I can tell when a note or instrument is off-key.'),
  miQ('mi_mus4', 'musical', 'I often tap rhythms or have a tune running in my head.'),
  miQ('mi_inter1', 'interpersonal', 'I understand how others feel and get along well with many people.'),
  miQ('mi_inter2', 'interpersonal', 'People often come to me for advice or to resolve disagreements.'),
  miQ('mi_inter3', 'interpersonal', 'I can usually tell how someone is feeling from their behaviour.'),
  miQ('mi_inter4', 'interpersonal', 'I enjoy meeting new people and working in teams.'),
  miQ('mi_intra1', 'intrapersonal', 'I understand my own feelings, strengths and goals well.'),
  miQ('mi_intra2', 'intrapersonal', 'I like to reflect, set personal goals and work independently.'),
  miQ('mi_intra3', 'intrapersonal', 'I think carefully about my own strengths and weaknesses.'),
  miQ('mi_intra4', 'intrapersonal', 'I prefer to understand myself well before making big decisions.'),
  miQ('mi_nat1', 'naturalist', 'I enjoy being in nature and care about plants, animals or the environment.'),
  miQ('mi_nat2', 'naturalist', 'I am good at noticing and classifying things in the natural world.'),
  miQ('mi_nat3', 'naturalist', 'I can recognise and name many plants, animals or birds.'),
  miQ('mi_nat4', 'naturalist', 'I notice changes in the weather, seasons and environment.'),
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
  aptQ('a_n5', 'numerical', 'A shirt costs ₹800 after a 20% discount. What was the original price?', ['₹1000', '₹960', '₹1020', '₹900'], 0),
  // Logical
  aptQ('a_l1', 'logical', 'Complete the series: ELFA, GLHA, ____, MLNA', ['OLPA', 'KLMA', 'ILJA', 'KLLA'], 2),
  aptQ('a_l2', 'logical', 'Sue & Jennifer are fair. Brian & Robyn are dark. Sue & Robyn are tall. Who is fair AND tall?', ['Sue', 'Jennifer', 'Brian', 'Robyn'], 0),
  aptQ('a_l3', 'logical', 'apples : fruit :: novel : ?', ['bookstore', 'magazine', 'book', 'shopping'], 2),
  aptQ('a_l4', 'logical', 'If all roses are flowers and some flowers fade quickly, then…', ['All roses fade quickly', 'Some roses may fade quickly', 'No rose fades', 'Roses are not flowers'], 1),
  aptQ('a_l5', 'logical', 'Pointing to a photo, Reena said: “He is the son of my grandfather’s only son.” How is the boy related to Reena?', ['Brother', 'Cousin', 'Uncle', 'Father'], 0),
  // Verbal
  aptQ('a_v1', 'verbal', 'Choose the correctly spelled word.', ['Excesive', 'Occassion', 'Occurrence', 'Continous'], 2),
  aptQ('a_v2', 'verbal', 'Fill in the blanks: "I have ____ the presentation for you. I ____ it during my lunch break."', ['wrote & done', 'prepared & did', 'write & did', 'prepared & done'], 3),
  aptQ('a_v3', 'verbal', 'Replace the underlined words: "The population of Tokyo is GREATER THEN THAT OF ANY OTHER town in the world."', ['greater than that of any other', 'greatest among any other', 'greater than all other', 'No correction required'], 0),
  aptQ('a_v4', 'verbal', 'Choose the word most nearly OPPOSITE in meaning to “Generous”.', ['Kind', 'Selfish', 'Wealthy', 'Honest'], 1),
  // Spatial
  aptQ('a_s1', 'spatial', 'A cube is painted on all faces and cut into 27 equal smaller cubes. How many have exactly one painted face?', ['6', '8', '12', '1'], 0),
  aptQ('a_s2', 'spatial', 'How many triangles are formed when both diagonals are drawn inside a square?', ['4', '6', '8', '2'], 2),
  aptQ('a_s3', 'spatial', 'A clock shows 3:00. Through what angle does the minute hand turn to reach 3:15?', ['45°', '60°', '90°', '180°'], 2),
  aptQ('a_s4', 'spatial', 'In a row of three touching gears, the first turns clockwise. Which way does the third gear turn?', ['Clockwise', 'Anticlockwise', 'It stays still', 'Cannot be known'], 0),
];

export const QUESTIONS: Question[] = [
  ...PERSONALITY,
  ...INTERESTS,
  ...MOTIVATORS,
  ...LEARNING,
  ...INTELLIGENCES,
  ...ANALYTICAL,
];

/* ================================================================== */
/* JUNIOR (Class 2–4) — Multiple Intelligences + simple Aptitude       */
/*  Reframed in kid-friendly language. MI = Yes/No, aptitude = MCQ.    */
/* ================================================================== */
const jMi = (id: string, intelligence: Intelligence, prompt: string): Question =>
  ({ id, section: 'intelligences', timeSec: 40, intelligence, prompt, options: YNS, level: 'junior' });
const jApt = (id: string, skill: AptitudeSkill, prompt: string, options: string[], correct: number): Question =>
  ({ id, section: 'analytical', timeSec: 60, skill, correct, prompt, options: options.map((label) => ({ label })), level: 'junior' });

export const JUNIOR_QUESTIONS: Question[] = [
  // --- Multiple intelligences (2 per intelligence) ---
  jMi('j_mi_lin1', 'linguistic', 'I love reading stories and books.'),
  jMi('j_mi_lin2', 'linguistic', 'I am good at spelling and learning new words.'),
  jMi('j_mi_log1', 'logical', 'I like solving number puzzles and maths problems.'),
  jMi('j_mi_log2', 'logical', 'I enjoy figuring out how things work.'),
  jMi('j_mi_spa1', 'spatial', 'I love drawing, colouring and making things look nice.'),
  jMi('j_mi_spa2', 'spatial', 'I can picture things in my mind and build with blocks or Lego.'),
  jMi('j_mi_kin1', 'kinesthetic', 'I like to move around, dance or play sports.'),
  jMi('j_mi_kin2', 'kinesthetic', 'I learn best by doing things with my hands.'),
  jMi('j_mi_mus1', 'musical', 'I like singing or playing music.'),
  jMi('j_mi_mus2', 'musical', 'I often have a song or a tune in my head.'),
  jMi('j_mi_ip1', 'interpersonal', 'I like playing and working together with other children.'),
  jMi('j_mi_ip2', 'interpersonal', 'I am good at understanding how my friends feel.'),
  jMi('j_mi_intra1', 'intrapersonal', 'I am happy spending time on my own.'),
  jMi('j_mi_intra2', 'intrapersonal', 'I like thinking about my goals and dreams.'),
  jMi('j_mi_nat1', 'naturalist', 'I love animals, plants and being outdoors.'),
  jMi('j_mi_nat2', 'naturalist', 'I like learning about nature, weather and the Earth.'),
  // --- Aptitude (simple) ---
  jApt('j_a_n1', 'numerical', 'What is 16 minus 2?', ['12', '13', '14', '18'], 2),
  jApt('j_a_n2', 'numerical', 'A 5-litre jug and a 3-litre jug are both full of water. How much water is there in total?', ['9 litres', '8 litres', '7 litres', '6 litres'], 1),
  jApt('j_a_n3', 'numerical', 'Complete the pattern: 2, 4, 6, 8, ___', ['9, 10', '10, 12', '12, 14', '7, 9'], 1),
  jApt('j_a_n4', 'numerical', 'Three children have 3 apples each. Each child eats one apple. How many apples are left in total?', ['9', '3', '6', '5'], 2),
  jApt('j_a_v1', 'verbal', 'In the sentence "Class begins at nine", which word is the subject?', ['Class', 'begins', 'at', 'nine'], 0),
  jApt('j_a_v2', 'verbal', 'Which sentence is in the past tense?', ['Amit tells Sunil his name.', 'Amit will tell Sunil his name.', 'Amit told Sunil his name.', 'Amit is telling Sunil his name.'], 2),
  jApt('j_a_v3', 'verbal', 'Which word is spelled correctly?', ['centence', 'sentence', 'santence', 'sentance'], 1),
  jApt('j_a_l1', 'logical', 'Pick the odd one out.', ['Snow', 'Sun', 'Time', 'Rain'], 2),
  jApt('j_a_l2', 'logical', 'Which number comes next? 1, 2, 4, 8, ___', ['10', '12', '16', '9'], 2),
  jApt('j_a_s1', 'social', "Your friend's marks are going down. What is the best thing to do?", ['Tell a teacher or parent so they can help your friend', 'Ignore it — it is not your problem', 'Feel happy that your marks are better', 'Tell other classmates about it'], 0),
  jApt('j_a_s2', 'social', 'A new student joins your class and is sitting alone. What would you do?', ['Go and talk to them and help them feel welcome', 'Wait for them to come to you', 'Ignore them', 'Tell them to find their own friends'], 0),
];

/* ================================================================== */
/* ELEMENTARY (Class 5–7) — Multiple Intelligences + Learning + Aptitude */
/* ================================================================== */
const eMi = (id: string, intelligence: Intelligence, prompt: string, reverse = false): Question =>
  ({ id, section: 'intelligences', timeSec: 40, intelligence, prompt, options: YNS, level: 'elementary', reverse });
const eApt = (id: string, skill: AptitudeSkill, prompt: string, options: string[], correct: number): Question =>
  ({ id, section: 'analytical', timeSec: 60, skill, correct, prompt, options: options.map((label) => ({ label })), level: 'elementary' });
const eLearn = (id: string, prompt: string, options: Option[]): Question =>
  ({ id, section: 'learning', timeSec: T, prompt, options, level: 'elementary' });

export const ELEMENTARY_QUESTIONS: Question[] = [
  // --- Multiple intelligences (3 per intelligence) ---
  eMi('e_mi_lin1', 'linguistic', 'I enjoy reading books and stories for fun.'),
  eMi('e_mi_lin2', 'linguistic', 'I am good at spelling and remembering new words.'),
  eMi('e_mi_lin3', 'linguistic', 'I like writing stories, poems or keeping a journal.'),
  eMi('e_mi_log1', 'logical', 'I enjoy solving maths problems and number puzzles.'),
  eMi('e_mi_log2', 'logical', 'I like games that need logic, like chess, checkers or Sudoku.'),
  eMi('e_mi_log3', 'logical', 'I often ask how and why things work.'),
  eMi('e_mi_spa1', 'spatial', 'I can easily picture how something looks from a different angle.'),
  eMi('e_mi_spa2', 'spatial', 'I enjoy drawing, designing or doing craft projects.'),
  eMi('e_mi_spa3', 'spatial', 'I like building models or arranging things to look good.'),
  eMi('e_mi_kin1', 'kinesthetic', 'I am good at sports, dance or physical activities.'),
  eMi('e_mi_kin2', 'kinesthetic', 'I learn best by doing things with my hands.'),
  eMi('e_mi_kin3', 'kinesthetic', 'I find it hard to sit still for a very long time.'),
  eMi('e_mi_mus1', 'musical', 'Music is important to me and I listen to it often.'),
  eMi('e_mi_mus2', 'musical', 'I can remember tunes and songs easily.'),
  eMi('e_mi_mus3', 'musical', 'I like singing, humming or playing an instrument.'),
  eMi('e_mi_ip1', 'interpersonal', 'I get along well with many different kinds of people.'),
  eMi('e_mi_ip2', 'interpersonal', 'My friends come to me when they need help or advice.'),
  eMi('e_mi_ip3', 'interpersonal', 'I enjoy working in groups and team activities.'),
  eMi('e_mi_intra1', 'intrapersonal', 'I am happy spending time alone with my own thoughts.'),
  eMi('e_mi_intra2', 'intrapersonal', 'I often think about my future goals and what I want to be.'),
  eMi('e_mi_intra3', 'intrapersonal', 'I understand my own feelings well.'),
  eMi('e_mi_nat1', 'naturalist', 'I care about nature, animals and the environment.'),
  eMi('e_mi_nat2', 'naturalist', 'I enjoy learning about plants, weather and the Earth.'),
  eMi('e_mi_nat3', 'naturalist', 'I like being outdoors and exploring nature.'),
  // 4th item per intelligence (two reverse-worded for a consistency check)
  eMi('e_mi_lin4', 'linguistic', 'I would rather avoid reading and writing.', true),
  eMi('e_mi_log4', 'logical', 'I enjoy working things out with numbers and logic.'),
  eMi('e_mi_spa4', 'spatial', 'I notice colours, shapes and how things are arranged.'),
  eMi('e_mi_kin4', 'kinesthetic', 'I would rather sit still than do something active.', true),
  eMi('e_mi_mus4', 'musical', 'I often hum, tap rhythms or have a tune in my head.'),
  eMi('e_mi_ip4', 'interpersonal', 'I can tell how my friends are feeling.'),
  eMi('e_mi_intra4', 'intrapersonal', 'I know what I am good at and what I want to get better at.'),
  eMi('e_mi_nat4', 'naturalist', 'I can name many plants, animals or birds.'),
  { id: 'e_att1', section: 'intelligences', timeSec: 30, prompt: 'Attention check — please choose “No” for this one to show you are reading.', options: YNS, attentionAnswer: 'No', level: 'elementary' },
  // --- Learning style (VARK) ---
  eLearn('e_l1', 'When you learn something new, what helps you most?', [
    { label: 'Seeing pictures, diagrams or colours.', vark: 'V' },
    { label: 'Listening to someone explain it.', vark: 'A' },
    { label: 'Reading and writing it down.', vark: 'R' },
    { label: 'Trying it out with my hands.', vark: 'K' },
  ]),
  eLearn('e_l2', 'To find your way to a new place, you would rather…', [
    { label: 'Look at a map or pictures.', vark: 'V' },
    { label: 'Have someone tell you the directions.', vark: 'A' },
    { label: 'Read written directions.', vark: 'R' },
    { label: 'Just start walking and figure it out.', vark: 'K' },
  ]),
  eLearn('e_l3', 'When you spell a tricky word, you…', [
    { label: 'Picture how the word looks.', vark: 'V' },
    { label: 'Say it out loud to hear it.', vark: 'A' },
    { label: 'Write it down a few ways and choose.', vark: 'R' },
    { label: 'Trace it with your finger.', vark: 'K' },
  ]),
  eLearn('e_l4', 'You learn a new game best by…', [
    { label: 'Watching someone play it first.', vark: 'V' },
    { label: 'Having the rules explained to you.', vark: 'A' },
    { label: 'Reading the rule book.', vark: 'R' },
    { label: 'Just playing and learning as you go.', vark: 'K' },
  ]),
  eLearn('e_l5', 'In class, you like the teacher to use…', [
    { label: 'Diagrams, charts and pictures.', vark: 'V' },
    { label: 'Discussion and talking.', vark: 'A' },
    { label: 'Books, handouts and reading.', vark: 'R' },
    { label: 'Models, experiments and activities.', vark: 'K' },
  ]),
  eLearn('e_l6', 'When you have free time you most enjoy…', [
    { label: 'Drawing, watching or making something visual.', vark: 'V' },
    { label: 'Listening to music or talking with friends.', vark: 'A' },
    { label: 'Reading or writing.', vark: 'R' },
    { label: 'Sports, building or hands-on activities.', vark: 'K' },
  ]),
  // --- Aptitude ---
  eApt('e_a_n1', 'numerical', 'What is 50% of 40?', ['10', '15', '20', '25'], 2),
  eApt('e_a_n2', 'numerical', 'What number comes next? 4, 8, 16, 32, ___', ['48', '64', '40', '50'], 1),
  eApt('e_a_n3', 'numerical', 'A box holds 8 pairs of shoes. How many boxes are needed for 96 pairs?', ['8', '10', '12', '24'], 2),
  eApt('e_a_v1', 'verbal', 'Which word is spelled correctly?', ['Rigerous', 'Rigourous', 'Regerous', 'Rigorous'], 3),
  eApt('e_a_v2', 'verbal', 'Identify the adjective: "Dinesh and Dana were looking for shiny objects in the water."', ['shiny', 'Dinesh', 'water', 'looking'], 0),
  eApt('e_a_v3', 'verbal', 'Fill in the blank: "The window was already ___ when I got here."', ['break', 'breaking', 'broke', 'broken'], 3),
  eApt('e_a_l1', 'logical', 'Which word does NOT belong with the others?', ['branch', 'dirt', 'leaf', 'root'], 1),
  eApt('e_a_l2', 'logical', 'Complete the series: BCB, DED, FGF, HIH, ___', ['HJH', 'JKJ', 'JJJ', 'IJI'], 1),
  eApt('e_a_l3', 'logical', 'Look at the series: 201, 202, 204, 207, … Which number comes next?', ['208', '209', '210', '211'], 3),
  eApt('e_a_s1', 'spatial', 'You fold a flat cross-shaped net. Which solid shape does it make?', ['A cube', 'A cylinder', 'A cone', 'A pyramid'], 0),
  eApt('e_a_soc1', 'social', 'A classmate is being left out of a game. What is the kindest thing to do?', ['Invite them to join in', 'Ignore it', 'Laugh along with the others', 'Tell them to play alone'], 0),
  eApt('e_a_ad1', 'administrative', 'Which option is an EXACT copy of: HD-2571-XQ?', ['HD-2517-XQ', 'HD-2571-XQ', 'HD-2571-QX', 'HB-2571-XQ'], 1),
  eApt('e_a_mec1', 'mechanical', 'In a line of three touching gears, the first turns clockwise. The third gear turns…', ['Clockwise', 'Anticlockwise', 'It stays still', 'Cannot be known'], 0),
  eApt('e_a_mec2', 'mechanical', 'Which of these materials stretches the LEAST?', ['Rubber band', 'Chewing gum', 'Wax', 'Elastic'], 2),
];

/* ================================================================== */
/* SENIOR (11–12) & GRADUATE — shared upper bank + level-specific      */
/*  work-fit and career-field sections. All copy is original.         */
/* ================================================================== */
const EQ5: Option[] = [
  { label: 'Completely true' }, { label: 'Mostly true' }, { label: 'Neutral' },
  { label: 'Mostly false' }, { label: 'Completely false' },
];
const NSY: Option[] = [{ label: 'No' }, { label: 'Not sure' }, { label: 'Yes' }];

/** Shared upper-level sections (interests, personality, motivators, learning, eq, aptitude). */
function upperCommon(level: AssessmentLevel): Question[] {
  const P = level === 'graduate' ? 'g' : 's';
  const yns = (id: string, riasec: Riasec, prompt: string, reverse = false): Question =>
    ({ id: `${P}_${id}`, section: 'interests', timeSec: 40, riasec, prompt, options: YNS, level, reverse });
  const att = (id: string, prompt: string, attentionAnswer: string): Question =>
    ({ id: `${P}_${id}`, section: 'interests', timeSec: 30, prompt, options: YNS, level, attentionAnswer });
  const per = (id: string, axis: MbtiAxis, poles: [string, string], a: string, b: string): Question =>
    ({ id: `${P}_${id}`, section: 'personality', timeSec: T, axis, poles, prompt: 'Which describes you best?', options: [{ label: a }, { label: b }], level });
  const mot = (id: string, motivator: MotivatorKey, prompt: string): Question =>
    ({ id: `${P}_${id}`, section: 'motivators', timeSec: T, motivator, prompt, options: FREQ, level });
  const lrn = (id: string, prompt: string, options: Option[]): Question =>
    ({ id: `${P}_${id}`, section: 'learning', timeSec: T, prompt, options, level });
  const eq = (id: string, eqKey: EqComponent, prompt: string, reverse = false): Question =>
    ({ id: `${P}_${id}`, section: 'eq', timeSec: 40, eqKey, reverse, prompt, options: EQ5, level });
  const apt = (id: string, skill: AptitudeSkill, prompt: string, options: string[], correct: number): Question =>
    ({ id: `${P}_${id}`, section: 'analytical', timeSec: 60, skill, correct, prompt, options: options.map((label) => ({ label })), level });

  return [
    // Interests (RIASEC, 5 per theme + reverse)
    yns('i_r1', 'R', 'Do you enjoy building, repairing or working with tools and machines?'),
    yns('i_r2', 'R', 'Do you like hands-on, practical or outdoor activities?'),
    yns('i_r3', 'R', 'Do you enjoy taking part in sports or physical challenges?'),
    yns('i_r4', 'R', 'Would you enjoy operating equipment, vehicles or machinery?'),
    yns('i_r5', 'R', 'Do you like making or fixing physical things with your hands?'),
    yns('i_r6', 'R', 'Do you dislike hands-on, mechanical or physical work?', true),
    yns('i_i1', 'I', 'Do you enjoy science, research or investigating how things work?'),
    yns('i_i2', 'I', 'Do you like solving complex problems by applying logic?'),
    yns('i_i3', 'I', 'Do you enjoy analysing data, patterns or evidence?'),
    yns('i_i4', 'I', 'Do you like to investigate a question deeply until you understand it?'),
    yns('i_i5', 'I', 'Are you curious about the “why” and “how” behind things?'),
    yns('i_i6', 'I', 'Do you avoid problems that need careful analysis or research?', true),
    yns('i_a1', 'A', 'Do you enjoy creative work like art, design, writing or music?'),
    yns('i_a2', 'A', 'Do you like coming up with original, imaginative ideas?'),
    yns('i_a3', 'A', 'Do you enjoy expressing yourself or performing?'),
    yns('i_a4', 'A', 'Do you prefer making original things over following a fixed method?'),
    yns('i_a5', 'A', 'Do you enjoy design, aesthetics and visual style?'),
    yns('i_s1', 'S', 'Do you enjoy helping, teaching or guiding other people?'),
    yns('i_s2', 'S', 'Do you like taking part in social or community service?'),
    yns('i_s3', 'S', 'Are you good at listening to and supporting others?'),
    yns('i_s4', 'S', 'Do you feel satisfied when you help someone through a problem?'),
    yns('i_s5', 'S', 'Do you enjoy working closely with people more than with things or data?'),
    yns('i_s6', 'S', 'Do you prefer to work with things and data rather than with people?', true),
    yns('i_e1', 'E', 'Do you enjoy leading, persuading or influencing people?'),
    yns('i_e2', 'E', 'Are you interested in business, enterprise and taking initiative?'),
    yns('i_e3', 'E', 'Do you like taking charge and making decisions?'),
    yns('i_e4', 'E', 'Do you enjoy persuading others to support your idea or plan?'),
    yns('i_e5', 'E', 'Would you like to start or run your own venture one day?'),
    yns('i_c1', 'C', 'Do you enjoy organising data, records and details?'),
    yns('i_c2', 'C', 'Do you like working in a structured, systematic way?'),
    yns('i_c3', 'C', 'Are you good at following procedures accurately?'),
    yns('i_c4', 'C', 'Do you like keeping things accurate, orderly and well-organised?'),
    yns('i_c5', 'C', 'Do you find detailed rules, records and procedures boring?', true),
    att('i_att1', 'Attention check — to show you are reading carefully, please choose “No” here.', 'No'),
    // Personality (MBTI, 5 per axis)
    per('p_ei1', 'EI', ['E', 'I'], 'I usually like having many people around me.', 'I enjoy spending time by myself.'),
    per('p_ei2', 'EI', ['E', 'I'], 'I develop ideas by talking them through with others.', 'I develop ideas by thinking them through on my own.'),
    per('p_ei3', 'EI', ['E', 'I'], 'It is easy for me to approach new people.', 'I am more reserved and approach people carefully.'),
    per('p_ei4', 'EI', ['E', 'I'], 'I talk more than I listen.', 'I listen more than I talk.'),
    per('p_ei5', 'EI', ['E', 'I'], 'I recharge by being around other people.', 'I recharge by having quiet time on my own.'),
    per('p_sn1', 'SN', ['S', 'N'], 'I prefer proven, established ways of doing things.', 'I prefer new, original ways of doing things.'),
    per('p_sn2', 'SN', ['S', 'N'], 'I start with facts and then build the bigger idea.', 'I start with the bigger idea and then find the facts.'),
    per('p_sn3', 'SN', ['S', 'N'], 'I trust concrete experience.', 'I trust my instincts and hunches.'),
    per('p_sn4', 'SN', ['S', 'N'], 'I focus on practical details.', 'I focus on possibilities and patterns.'),
    per('p_sn5', 'SN', ['S', 'N'], 'I focus on what is real and happening now.', 'I focus on what could be possible in the future.'),
    per('p_tf1', 'TF', ['T', 'F'], 'I decide with logic and facts.', 'I decide with values and people in mind.'),
    per('p_tf2', 'TF', ['T', 'F'], 'I give direct, honest opinions.', 'I am careful not to hurt others.'),
    per('p_tf3', 'TF', ['T', 'F'], 'I am usually tough-minded.', 'I am usually soft-hearted.'),
    per('p_tf4', 'TF', ['T', 'F'], 'I value fairness and consistency.', 'I value harmony and compassion.'),
    per('p_tf5', 'TF', ['T', 'F'], 'I trust objective analysis most.', 'I trust how people will be affected most.'),
    per('p_jp1', 'JP', ['J', 'P'], 'I make plans and stick to them.', 'I stay flexible and keep options open.'),
    per('p_jp2', 'JP', ['J', 'P'], 'I plan in advance before acting.', 'I take things on without much planning.'),
    per('p_jp3', 'JP', ['J', 'P'], 'I like to finish tasks well before deadlines.', 'I often work best close to the deadline.'),
    per('p_jp4', 'JP', ['J', 'P'], 'I prefer order and structure.', 'I prefer spontaneity and variety.'),
    per('p_jp5', 'JP', ['J', 'P'], 'I like to settle things and have them decided.', 'I like to keep my options open as long as possible.'),
    // Motivators (3 per value)
    mot('m1', 'adventure', 'Adventure and excitement, even with some physical risk.'),
    mot('m1b', 'adventure', 'A job that keeps taking me to new places and situations.'),
    mot('m1c', 'adventure', 'Taking bold risks for an exciting opportunity.'),
    mot('m2', 'independence', 'Freedom to work on my own and make my own decisions.'),
    mot('m2b', 'independence', 'Organising my own work rather than being told exactly what to do.'),
    mot('m2c', 'independence', 'Being my own boss and setting my own direction.'),
    mot('m3', 'continuous-learning', 'Constantly learning new things and upgrading my skills.'),
    mot('m3b', 'continuous-learning', 'Work where I would feel bored if I stopped learning.'),
    mot('m3c', 'continuous-learning', 'Regularly mastering new skills and ideas.'),
    mot('m4', 'high-paced', 'A fast-paced, competitive and challenging environment.'),
    mot('m4b', 'high-paced', 'Doing my best work when there is challenge and competition.'),
    mot('m4c', 'high-paced', 'A busy, high-energy workplace rather than a calm one.'),
    mot('m5', 'structure', 'A structured environment with clear rules and procedures.'),
    mot('m5b', 'structure', 'Clear routines and well-defined expectations.'),
    mot('m5c', 'structure', 'Work that is organised and predictable.'),
    mot('m6', 'creativity', 'Doing creative work and expressing original ideas.'),
    mot('m6b', 'creativity', 'A job where I can create and design new things.'),
    mot('m6c', 'creativity', 'Freedom to express myself rather than follow a fixed method.'),
    mot('m7', 'social-service', 'Work that serves society and helps other people.'),
    mot('m7b', 'social-service', 'Work that clearly improves other people’s lives.'),
    mot('m7c', 'social-service', 'Meaningful work, even over simply a higher salary.'),
    // Learning (VARK)
    lrn('l1', 'When you learn something new, what helps you most?', [
      { label: 'Diagrams, charts and images.', vark: 'V' },
      { label: 'Listening and discussing.', vark: 'A' },
      { label: 'Reading and writing notes.', vark: 'R' },
      { label: 'Hands-on practice.', vark: 'K' },
    ]),
    lrn('l2', 'To learn how something works, you would rather…', [
      { label: 'Watch a demonstration or video.', vark: 'V' },
      { label: 'Have it explained to you.', vark: 'A' },
      { label: 'Read the manual or documentation.', vark: 'R' },
      { label: 'Take it apart and try it yourself.', vark: 'K' },
    ]),
    lrn('l3', 'In a lecture, you usually…', [
      { label: 'Draw diagrams while listening.', vark: 'V' },
      { label: 'Listen carefully and discuss.', vark: 'A' },
      { label: 'Make detailed written notes.', vark: 'R' },
      { label: 'Prefer examples and real applications.', vark: 'K' },
    ]),
    lrn('l4', 'To present an idea, you would prefer to…', [
      { label: 'Use diagrams, charts and visuals.', vark: 'V' },
      { label: 'Speak and explain it aloud.', vark: 'A' },
      { label: 'Write it out and read from notes.', vark: 'R' },
      { label: 'Build a model or demo.', vark: 'K' },
    ]),
    lrn('l5', 'You prefer a teacher or presenter who uses…', [
      { label: 'Diagrams, charts and graphs.', vark: 'V' },
      { label: 'Discussion and Q&A.', vark: 'A' },
      { label: 'Handouts, books and readings.', vark: 'R' },
      { label: 'Demonstrations and practical sessions.', vark: 'K' },
    ]),
    lrn('l6', 'When you revise for an exam, you…', [
      { label: 'Make mind-maps and colour-coded notes.', vark: 'V' },
      { label: 'Explain topics aloud or in a group.', vark: 'A' },
      { label: 'Re-read and re-write your notes.', vark: 'R' },
      { label: 'Practise with past papers and problems.', vark: 'K' },
    ]),
    // Emotional Quotient (5-point; some reverse-scored)
    eq('eq_sa1', 'selfAwareness', 'I usually recognise when I am feeling stressed.'),
    eq('eq_sa2', 'selfAwareness', 'When I feel anxious, I can usually name the reason.'),
    eq('eq_sa3', 'selfAwareness', 'I am often unsure what mood I am in.', true),
    eq('eq_me1', 'managingEmotions', 'I can stay calm even when I feel angry or provoked.'),
    eq('eq_me2', 'managingEmotions', 'When something upsets me, I cannot stop thinking about it.', true),
    eq('eq_me3', 'managingEmotions', 'I bounce back quickly after a setback.'),
    eq('eq_mo1', 'motivation', 'I feel genuinely passionate about what I do.'),
    eq('eq_mo2', 'motivation', 'I can motivate myself when I feel low.'),
    eq('eq_mo3', 'motivation', 'I find it hard to get started on challenging tasks.', true),
    eq('eq_em1', 'empathy', 'I can sense when others are feeling down or upset.'),
    eq('eq_em2', 'empathy', "I can see things from another person's point of view."),
    eq('eq_em3', 'empathy', 'I find it hard to understand how others feel.', true),
    eq('eq_rl1', 'relationship', 'I build strong relationships with the people I work with.'),
    eq('eq_rl2', 'relationship', 'Others feel encouraged after talking with me.'),
    eq('eq_rl3', 'relationship', 'I put my own needs ahead of everyone else’s.', true),
    // Aptitude (full skill range)
    apt('a_n1', 'numerical', "A salary is increased by 10% and then reduced by 10%. What is the net change?", ['No change', '1% decrease', '2% decrease', '1% increase'], 1),
    apt('a_n2', 'numerical', 'A man buys a cycle for ₹1000 and sells it at a 15% loss. The selling price is…', ['₹800', '₹850', '₹900', '₹750'], 1),
    apt('a_n3', 'numerical', 'What is the percentage increase from 5 to 20?', ['100%', '200%', '300%', '400%'], 2),
    apt('a_n4', 'numerical', 'A shirt costs ₹800 after a 20% discount. What was the original price?', ['₹1000', '₹960', '₹1020', '₹900'], 0),
    apt('a_l1', 'logical', 'Complete the series: ELFA, GLHA, ____, MLNA', ['OLPA', 'ILJA', 'KLMA', 'KLLA'], 1),
    apt('a_l2', 'logical', 'Which word does NOT belong: branch, dirt, leaf, root?', ['branch', 'dirt', 'leaf', 'root'], 1),
    apt('a_l3', 'logical', 'Find the next number: 4, 8, 16, 32, ___', ['48', '64', '40', '50'], 1),
    apt('a_l4', 'logical', 'Pointing to a photo, Reena said: “He is the son of my grandfather’s only son.” How is the boy related to Reena?', ['Brother', 'Cousin', 'Uncle', 'Father'], 0),
    apt('a_v1', 'verbal', 'Choose the correctly spelled word.', ['Rigerous', 'Rigourous', 'Rigorous', 'Regerous'], 2),
    apt('a_v2', 'verbal', 'Fill in the blank: "The window was already ___ when I got here."', ['break', 'breaking', 'broke', 'broken'], 3),
    apt('a_v3', 'verbal', 'Choose the word most nearly OPPOSITE in meaning to “Generous”.', ['Kind', 'Selfish', 'Wealthy', 'Honest'], 1),
    apt('a_s1', 'spatial', 'A cube is painted on all faces, then cut into 27 equal cubes. How many have exactly one painted face?', ['6', '8', '12', '1'], 0),
    apt('a_s2', 'spatial', 'A clock shows 3:00. Through what angle does the minute hand turn to reach 3:15?', ['45°', '60°', '90°', '180°'], 2),
    apt('a_ad1', 'administrative', 'Which option is an EXACT copy of: HD-2571-XQ?', ['HD-2517-XQ', 'HD-2571-XQ', 'HD-2571-QX', 'HB-2571-XQ'], 1),
    apt('a_mec1', 'mechanical', 'A car and a bowling ball are dropped from the same height (ignore air resistance). Which lands first?', ['The car', 'The bowling ball', 'Both at the same time', 'Cannot be known'], 2),
    apt('a_lead1', 'leadership', 'A team member is struggling to keep up with the workload. As the leader, the best response is to…', ['Take over their tasks yourself', 'Give them easier tasks and offer support to improve', 'Ignore it and focus on your own work', 'Replace them immediately'], 1),
  ];
}

/** "If you had to make a living, would you choose this work?" — cluster preferences. */
function workfitFor(level: AssessmentLevel): Question[] {
  const P = level === 'graduate' ? 'g' : 's';
  const wf = (id: string, cluster: string, prompt: string): Question =>
    ({ id: `${P}_wf_${id}`, section: 'workfit', timeSec: 40, cluster, prompt, options: YNS, level });
  return [
    wf('eng', 'Engineering & Technology', 'Design and build machines, gadgets or structures.'),
    wf('it', 'Information Technology', 'Write code or work with computers and software.'),
    wf('sci', 'Science & Research', 'Run experiments and research to discover new things.'),
    wf('ent', 'Entrepreneurship', 'Start or run a business of your own.'),
    wf('fin', 'Accounts & Finance', 'Manage money, accounts or investments.'),
    wf('art', 'Arts & Media', 'Create art, design, music or visual content.'),
    wf('edu', 'Education & Training', 'Teach, train or guide other people.'),
    wf('health', 'Healthcare', 'Care for patients and help people stay healthy.'),
    wf('human', 'Human Service', "Help people with their problems and wellbeing."),
    wf('biz', 'Business Management', 'Lead a team and manage a company or project.'),
    wf('mkt', 'Marketing & Advertising', 'Market, advertise or sell products and services.'),
    wf('gov', 'Government & Legal', 'Work in law, government or public administration.'),
  ];
}

const cf = (level: AssessmentLevel) => (id: string, cluster: string, prompt: string): Question =>
  ({ id: `${level === 'graduate' ? 'g' : 's'}_cf_${id}`, section: 'careerfields', timeSec: 40, cluster, prompt, options: NSY, level });

const SENIOR_FIELDS: Question[] = (() => { const f = cf('senior'); return [
  f('def', 'Government & Legal', 'Defence & armed forces — protect the country through training, planning and teamwork.'),
  f('swe', 'Information Technology', 'Software engineering — build apps and programs that solve real problems.'),
  f('robo', 'Engineering & Technology', 'Robotics & electronics — design machines and devices that sense, think and move.'),
  f('fin', 'Accounts & Finance', 'Finance & banking — help people and businesses manage money.'),
  f('cyber', 'Information Technology', 'Cyber security — protect websites and networks from hackers.'),
  f('med', 'Health Science', 'Medicine & healthcare — diagnose and treat patients.'),
  f('law', 'Government & Legal', 'Law — advise people and represent them to solve legal issues.'),
  f('teach', 'Education & Training', 'Teaching — explain lessons and help students learn.'),
  f('design', 'Design & Architecture', 'Design & fashion — design clothes, products or visuals.'),
  f('media', 'Media & Communication', 'Journalism & media — research and share news and stories.'),
  f('psy', 'Human Service', 'Psychology — understand behaviour and support mental health.'),
  f('data', 'Science & Research', 'Data & analytics — use data and statistics to find insights.'),
  f('ent', 'Entrepreneurship', 'Entrepreneurship — create and grow your own venture.'),
  f('mkt', 'Marketing & Advertising', 'Marketing — plan campaigns and promote products and brands.'),
  f('env', 'Science & Research', 'Environment & sustainability — work on climate and nature problems.'),
  f('hmgmt', 'Healthcare', 'Hospital & healthcare management — keep hospitals running smoothly.'),
]; })();

const GRADUATE_FIELDS: Question[] = (() => { const f = cf('graduate'); return [
  f('pm', 'Administration', 'Project management — plan and deliver projects on time and on budget.'),
  f('ib', 'Accounts & Finance', 'Investment banking & finance — raise capital and advise on deals.'),
  f('ai', 'Information Technology', 'AI & machine learning — build intelligent systems and models.'),
  f('civil', 'Government & Legal', 'Civil services & public administration — run government and public services.'),
  f('consult', 'Business Management', 'Management consulting — solve business problems for companies.'),
  f('digi', 'Marketing & Advertising', 'Digital marketing — grow brands online with data-driven campaigns.'),
  f('ca', 'Accounts & Finance', 'Chartered accountancy & audit — manage and check financial records.'),
  f('swe', 'Information Technology', 'Software development — design and ship production software.'),
  f('ux', 'Design & Architecture', 'UX & product design — design useful, well-crafted products.'),
  f('res', 'Science & Research', 'Research & academia — investigate and publish new knowledge.'),
  f('hr', 'Human Service', 'Human resources — hire, develop and support people at work.'),
  f('scm', 'Administration', 'Supply chain & logistics — move goods efficiently at scale.'),
  f('clin', 'Healthcare', 'Clinical & healthcare roles — care for patients professionally.'),
  f('legal', 'Government & Legal', 'Corporate law — handle contracts, compliance and disputes.'),
  f('content', 'Media & Communication', 'Content & media production — create video, writing and media.'),
  f('startup', 'Entrepreneurship', 'Entrepreneurship & startups — build a venture from the ground up.'),
]; })();

export const SENIOR_QUESTIONS: Question[] = [...upperCommon('senior'), ...workfitFor('senior'), ...SENIOR_FIELDS];
export const GRADUATE_QUESTIONS: Question[] = [...upperCommon('graduate'), ...workfitFor('graduate'), ...GRADUATE_FIELDS];

export type AnswerMap = Record<string, number>;

/** Questions belonging to a section, in order. */
export function questionsForSection(id: SectionId): Question[] {
  return QUESTIONS.filter((q) => q.section === id);
}

/** Total seconds budgeted for the whole test (used for the global timer). */
export const TOTAL_TIME_SEC = QUESTIONS.reduce((s, q) => s + q.timeSec, 0);

/* ------------------------------------------------------------------ */
/* Level-aware selection                                               */
/* ------------------------------------------------------------------ */

/** Every authored question across all level banks. */
export const ALL_QUESTIONS: Question[] = [
  ...QUESTIONS, ...JUNIOR_QUESTIONS, ...ELEMENTARY_QUESTIONS,
  ...SENIOR_QUESTIONS, ...GRADUATE_QUESTIONS,
];

/** Questions for a level, ordered by that level's section order. Untagged = secondary. */
export function questionsForLevel(level: AssessmentLevel): Question[] {
  const order = getLevel(level).sections;
  const pool = ALL_QUESTIONS.filter((q) => (q.level ?? 'secondary') === level);
  return order.flatMap((secId) => pool.filter((q) => q.section === secId));
}

/** Section metas for a level, in the level's order (only sections that exist). */
export function sectionsForLevel(level: AssessmentLevel): SectionMeta[] {
  return getLevel(level)
    .sections.map((id) => SECTIONS.find((s) => s.id === id))
    .filter((s): s is SectionMeta => Boolean(s));
}

/** Questions for one section within one level. */
export function levelSectionQuestions(level: AssessmentLevel, id: SectionId): Question[] {
  return questionsForLevel(level).filter((q) => q.section === id);
}

/* ------------------------------------------------------------------ */
/* Balanced sampler                                                    */
/*  Keeps the test short without losing reliability: it caps how many  */
/*  items each trait contributes, while ALWAYS keeping reverse-keyed    */
/*  and attention-check items (they power the quality gate) and every   */
/*  work-fit / career-field item (one per cluster, needed for matching).*/
/* ------------------------------------------------------------------ */
export type SamplingProfile = 'full' | 'standard' | 'quick';

/** Max NON-reverse items kept per trait group, per section. */
const SAMPLE_CAPS: Record<Exclude<SamplingProfile, 'full'>, Record<SectionId, number>> = {
  standard: { personality: 4, interests: 4, motivators: 2, learning: 6, intelligences: 3, analytical: 3, eq: 99, workfit: 99, careerfields: 99 },
  quick: { personality: 3, interests: 3, motivators: 2, learning: 4, intelligences: 2, analytical: 2, eq: 2, workfit: 99, careerfields: 99 },
};

/** Which field groups a section's items into traits (so each trait is capped fairly). */
const GROUP_KEY: Record<SectionId, (q: Question) => string> = {
  personality: (q) => q.axis ?? '_',
  interests: (q) => q.riasec ?? '_',
  motivators: (q) => q.motivator ?? '_',
  intelligences: (q) => q.intelligence ?? '_',
  analytical: (q) => q.skill ?? '_',
  eq: (q) => q.eqKey ?? '_',
  learning: () => '_',
  workfit: () => '_',
  careerfields: () => '_',
};

/** A balanced subset of one section for a level. Deterministic (authored order). */
export function balancedSectionQuestions(level: AssessmentLevel, id: SectionId, profile: SamplingProfile = 'standard'): Question[] {
  const qs = levelSectionQuestions(level, id);
  if (profile === 'full') return qs;
  const cap = SAMPLE_CAPS[profile][id] ?? 99;
  const key = GROUP_KEY[id];
  const seen: Record<string, number> = {};
  const out: Question[] = [];
  for (const q of qs) {
    if (q.attentionAnswer || q.reverse) { out.push(q); continue; } // always keep QC items
    const k = key(q);
    seen[k] = (seen[k] ?? 0) + 1;
    if (seen[k] <= cap) out.push(q);
  }
  return out;
}

/** A balanced subset of the whole test for a level, in the level's section order. */
export function balancedQuestionsForLevel(level: AssessmentLevel, profile: SamplingProfile = 'standard'): Question[] {
  return getLevel(level).sections.flatMap((id) => balancedSectionQuestions(level, id, profile));
}
