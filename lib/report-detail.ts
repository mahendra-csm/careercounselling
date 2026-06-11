/**
 * Per-trait detail content for the report's "in detail" pages — original
 * OneGrasp copy (Meaning + a band-based Expert Analysis + a Development Plan).
 * Matched to a trait by keyword, with a sensible generic fallback.
 */

export type Band = 'high' | 'medium' | 'low';
export function bandOf(percent: number): Band {
  return percent >= 66 ? 'high' : percent >= 45 ? 'medium' : 'low';
}
/** Map a 0–100 score onto a 1–9 indicator (like a stanine band). */
export function scale9(percent: number): number {
  return Math.min(9, Math.max(1, Math.round((percent / 100) * 9)));
}

export interface TraitDetail {
  meaning: string;
  analysis: string;
  develop: string[];
}

interface TraitContent {
  keys: string[]; // lowercase keywords matched against the trait label
  meaning: string;
  high: string;
  medium: string;
  low: string;
  develop: string[];
}

const LIBRARY: TraitContent[] = [
  // ---- Emotional Quotient ----
  {
    keys: ['self awareness', 'self-aware', 'awareness'],
    meaning: 'Knowing your own emotions as they happen and understanding how they shape your decisions.',
    high: 'You read your own feelings clearly and rarely let a passing mood derail you — a strong base for steady decisions.',
    medium: 'You usually understand what you are feeling, though strong moments can occasionally cloud your judgement.',
    low: 'Your feelings can build before you notice them, which sometimes drives reactions you later question.',
    develop: ['Name the emotion you feel in tough moments before reacting.', 'Keep a short daily note of what triggered strong feelings.'],
  },
  {
    keys: ['managing emotions', 'regulation', 'manage'],
    meaning: 'Staying composed and channelling emotions productively, especially under pressure.',
    high: 'You keep your cool when it counts and bounce back from setbacks — a real asset in high-pressure situations.',
    medium: 'You handle most situations well, but very stressful moments can occasionally get the better of you.',
    low: 'High pressure can make it hard to stay composed, which can affect performance and relationships.',
    develop: ['Use a 10-second pause (breathe) before responding when upset.', 'Reframe setbacks as “what can I learn?” rather than “why me?”.'],
  },
  {
    keys: ['motivation'],
    meaning: 'The inner drive to set goals, stay committed and keep going despite obstacles.',
    high: 'You set goals and pursue them with genuine drive — you keep going when others give up.',
    medium: 'You start strong; building habits that sustain effort through dips will help you finish stronger.',
    low: 'Goals can lose steam when challenges appear. Small, visible wins will help rebuild momentum.',
    develop: ['Set SMART goals and track them where you can see them daily.', 'Reward yourself for finishing milestones, not just big wins.'],
  },
  {
    keys: ['empathy'],
    meaning: 'Sensing how others feel and responding with understanding.',
    high: 'You read people well and respond with warmth — people feel understood around you.',
    medium: 'You connect with others, though you may sometimes miss subtler emotional cues.',
    low: 'Tuning into others’ feelings takes conscious effort, which can make some interactions feel transactional.',
    develop: ['Listen to understand, not to reply — let people finish.', 'Ask “how did that feel for you?” more often.'],
  },
  {
    keys: ['relationship', 'social', 'pro social', 'conflict'],
    meaning: 'Building trust, cooperating and handling disagreements constructively.',
    high: 'You build strong relationships and navigate conflict gracefully — natural ground for teamwork and leadership.',
    medium: 'You get along with most people; handling difficult conversations more directly will strengthen your bonds.',
    low: 'Group dynamics and conflict can feel draining. Small, consistent social habits will build confidence.',
    develop: ['Address small frictions early before they grow.', 'Practise giving honest feedback kindly and specifically.'],
  },
  // ---- Multiple intelligences ----
  {
    keys: ['linguistic'],
    meaning: 'Skill with words — reading, writing, speaking and expressing ideas clearly.',
    high: 'Words come naturally to you. You explain, persuade and absorb written ideas with ease.',
    medium: 'You communicate well; deliberate reading and writing practice will sharpen this further.',
    low: 'Expressing ideas in words takes effort — a great area to grow through reading and writing daily.',
    develop: ['Read for 15 minutes daily across varied topics.', 'Write a short summary of what you learn each day.'],
  },
  {
    keys: ['logical', 'mathematical', 'logical-mathematical'],
    meaning: 'Reasoning with numbers, patterns and step-by-step logic.',
    high: 'You analyse problems methodically and spot patterns quickly — strong for STEM and analytical fields.',
    medium: 'You reason well; regular puzzles and practice will lift you into top-tier problem solving.',
    low: 'Step-by-step reasoning takes effort now, but it responds quickly to deliberate practice.',
    develop: ['Solve a puzzle (Sudoku, logic, maths) a few times a week.', 'Break big problems into small, ordered steps.'],
  },
  {
    keys: ['spatial', 'visual'],
    meaning: 'Thinking in pictures — visualising objects, maps and designs in your mind.',
    high: 'You picture and manipulate objects and spaces easily — great for design, engineering and the arts.',
    medium: 'You visualise reasonably well; sketching and 3D activities will strengthen this.',
    low: 'Mental imagery is harder for you now; drawing and building activities will help it grow.',
    develop: ['Sketch ideas instead of only writing them.', 'Try jigsaal/3D puzzles, model-building or geometry.'],
  },
  {
    keys: ['kinesthetic', 'bodily'],
    meaning: 'Learning and expressing through movement, building and hands-on doing.',
    high: 'You learn best by doing and are skilled with your hands and body — ideal for practical, active work.',
    medium: 'You enjoy hands-on work; pairing it with reflection will deepen your learning.',
    low: 'Hands-on tasks aren’t your default; mixing in physical practice can still help you learn.',
    develop: ['Turn study into activity — build, demo or act it out.', 'Take regular movement breaks while learning.'],
  },
  {
    keys: ['musical'],
    meaning: 'Sensitivity to rhythm, melody and sound.',
    high: 'You notice rhythm and tone keenly and remember tunes easily — a creative strength.',
    medium: 'You appreciate music; using rhythm and sound as memory aids can help you learn.',
    low: 'Music isn’t a dominant strength, but rhythm can still be a handy learning tool.',
    develop: ['Use rhythm or jingles to memorise facts.', 'Explore an instrument or music software for fun.'],
  },
  {
    keys: ['interpersonal'],
    meaning: 'Understanding and working well with other people.',
    high: 'You understand others and lead and collaborate naturally — strong for people-centred careers.',
    medium: 'You work well with others; taking the lead more often will build your influence.',
    low: 'Group settings take energy; small steps in collaboration will build comfort and skill.',
    develop: ['Take a small leadership role in a group task.', 'Practise active listening and asking good questions.'],
  },
  {
    keys: ['intrapersonal'],
    meaning: 'Self-understanding — knowing your strengths, goals and inner world.',
    high: 'You know yourself well and work independently with clear goals — a foundation for self-direction.',
    medium: 'You reflect reasonably; regular goal-setting will sharpen your self-direction.',
    low: 'Self-reflection is an area to grow — journaling and goal reviews will help a lot.',
    develop: ['Reflect weekly: what went well, what to change.', 'Write down personal goals and review them monthly.'],
  },
  {
    keys: ['naturalist', 'nature'],
    meaning: 'Connecting with nature and recognising patterns in the living world.',
    high: 'You observe and classify the natural world keenly — strong for life sciences and the environment.',
    medium: 'You enjoy nature; structured observation will deepen this strength.',
    low: 'Nature isn’t a dominant theme, but observation skills transfer to many fields.',
    develop: ['Observe and note patterns in nature around you.', 'Explore documentaries or projects on the environment.'],
  },
  // ---- Personality (decision-style poles) ----
  {
    keys: ['introver'],
    meaning: 'You recharge through reflection and depth, and do your best thinking with focus and quiet.',
    high: 'You process ideas internally before sharing, bringing calm, considered depth to your work.',
    medium: 'You balance reflection with interaction, thinking things through before you speak.',
    low: 'You lean reflective but adapt comfortably to social settings.',
    develop: ['Share your ideas out loud sooner — others value them.', 'Protect focused solo time for your best work.'],
  },
  {
    keys: ['extraver'],
    meaning: 'You recharge through people and action, and think best by talking things through.',
    high: 'You bring energy and connection to a room and learn quickly by doing and discussing.',
    medium: 'You enjoy people and also value some quiet to recharge.',
    low: 'You are sociable but comfortable working independently too.',
    develop: ['Pause to reflect before deciding.', 'Listen as much as you speak.'],
  },
  {
    keys: ['sensing'],
    meaning: 'You trust facts, detail and proven, practical experience.',
    high: 'You are grounded and reliable, turning ideas into concrete, workable steps.',
    medium: 'You value facts while staying open to the bigger idea.',
    low: 'You use detail and intuition fairly evenly.',
    develop: ['Step back to see the bigger picture too.', 'Stay open to new, untested ideas.'],
  },
  {
    keys: ['intuit'],
    meaning: 'You trust patterns, meaning and future possibilities.',
    high: 'You see connections and the big picture, and enjoy imagining what could be.',
    medium: 'You balance big-picture thinking with practical detail.',
    low: 'You blend possibilities with concrete facts.',
    develop: ['Ground big ideas in practical detail.', 'Check your hunches against the facts.'],
  },
  {
    keys: ['thinking'],
    meaning: 'You decide with logic, fairness and objective analysis.',
    high: 'You weigh decisions rationally and value competence and clear reasoning.',
    medium: 'You use logic while considering people too.',
    low: 'You balance logic and values fairly evenly.',
    develop: ['Factor in how decisions affect people.', 'Give honest feedback with warmth.'],
  },
  {
    keys: ['feeling'],
    meaning: 'You decide with values, empathy and people in mind.',
    high: 'You build harmony and consider the human impact of every choice.',
    medium: 'You weigh people and logic together when deciding.',
    low: 'You blend empathy with objective analysis.',
    develop: ['Balance empathy with objective facts.', 'Hold healthy boundaries when needed.'],
  },
  {
    keys: ['judging'],
    meaning: 'You like structure, plans and clear next steps.',
    high: 'You are organised, decisive and reliable — you get things finished.',
    medium: 'You plan ahead while staying open to change.',
    low: 'You mix planning with a flexible approach.',
    develop: ['Stay flexible when plans must change.', 'Leave room for new options before deciding.'],
  },
  {
    keys: ['perceiv'],
    meaning: 'You like flexibility and keeping your options open.',
    high: 'You are adaptable, curious and spontaneous, and thrive when plans can flex.',
    medium: 'You stay flexible while meeting key commitments.',
    low: 'You balance openness with structure.',
    develop: ['Set a few firm deadlines to finish strong.', 'Make key decisions before all options close.'],
  },
  // ---- Aptitude / abilities ----
  {
    keys: ['numerical'],
    meaning: 'Working with numbers and solving mathematical problems quickly and accurately.',
    high: 'You handle numbers and quantitative problems with ease — strong for STEM, finance and analytics.',
    medium: 'You are comfortable with everyday numbers; practice will lift higher-level work.',
    low: 'Numbers take effort now, but targeted practice improves this fast.',
    develop: ['Practise mental maths and word problems regularly.', 'Use real examples (budgets, scores) to build number sense.'],
  },
  {
    keys: ['verbal'],
    meaning: 'Understanding words, grammar and meaning, and using language precisely.',
    high: 'You read, interpret and express ideas in words with skill — great for communication-heavy fields.',
    medium: 'You communicate well; wider reading will sharpen precision and range.',
    low: 'Language precision is a growth area — daily reading and writing will help.',
    develop: ['Read widely and learn new words in context.', 'Summarise what you read in your own words.'],
  },
  {
    keys: ['leadership'],
    meaning: 'Taking charge, making decisions and guiding others toward a goal.',
    high: 'You step up, decide and bring people with you — natural ground for leadership roles.',
    medium: 'You can lead when needed; taking initiative more often will build confidence.',
    low: 'Leading isn’t your default yet; small leadership roles will grow the skill.',
    develop: ['Volunteer to lead a small team task.', 'Practise making clear decisions and owning them.'],
  },
  {
    keys: ['administrative', 'organising', 'organis'],
    meaning: 'Planning, organising and managing tasks, time and details.',
    high: 'You plan and organise reliably and keep details on track — a real operational strength.',
    medium: 'You stay reasonably organised; simple systems will make you more effective.',
    low: 'Organisation is a growth area; light planning habits will help a lot.',
    develop: ['Use a simple to-do list or planner daily.', 'Break big tasks into ordered steps.'],
  },
  {
    keys: ['mechanical'],
    meaning: 'Understanding how machines and physical systems work, and applying them.',
    high: 'You grasp mechanical concepts and apply them well — strong for engineering and hands-on tech.',
    medium: 'You understand familiar mechanics; hands-on practice will deepen this.',
    low: 'Mechanical reasoning grows quickly with practical, hands-on exposure.',
    develop: ['Take things apart (safely) to see how they work.', 'Watch how-it-works videos and try small builds.'],
  },
];

const GENERIC: TraitContent = {
  keys: [],
  meaning: 'A measured signal from your assessment that contributes to your overall profile.',
  high: 'This is a clear strength in your profile — lean into it and build career options around it.',
  medium: 'This is a developing area — steady, deliberate practice will move it forward.',
  low: 'This is a growth area right now; with focused effort it can improve measurably.',
  develop: ['Practise this skill in short, regular sessions.', 'Seek feedback and apply it in real tasks.'],
};

export function detailFor(label: string, percent: number): TraitDetail {
  const l = label.toLowerCase();
  const match = LIBRARY.find((t) => t.keys.some((k) => l.includes(k))) ?? GENERIC;
  const band = bandOf(percent);
  return {
    meaning: match.meaning,
    analysis: band === 'high' ? match.high : band === 'medium' ? match.medium : match.low,
    develop: band === 'high' ? ['You have scored well in this trait — keep using and stretching it.'] : match.develop,
  };
}
