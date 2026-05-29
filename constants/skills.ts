export interface SkillCategory {
  name: string;
  skills: string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: 'Engineering',
    skills: ['React', 'Python', 'SQL', 'TypeScript', 'Node.js', 'AWS', 'Java', 'Go', 'Docker', 'Kubernetes'],
  },
  {
    name: 'Business',
    skills: ['Product Strategy', 'Data Analysis', 'Excel', 'Salesforce', 'Business Development', 'Operations', 'Finance'],
  },
  {
    name: 'Design',
    skills: ['Figma', 'UX Research', 'Prototyping', 'User Testing', 'Sketch', 'Adobe XD'],
  },
  {
    name: 'Soft Skills',
    skills: ['Leadership', 'Communication', 'Project Management', 'Negotiation', 'Mentoring', 'Public Speaking'],
  },
  {
    name: 'Data & AI',
    skills: ['Machine Learning', 'Tableau', 'Power BI', 'Statistics', 'Deep Learning', 'NLP', 'Data Science'],
  },
  {
    name: 'Marketing',
    skills: ['SEO', 'Content Strategy', 'Paid Ads', 'Analytics', 'Brand Strategy', 'Email Marketing'],
  },
];

export const ALL_SKILLS = SKILL_CATEGORIES.flatMap((cat) => cat.skills);

export const INDUSTRIES = [
  { value: 'Tech', label: 'Technology', icon: '💻' },
  { value: 'Finance', label: 'Finance', icon: '📈' },
  { value: 'Healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'Marketing', label: 'Marketing', icon: '📣' },
  { value: 'Design', label: 'Design', icon: '🎨' },
  { value: 'Other', label: 'Other', icon: '🌐' },
];

export const COMPANY_TYPES = [
  { value: 'Startup', label: 'Startup', desc: '< 50 people, fast-moving' },
  { value: 'Scale-up', label: 'Scale-up', desc: '50–500 people, growing' },
  { value: 'Enterprise', label: 'Enterprise', desc: '500+ people, structured' },
  { value: 'FAANG', label: 'FAANG/Big Tech', desc: 'Top-tier tech giants' },
];
