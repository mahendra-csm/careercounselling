/**
 * Assessment levels (grade tracks).
 *
 * Each level has its own age-appropriate question bank and its own ordered set
 * of sections, mirroring how the source assessments are structured:
 *   - Junior (2–4):    Multiple Intelligences + simple Aptitude
 *   - Elementary (5–7): Multiple Intelligences + Learning + Aptitude
 *   - Secondary (8–10): the full 6-section test (current default)
 *   - Senior (11–12):  Interests + Personality + Motivators + Learning +
 *                      Work-fit + EQ + Aptitude + Career-fields
 *   - Graduate:        same as Senior, with graduate-oriented career fields
 *
 * "Professional" is intentionally excluded.
 */

export type AssessmentLevel = 'junior' | 'elementary' | 'secondary' | 'senior' | 'graduate';

/**
 * Section ids used across all levels. The first six already exist in the
 * 8–10 bank; the last three are added for the senior/graduate tracks.
 */
export type LevelSectionId =
  | 'personality'
  | 'interests'
  | 'motivators'
  | 'learning'
  | 'intelligences'
  | 'analytical'
  | 'eq' // emotional quotient (self-report)
  | 'workfit' // "if you had to make a living…" — work/cluster preferences
  | 'careerfields'; // "would you like to work in this field?" (EL items)

export interface LevelMeta {
  id: AssessmentLevel;
  /** Short label, e.g. "Class 2–4". */
  classes: string;
  /** Display title, e.g. "Junior Explorer". */
  title: string;
  /** One-line description shown on the picker card. */
  blurb: string;
  /** Brand accent (matches report/palette tones). */
  accent: string;
  /** Ordered sections for this level. */
  sections: LevelSectionId[];
  /** Whether the question bank for this level is authored & live. */
  status: 'ready' | 'coming-soon';
}

export const LEVELS: LevelMeta[] = [
  {
    id: 'junior',
    classes: 'Class 2–4',
    title: 'Junior Explorer',
    blurb: 'A short, playful discovery of your natural smarts and basic reasoning.',
    accent: '#4E8C6A',
    sections: ['intelligences', 'analytical'],
    status: 'ready',
  },
  {
    id: 'elementary',
    classes: 'Class 5–7',
    title: 'Young Discoverer',
    blurb: 'Your multiple intelligences, how you learn, and your reasoning strengths.',
    accent: '#4F84AE',
    sections: ['intelligences', 'learning', 'analytical'],
    status: 'ready',
  },
  {
    id: 'secondary',
    classes: 'Class 8–10',
    title: 'Career Discovery',
    blurb: 'The full six-lens assessment: personality, interests, motivators, learning, intelligences and reasoning.',
    accent: '#3F6CA0',
    sections: ['personality', 'interests', 'motivators', 'learning', 'intelligences', 'analytical'],
    status: 'ready',
  },
  {
    id: 'senior',
    classes: 'Class 11–12',
    title: 'Stream & Career Planner',
    blurb: 'A complete profile plus emotional quotient and real-world career-field interest, for stream and career decisions.',
    accent: '#6E5A9E',
    sections: ['interests', 'personality', 'motivators', 'learning', 'workfit', 'eq', 'analytical', 'careerfields'],
    status: 'ready',
  },
  {
    id: 'graduate',
    classes: 'Graduates',
    title: 'Career Direction',
    blurb: 'A full professional-readiness profile with emotional quotient and graduate career-field fitment.',
    accent: '#BE7B4E',
    sections: ['interests', 'personality', 'motivators', 'learning', 'workfit', 'eq', 'analytical', 'careerfields'],
    status: 'ready',
  },
];

export const DEFAULT_LEVEL: AssessmentLevel = 'secondary';

export function getLevel(id: AssessmentLevel | string | undefined): LevelMeta {
  return LEVELS.find((l) => l.id === id) ?? LEVELS.find((l) => l.id === DEFAULT_LEVEL)!;
}

/** Map a school class (number or "Graduate") to its assessment level. */
export function levelForClass(cls: string | number | undefined): AssessmentLevel {
  if (cls == null) return DEFAULT_LEVEL;
  const s = String(cls).trim().toLowerCase();
  if (s.startsWith('grad') || s === 'ug' || s === 'pg') return 'graduate';
  const n = parseInt(s, 10);
  if (Number.isNaN(n)) return DEFAULT_LEVEL;
  if (n <= 4) return 'junior';
  if (n <= 7) return 'elementary';
  if (n <= 10) return 'secondary';
  return 'senior'; // 11, 12
}
