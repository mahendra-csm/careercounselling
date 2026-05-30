export interface SkillCategory {
  name: string;
  skills: string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: 'Academics',
    skills: ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer Basics', 'Environmental Studies'],
  },
  {
    name: 'Study Skills',
    skills: ['Time Management', 'Note Taking', 'Exam Practice', 'Reading', 'Memory', 'Research', 'Homework Planning'],
  },
  {
    name: 'Creativity',
    skills: ['Drawing', 'Writing', 'Music', 'Craft', 'Presentation', 'Storytelling'],
  },
  {
    name: 'Life Skills',
    skills: ['Communication', 'Teamwork', 'Leadership', 'Problem Solving', 'Confidence', 'Curiosity'],
  },
  {
    name: 'Technology',
    skills: ['Typing', 'Coding Basics', 'Scratch', 'Excel', 'Slides', 'Digital Tools', 'Internet Research'],
  },
  {
    name: 'Activities',
    skills: ['Sports', 'Debate', 'Quiz', 'Science Projects', 'Public Speaking', 'Volunteering'],
  },
];

export const ALL_SKILLS = SKILL_CATEGORIES.flatMap((cat) => cat.skills);

export const INDUSTRIES = [
  { value: 'CBSE', label: 'CBSE', icon: '📘' },
  { value: 'ICSE', label: 'ICSE', icon: '📗' },
  { value: 'State Board', label: 'State Board', icon: '📙' },
  { value: 'IB', label: 'IB', icon: '🌍' },
  { value: 'IGCSE', label: 'IGCSE', icon: '📕' },
  { value: 'Other', label: 'Other', icon: '🎓' },
];

export const COMPANY_TYPES = [
  { value: 'Guided', label: 'Teacher-guided', desc: 'I like clear steps and support' },
  { value: 'Balanced', label: 'Balanced', desc: 'A mix of guidance and independence' },
  { value: 'Independent', label: 'Independent', desc: 'I like learning on my own' },
  { value: 'Project-based', label: 'Project-based', desc: 'I learn best by doing activities' },
];
