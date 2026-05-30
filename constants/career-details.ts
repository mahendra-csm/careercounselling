/**
 * Path-specific report content. The student's chosen / top career path drives
 * these four sections so each report differs: Work Nature, Education Roadmap,
 * Salary Chart and "Skills That Affect" the chosen career.
 */

export interface CareerDetail {
  workNature: string[];
  roadmap: { graduation: string[]; postGraduation: string[]; certifications: string[]; occupations: string[] };
  salaryBase: number; // fresher ₹ lakhs per year
  skillsThatAffect: { name: string; percent: number }[];
}

export const SALARY_LEVELS = ['Freshers (0 yrs)', 'Early (1–3 yrs)', 'Mid (4–7 yrs)', 'Senior (8–12 yrs)', 'Experienced (13+ yrs)'];
const MULT = [1, 1.7, 3.2, 5.2, 8];

export function buildSalary(base: number) {
  return SALARY_LEVELS.map((level, i) => ({ level, amount: Math.round(base * MULT[i] * 100000) }));
}

const FALLBACK: CareerDetail = {
  workNature: [
    'Apply your strengths to real problems in this field day to day.',
    'Collaborate with a team and communicate your work clearly.',
    'Keep learning new tools and methods as the field evolves.',
    'Take ownership of tasks and deliver them to a deadline.',
  ],
  roadmap: {
    graduation: ['Relevant Bachelor’s degree', 'Foundation courses in the field'],
    postGraduation: ['Specialised Master’s degree', 'Domain certifications'],
    certifications: ['Industry certification', 'Online specialisation'],
    occupations: ['Associate', 'Specialist', 'Manager', 'Consultant', 'Lead'],
  },
  salaryBase: 5,
  skillsThatAffect: [
    { name: 'Core Domain Knowledge', percent: 80 }, { name: 'Problem Solving', percent: 75 },
    { name: 'Communication', percent: 72 }, { name: 'Teamwork', percent: 70 },
    { name: 'Tools & Technology', percent: 68 }, { name: 'Continuous Learning', percent: 78 },
  ],
};

export const CAREER_DETAILS: Record<string, CareerDetail> = {
  'Software Developer': {
    workNature: [
      'Design, write and test software for web, mobile or systems.',
      'Translate requirements into clean, working, maintainable code.',
      'Debug issues and continuously improve performance and quality.',
      'Collaborate with designers, product and other engineers.',
      'Keep up with new languages, frameworks and best practices.',
    ],
    roadmap: {
      graduation: ['B.Tech / B.E. CSE or IT', 'BCA', 'B.Sc Computer Science'],
      postGraduation: ['M.Tech / MS Computer Science', 'MCA'],
      certifications: ['Full-Stack Web Dev', 'AWS / Azure Cloud', 'DSA & System Design'],
      occupations: ['Frontend / Backend Developer', 'Full-Stack Engineer', 'Mobile Developer', 'DevOps Engineer', 'Engineering Manager', 'CTO'],
    },
    salaryBase: 6,
    skillsThatAffect: [
      { name: 'Data Structures & Algorithms', percent: 88 }, { name: 'Programming Languages', percent: 85 },
      { name: 'System Design', percent: 78 }, { name: 'Databases & SQL', percent: 80 },
      { name: 'Version Control (Git)', percent: 82 }, { name: 'Cloud & DevOps', percent: 70 },
      { name: 'Debugging & Testing', percent: 76 },
    ],
  },
  'Data & AI Scientist': {
    workNature: [
      'Collect, clean and analyse large datasets to find patterns.',
      'Build, train and evaluate machine-learning / AI models.',
      'Translate data insights into decisions for the business.',
      'Visualise results and communicate them to non-technical teams.',
    ],
    roadmap: {
      graduation: ['B.Tech CSE / IT', 'B.Sc Statistics / Maths', 'B.Sc Data Science'],
      postGraduation: ['M.Sc Data Science', 'MS Machine Learning / AI'],
      certifications: ['Python for Data Science', 'Deep Learning Specialisation', 'Cloud ML'],
      occupations: ['Data Analyst', 'Data Scientist', 'ML Engineer', 'AI Researcher', 'Head of Data'],
    },
    salaryBase: 8,
    skillsThatAffect: [
      { name: 'Statistics & Probability', percent: 86 }, { name: 'Python / R', percent: 85 },
      { name: 'Machine Learning', percent: 84 }, { name: 'Data Wrangling', percent: 80 },
      { name: 'SQL & Big Data', percent: 78 }, { name: 'Data Visualisation', percent: 75 },
    ],
  },
  'Mechanical / Civil Engineer': {
    workNature: [
      'Design machines, structures or systems and validate them.',
      'Create technical drawings and 3D models (CAD).',
      'Oversee manufacturing or construction and quality.',
      'Solve practical engineering problems on site and in design.',
    ],
    roadmap: {
      graduation: ['B.Tech / B.E. Mechanical or Civil', 'Diploma in Engineering'],
      postGraduation: ['M.Tech (Design / Structures)', 'MBA (for management track)'],
      certifications: ['AutoCAD / SolidWorks', 'Project Management (PMP)', 'Six Sigma'],
      occupations: ['Design Engineer', 'Site / Project Engineer', 'Production Engineer', 'Consultant', 'Project Manager'],
    },
    salaryBase: 4,
    skillsThatAffect: [
      { name: 'Engineering Fundamentals', percent: 85 }, { name: 'CAD / Modelling', percent: 82 },
      { name: 'Material Science', percent: 75 }, { name: 'Project Management', percent: 72 },
      { name: 'Problem Solving', percent: 80 }, { name: 'Quality & Safety', percent: 70 },
    ],
  },
  'Doctor / Healthcare': {
    workNature: [
      'Diagnose and treat patients with care and precision.',
      'Stay current with medical research and protocols.',
      'Work long, responsible hours, often in teams.',
      'Communicate diagnoses and care plans with empathy.',
    ],
    roadmap: {
      graduation: ['MBBS', 'BDS / BAMS / BHMS', 'B.Sc Nursing'],
      postGraduation: ['MD / MS', 'DM / M.Ch (super-speciality)'],
      certifications: ['Speciality fellowships', 'Advanced Life Support', 'Research / publications'],
      occupations: ['General Physician', 'Surgeon', 'Specialist (Cardio, Neuro…)', 'Medical Officer', 'Hospital Administrator'],
    },
    salaryBase: 7,
    skillsThatAffect: [
      { name: 'Clinical Knowledge', percent: 90 }, { name: 'Diagnostic Reasoning', percent: 85 },
      { name: 'Patient Communication', percent: 80 }, { name: 'Attention to Detail', percent: 82 },
      { name: 'Calm Under Pressure', percent: 78 }, { name: 'Ethics & Empathy', percent: 84 },
    ],
  },
  'Psychologist / Counsellor': {
    workNature: [
      'Listen to clients and assess their emotional and mental wellbeing.',
      'Use counselling techniques to support and guide people.',
      'Maintain confidentiality and build trust.',
      'Track progress and adapt the support plan over time.',
    ],
    roadmap: {
      graduation: ['BA / B.Sc Psychology', 'BA in Applied Psychology'],
      postGraduation: ['MA / M.Sc Psychology', 'M.Phil Clinical Psychology'],
      certifications: ['Counselling Diploma', 'CBT / REBT Certification', 'RCI registration (clinical)'],
      occupations: ['Counsellor', 'Clinical Psychologist', 'School Counsellor', 'Therapist', 'HR Well-being Lead'],
    },
    salaryBase: 4,
    skillsThatAffect: [
      { name: 'Active Listening', percent: 88 }, { name: 'Empathy', percent: 86 },
      { name: 'Psychological Assessment', percent: 80 }, { name: 'Communication', percent: 82 },
      { name: 'Research Methods', percent: 70 }, { name: 'Ethics & Confidentiality', percent: 84 },
    ],
  },
  'Teacher / Educator': {
    workNature: [
      'Plan lessons and teach a subject clearly and engagingly.',
      'Assess student progress and give feedback.',
      'Mentor students and manage a classroom.',
      'Keep improving teaching methods and subject knowledge.',
    ],
    roadmap: {
      graduation: ['BA / B.Sc / B.Com (subject)', 'B.El.Ed / BA B.Ed (integrated)'],
      postGraduation: ['MA / M.Sc (subject)', 'M.Ed'],
      certifications: ['B.Ed', 'CTET / state TET', 'NET / SET (college level)'],
      occupations: ['School Teacher', 'Subject Coordinator', 'Lecturer / Professor', 'Curriculum Designer', 'Principal'],
    },
    salaryBase: 3.5,
    skillsThatAffect: [
      { name: 'Subject Mastery', percent: 86 }, { name: 'Communication', percent: 85 },
      { name: 'Classroom Management', percent: 78 }, { name: 'Patience', percent: 82 },
      { name: 'Lesson Planning', percent: 76 }, { name: 'Assessment & Feedback', percent: 74 },
    ],
  },
  'Designer (UX / Graphic)': {
    workNature: [
      'Research users and design intuitive, attractive experiences.',
      'Create wireframes, prototypes and visual designs.',
      'Collaborate with product and engineering to ship designs.',
      'Test designs with users and iterate.',
    ],
    roadmap: {
      graduation: ['B.Des', 'BFA', 'Any degree + design bootcamp'],
      postGraduation: ['M.Des', 'MA Design / HCI'],
      certifications: ['UX/UI Design', 'Figma / Adobe Suite', 'Design Systems'],
      occupations: ['UX Designer', 'UI / Visual Designer', 'Product Designer', 'Design Lead', 'Creative Director'],
    },
    salaryBase: 5,
    skillsThatAffect: [
      { name: 'Visual Design', percent: 85 }, { name: 'User Research', percent: 80 },
      { name: 'Prototyping (Figma)', percent: 84 }, { name: 'Interaction Design', percent: 78 },
      { name: 'Creativity', percent: 86 }, { name: 'Communication', percent: 74 },
    ],
  },
  'Content & Media Creator': {
    workNature: [
      'Research, write and produce engaging content across formats.',
      'Tell stories that connect with a target audience.',
      'Edit and refine for clarity, tone and impact.',
      'Track engagement and improve what you publish.',
    ],
    roadmap: {
      graduation: ['BA Journalism / Mass Comm', 'BA English / Literature', 'Any + media courses'],
      postGraduation: ['MA Journalism / Communication', 'MA Film / Media'],
      certifications: ['Content Writing', 'Video Editing', 'SEO & Social Media'],
      occupations: ['Content Writer', 'Journalist', 'Video Creator', 'Copywriter', 'Content Strategist', 'Editor'],
    },
    salaryBase: 3.5,
    skillsThatAffect: [
      { name: 'Writing & Storytelling', percent: 88 }, { name: 'Research', percent: 78 },
      { name: 'Creativity', percent: 84 }, { name: 'Editing', percent: 76 },
      { name: 'SEO / Distribution', percent: 70 }, { name: 'Audience Insight', percent: 72 },
    ],
  },
  'Entrepreneur / Business Leader': {
    workNature: [
      'Spot opportunities and turn ideas into a viable business.',
      'Build and lead a team towards a shared vision.',
      'Manage product, customers, finances and risk.',
      'Make fast decisions with incomplete information.',
    ],
    roadmap: {
      graduation: ['BBA / B.Com', 'Any degree (engineering, arts…)'],
      postGraduation: ['MBA', 'PG in Entrepreneurship'],
      certifications: ['Startup / Incubator programs', 'Finance for Founders', 'Product Management'],
      occupations: ['Founder', 'Co-founder', 'Product Manager', 'Business Head', 'CEO'],
    },
    salaryBase: 6,
    skillsThatAffect: [
      { name: 'Leadership', percent: 88 }, { name: 'Sales & Persuasion', percent: 82 },
      { name: 'Strategic Thinking', percent: 84 }, { name: 'Financial Literacy', percent: 76 },
      { name: 'Resilience', percent: 86 }, { name: 'Communication', percent: 80 },
    ],
  },
  'Marketing & Sales': {
    workNature: [
      'Understand customers and craft campaigns that reach them.',
      'Build brand, generate demand and close sales.',
      'Analyse performance data and optimise spend.',
      'Coordinate across creative, product and sales teams.',
    ],
    roadmap: {
      graduation: ['BBA Marketing', 'BMS', 'Any + marketing courses'],
      postGraduation: ['MBA Marketing', 'PG Digital Marketing'],
      certifications: ['Google / Meta Ads', 'SEO & Analytics', 'Brand Management'],
      occupations: ['Marketing Executive', 'Brand Manager', 'Digital Marketer', 'Sales Manager', 'CMO'],
    },
    salaryBase: 5,
    skillsThatAffect: [
      { name: 'Communication', percent: 86 }, { name: 'Marketing Analytics', percent: 80 },
      { name: 'Creativity', percent: 78 }, { name: 'Negotiation & Sales', percent: 82 },
      { name: 'Digital Channels', percent: 76 }, { name: 'Customer Insight', percent: 79 },
    ],
  },
  'Finance & Investment': {
    workNature: [
      'Analyse markets, companies and instruments to guide investment.',
      'Build financial models and assess risk and returns.',
      'Advise clients or firms on capital and portfolio decisions.',
      'Track regulations and produce financial reports.',
    ],
    roadmap: {
      graduation: ['B.Com / BBA Finance', 'B.Sc Finance / Economics', 'BFIA'],
      postGraduation: ['MBA Finance', 'M.Sc Finance', 'CFA program'],
      certifications: ['CFA', 'Financial Modelling', 'NISM / NCFM'],
      occupations: ['Financial Analyst', 'Investment Banker', 'Financial Planner', 'Risk Manager', 'Wealth Manager', 'Fund Manager'],
    },
    salaryBase: 6,
    skillsThatAffect: [
      { name: 'Investment Analysis', percent: 85 }, { name: 'Financial Modelling', percent: 82 },
      { name: 'Risk Management', percent: 80 }, { name: 'Numerical Ability', percent: 84 },
      { name: 'Market Knowledge', percent: 78 }, { name: 'Regulatory Compliance', percent: 68 },
      { name: 'Client Relationship', percent: 75 },
    ],
  },
  'Chartered Accountant': {
    workNature: [
      'Audit accounts and ensure financial accuracy and compliance.',
      'Handle taxation, advisory and financial reporting.',
      'Advise businesses on finances and controls.',
      'Stay updated with tax laws and accounting standards.',
    ],
    roadmap: {
      graduation: ['B.Com', 'CA Foundation → Intermediate'],
      postGraduation: ['CA Final (ICAI)', 'M.Com / MBA Finance'],
      certifications: ['CPA (US)', 'ACCA', 'Diploma in IFRS'],
      occupations: ['Auditor', 'Tax Consultant', 'Finance Manager', 'CFO', 'Partner (CA firm)'],
    },
    salaryBase: 7,
    skillsThatAffect: [
      { name: 'Accounting Standards', percent: 88 }, { name: 'Taxation', percent: 82 },
      { name: 'Audit & Assurance', percent: 84 }, { name: 'Numerical Ability', percent: 85 },
      { name: 'Attention to Detail', percent: 86 }, { name: 'Ethics', percent: 80 },
    ],
  },
  'Civil Services / Law': {
    workNature: [
      'Administer public policy or practice/advise on law.',
      'Analyse complex situations and make sound judgements.',
      'Read and interpret regulations and documents.',
      'Serve the public interest with integrity.',
    ],
    roadmap: {
      graduation: ['Any graduate degree (for UPSC)', 'BA LLB / LLB (for law)'],
      postGraduation: ['LLM', 'PG in Public Policy'],
      certifications: ['UPSC CSE preparation', 'Bar Council enrolment', 'Judicial services'],
      occupations: ['IAS / IPS Officer', 'Lawyer / Advocate', 'Legal Advisor', 'Judge', 'Policy Analyst'],
    },
    salaryBase: 6,
    skillsThatAffect: [
      { name: 'General Knowledge', percent: 84 }, { name: 'Analytical Reasoning', percent: 82 },
      { name: 'Verbal & Writing', percent: 85 }, { name: 'Decision Making', percent: 80 },
      { name: 'Integrity', percent: 86 }, { name: 'Leadership', percent: 78 },
    ],
  },
  'Human Resources': {
    workNature: [
      'Hire, develop and retain people for the organisation.',
      'Handle employee relations, policy and engagement.',
      'Run training, performance and well-being programs.',
      'Balance employee needs with business goals.',
    ],
    roadmap: {
      graduation: ['BBA HR', 'BA Psychology / Sociology'],
      postGraduation: ['MBA HR', 'MSW / PG in HRM'],
      certifications: ['SHRM / HRCI', 'L&D Certification', 'Payroll & Compliance'],
      occupations: ['HR Executive', 'Recruiter', 'HR Business Partner', 'L&D Manager', 'CHRO'],
    },
    salaryBase: 4.5,
    skillsThatAffect: [
      { name: 'People Skills', percent: 86 }, { name: 'Communication', percent: 84 },
      { name: 'Organising', percent: 80 }, { name: 'Conflict Resolution', percent: 78 },
      { name: 'Empathy', percent: 80 }, { name: 'HR Systems', percent: 70 },
    ],
  },
  'Architect / Interior Design': {
    workNature: [
      'Design buildings and spaces that are functional and beautiful.',
      'Produce drawings, 3D models and material plans.',
      'Coordinate with engineers, clients and contractors.',
      'Balance aesthetics, budget, safety and regulations.',
    ],
    roadmap: {
      graduation: ['B.Arch (5 yrs)', 'B.Des Interior Design'],
      postGraduation: ['M.Arch', 'MA Urban / Landscape Design'],
      certifications: ['Council of Architecture (CoA)', 'Revit / AutoCAD', 'Sustainable Design'],
      occupations: ['Architect', 'Interior Designer', 'Urban Planner', 'Landscape Architect', 'Design Principal'],
    },
    salaryBase: 4,
    skillsThatAffect: [
      { name: 'Spatial & Visualisation', percent: 86 }, { name: 'Design Software (CAD)', percent: 82 },
      { name: 'Creativity', percent: 84 }, { name: 'Maths & Structures', percent: 74 },
      { name: 'Project Coordination', percent: 76 }, { name: 'Attention to Detail', percent: 80 },
    ],
  },
  'Hospitality & Tourism': {
    workNature: [
      'Deliver great guest experiences across hotels, travel or events.',
      'Coordinate operations, teams and logistics.',
      'Handle customers warmly and solve issues quickly.',
      'Manage quality, budgets and schedules.',
    ],
    roadmap: {
      graduation: ['BHM (Hotel Management)', 'BA Travel & Tourism', 'BBA Hospitality'],
      postGraduation: ['MBA Hospitality / Tourism', 'PG in Event Management'],
      certifications: ['Culinary / F&B Certification', 'Front Office Operations', 'Event Management'],
      occupations: ['Hotel Manager', 'Event Manager', 'Chef', 'Travel Consultant', 'Operations Head'],
    },
    salaryBase: 3.5,
    skillsThatAffect: [
      { name: 'Customer Service', percent: 86 }, { name: 'Communication', percent: 82 },
      { name: 'Organising', percent: 80 }, { name: 'Teamwork', percent: 78 },
      { name: 'Problem Solving', percent: 74 }, { name: 'Cultural Awareness', percent: 72 },
    ],
  },
};

export function getCareerDetail(title: string): CareerDetail {
  return CAREER_DETAILS[title] ?? FALLBACK;
}
