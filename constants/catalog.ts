/**
 * Curated reference data for the dashboard modules (India/Abroad colleges,
 * exams, career library, abroad applications, career boosters). Indicative
 * information for guidance — fees/ranks are approximate.
 */

export interface IndiaCollege {
  name: string; location: string; type: 'Government' | 'Private' | 'Deemed';
  category: string; nirf: string; fees: string; courses: string;
}
export const INDIA_COLLEGES: IndiaCollege[] = [
  { name: 'IIT Bombay', location: 'Mumbai, MH', type: 'Government', category: 'Engineering', nirf: '#3', fees: '₹2.2L/yr', courses: 'B.Tech, M.Tech, Dual Degree' },
  { name: 'IIT Delhi', location: 'New Delhi', type: 'Government', category: 'Engineering', nirf: '#2', fees: '₹2.2L/yr', courses: 'B.Tech, M.Tech, PhD' },
  { name: 'IIT Madras', location: 'Chennai, TN', type: 'Government', category: 'Engineering', nirf: '#1', fees: '₹2.2L/yr', courses: 'B.Tech, Data Science, M.Tech' },
  { name: 'AIIMS Delhi', location: 'New Delhi', type: 'Government', category: 'Medical', nirf: '#1 (Medical)', fees: '₹6K/yr', courses: 'MBBS, MD, MS, Nursing' },
  { name: 'IIM Ahmedabad', location: 'Ahmedabad, GJ', type: 'Government', category: 'Management', nirf: '#1 (Mgmt)', fees: '₹23L total', courses: 'MBA (PGP), PhD' },
  { name: 'IIM Bangalore', location: 'Bengaluru, KA', type: 'Government', category: 'Management', nirf: '#2 (Mgmt)', fees: '₹24L total', courses: 'MBA, EPGP, PhD' },
  { name: 'NIT Trichy', location: 'Tiruchirappalli, TN', type: 'Government', category: 'Engineering', nirf: '#9', fees: '₹1.6L/yr', courses: 'B.Tech, M.Tech, MCA' },
  { name: 'BITS Pilani', location: 'Pilani, RJ', type: 'Private', category: 'Engineering', nirf: '#20', fees: '₹5.4L/yr', courses: 'B.E., M.Sc, MBA' },
  { name: 'Delhi University', location: 'New Delhi', type: 'Government', category: 'Arts / Science', nirf: '#11 (Univ)', fees: '₹15-70K/yr', courses: 'BA, B.Com, B.Sc, BMS' },
  { name: 'Christ University', location: 'Bengaluru, KA', type: 'Deemed', category: 'Commerce / Arts', nirf: '—', fees: '₹1.5-3L/yr', courses: 'BBA, B.Com, BA, Law' },
  { name: 'NLSIU Bangalore', location: 'Bengaluru, KA', type: 'Government', category: 'Law', nirf: '#1 (Law)', fees: '₹3L/yr', courses: 'BA LLB, LLM' },
  { name: 'NID Ahmedabad', location: 'Ahmedabad, GJ', type: 'Government', category: 'Design', nirf: '—', fees: '₹3.6L/yr', courses: 'B.Des, M.Des' },
  { name: 'St. Xavier’s Mumbai', location: 'Mumbai, MH', type: 'Private', category: 'Arts / Science', nirf: '—', fees: '₹20-40K/yr', courses: 'BA, B.Sc, B.Com, BMM' },
  { name: 'Manipal (MAHE)', location: 'Manipal, KA', type: 'Deemed', category: 'Engineering / Medical', nirf: '#46', fees: '₹4-15L/yr', courses: 'B.Tech, MBBS, B.Des' },
];

export interface AbroadCollege {
  name: string; country: string; qs: string; tuition: string; courses: string;
}
export const ABROAD_COLLEGES: AbroadCollege[] = [
  { name: 'MIT', country: 'USA 🇺🇸', qs: '#1', tuition: '$60K/yr', courses: 'Engineering, CS, Business' },
  { name: 'Stanford University', country: 'USA 🇺🇸', qs: '#6', tuition: '$58K/yr', courses: 'CS, AI, Management' },
  { name: 'University of Oxford', country: 'UK 🇬🇧', qs: '#3', tuition: '£35K/yr', courses: 'PPE, Medicine, Law, CS' },
  { name: 'University of Cambridge', country: 'UK 🇬🇧', qs: '#5', tuition: '£37K/yr', courses: 'Engineering, Natural Sci' },
  { name: 'ETH Zurich', country: 'Switzerland 🇨🇭', qs: '#7', tuition: '€1.5K/yr', courses: 'Engineering, Sciences' },
  { name: 'National Univ. of Singapore', country: 'Singapore 🇸🇬', qs: '#8', tuition: 'S$38K/yr', courses: 'Engineering, Business, CS' },
  { name: 'University of Toronto', country: 'Canada 🇨🇦', qs: '#21', tuition: 'C$60K/yr', courses: 'CS, Engineering, Commerce' },
  { name: 'University of Melbourne', country: 'Australia 🇦🇺', qs: '#13', tuition: 'A$45K/yr', courses: 'Business, Medicine, IT' },
  { name: 'Imperial College London', country: 'UK 🇬🇧', qs: '#2', tuition: '£38K/yr', courses: 'Engineering, Medicine' },
  { name: 'TU Munich', country: 'Germany 🇩🇪', qs: '#22', tuition: '€0 (low fee)', courses: 'Engineering, CS, Sciences' },
  { name: 'University of British Columbia', country: 'Canada 🇨🇦', qs: '#34', tuition: 'C$50K/yr', courses: 'CS, Business, Arts' },
  { name: 'Univ. of Amsterdam', country: 'Netherlands 🇳🇱', qs: '#53', tuition: '€15K/yr', courses: 'Business, Data Science' },
];

export interface ExamInfo {
  name: string; full: string; level: string; field: string; body: string; mode: string; when: string;
}
export const EXAMS: ExamInfo[] = [
  { name: 'JEE Main', full: 'Joint Entrance Examination (Main)', level: 'UG', field: 'Engineering', body: 'NTA', mode: 'Online', when: 'Jan & Apr' },
  { name: 'JEE Advanced', full: 'JEE Advanced (for IITs)', level: 'UG', field: 'Engineering', body: 'IITs', mode: 'Online', when: 'May/Jun' },
  { name: 'NEET-UG', full: 'National Eligibility cum Entrance Test', level: 'UG', field: 'Medical', body: 'NTA', mode: 'Offline', when: 'May' },
  { name: 'CUET-UG', full: 'Common University Entrance Test', level: 'UG', field: 'Central Universities', body: 'NTA', mode: 'Online', when: 'May/Jun' },
  { name: 'CAT', full: 'Common Admission Test', level: 'PG', field: 'Management (MBA)', body: 'IIMs', mode: 'Online', when: 'Nov' },
  { name: 'CLAT', full: 'Common Law Admission Test', level: 'UG/PG', field: 'Law', body: 'Consortium of NLUs', mode: 'Offline', when: 'Dec' },
  { name: 'GATE', full: 'Graduate Aptitude Test in Engineering', level: 'PG', field: 'Engineering / PSU', body: 'IISc/IITs', mode: 'Online', when: 'Feb' },
  { name: 'NDA', full: 'National Defence Academy Exam', level: 'UG', field: 'Defence', body: 'UPSC', mode: 'Offline', when: 'Apr & Sep' },
  { name: 'UPSC CSE', full: 'Civil Services Examination', level: 'Graduate', field: 'Civil Services', body: 'UPSC', mode: 'Offline', when: 'Jun (Prelims)' },
  { name: 'NIFT', full: 'NIFT Entrance Exam', level: 'UG/PG', field: 'Fashion / Design', body: 'NIFT', mode: 'Online', when: 'Feb' },
  { name: 'GRE', full: 'Graduate Record Examination', level: 'PG (Abroad)', field: 'Masters Abroad', body: 'ETS', mode: 'Online', when: 'Year-round' },
  { name: 'IELTS', full: 'International English Language Testing', level: 'UG/PG (Abroad)', field: 'English Proficiency', body: 'British Council/IDP', mode: 'Both', when: 'Year-round' },
];

export interface CareerInfo {
  title: string; cluster: string; description: string; skills: string[]; education: string; salary: string;
}
export const CAREER_LIBRARY: CareerInfo[] = [
  { title: 'Software Developer', cluster: 'Information Technology', description: 'Designs, builds and maintains software applications and systems.', skills: ['Coding', 'Problem solving', 'Logic'], education: 'B.Tech CSE / BCA / self-taught', salary: '₹6–35 LPA' },
  { title: 'Data Scientist', cluster: 'Information Technology', description: 'Turns data into insights and builds ML/AI models.', skills: ['Statistics', 'Python', 'ML'], education: 'B.Tech / B.Sc + Data Science', salary: '₹8–40 LPA' },
  { title: 'Doctor (MBBS)', cluster: 'Health Science', description: 'Diagnoses and treats patients across specialities.', skills: ['Biology', 'Empathy', 'Diligence'], education: 'MBBS → MD/MS', salary: '₹8–50 LPA' },
  { title: 'Mechanical Engineer', cluster: 'Engineering', description: 'Designs machines, engines and manufacturing systems.', skills: ['Physics', 'CAD', 'Spatial reasoning'], education: 'B.Tech Mechanical', salary: '₹4–18 LPA' },
  { title: 'Chartered Accountant', cluster: 'Accounts & Finance', description: 'Handles audit, taxation and financial advisory.', skills: ['Numerical', 'Detail', 'Ethics'], education: 'CA (ICAI) / B.Com', salary: '₹7–30 LPA' },
  { title: 'Investment Banker', cluster: 'Accounts & Finance', description: 'Advises on capital raising, M&A and investments.', skills: ['Finance', 'Analysis', 'Negotiation'], education: 'MBA Finance / CFA', salary: '₹12–60 LPA' },
  { title: 'Psychologist / Counsellor', cluster: 'Human Service', description: 'Supports mental health and behavioural wellbeing.', skills: ['Empathy', 'Listening', 'Research'], education: 'BA/MA Psychology', salary: '₹4–20 LPA' },
  { title: 'Teacher / Professor', cluster: 'Education', description: 'Educates and mentors students at school/college.', skills: ['Communication', 'Patience', 'Subject mastery'], education: 'B.Ed / MA + NET', salary: '₹3–15 LPA' },
  { title: 'UX / Graphic Designer', cluster: 'Arts & Media', description: 'Designs intuitive interfaces and visual experiences.', skills: ['Creativity', 'Design tools', 'Empathy'], education: 'B.Des / UX courses', salary: '₹5–25 LPA' },
  { title: 'Content Creator / Journalist', cluster: 'Media & Communication', description: 'Tells stories across writing, video and media.', skills: ['Writing', 'Research', 'Creativity'], education: 'BA Journalism / Mass Comm', salary: '₹3–20 LPA' },
  { title: 'Entrepreneur', cluster: 'Business', description: 'Builds and scales a business from an idea.', skills: ['Leadership', 'Risk-taking', 'Sales'], education: 'Any + BBA/MBA helpful', salary: 'Variable' },
  { title: 'Marketing Manager', cluster: 'Marketing', description: 'Drives brand, growth and demand strategy.', skills: ['Communication', 'Analytics', 'Creativity'], education: 'BBA/MBA Marketing', salary: '₹6–28 LPA' },
  { title: 'Civil Servant (IAS/IPS)', cluster: 'Government', description: 'Administers public policy and governance.', skills: ['Knowledge', 'Leadership', 'Integrity'], education: 'Graduate + UPSC CSE', salary: '₹10–18 LPA + perks' },
  { title: 'Lawyer', cluster: 'Legal', description: 'Advises and represents clients in legal matters.', skills: ['Argument', 'Reading', 'Detail'], education: 'BA LLB / LLB', salary: '₹5–30 LPA' },
  { title: 'Architect', cluster: 'Design & Engineering', description: 'Designs buildings and spaces — form and function.', skills: ['Spatial', 'Creativity', 'Maths'], education: 'B.Arch (5 yrs)', salary: '₹4–20 LPA' },
  { title: 'Pilot', cluster: 'Aviation', description: 'Operates aircraft for airlines or defence.', skills: ['Focus', 'Reflexes', 'Physics'], education: 'CPL / NDA (Air Force)', salary: '₹15–80 LPA' },
];

// ---- Abroad applications ----
export const ABROAD_STEPS = [
  { step: 1, title: 'Profile evaluation', detail: 'Map your academics, budget and goals to the right countries and courses.' },
  { step: 2, title: 'Shortlist universities', detail: 'Pick ambitious, target and safe universities for your intake.' },
  { step: 3, title: 'Standardised tests', detail: 'Prepare IELTS/TOEFL and GRE/GMAT/SAT as required.' },
  { step: 4, title: 'SOP, LOR & documents', detail: 'Craft your statement of purpose, recommendations and transcripts.' },
  { step: 5, title: 'Apply & track', detail: 'Submit applications and track decisions on your dashboard.' },
  { step: 6, title: 'Visa & pre-departure', detail: 'Financial proof, visa interview and travel/accommodation prep.' },
];
export const ABROAD_TESTS = [
  { name: 'IELTS / TOEFL', purpose: 'English proficiency', validity: '2 years' },
  { name: 'GRE', purpose: 'Masters (STEM/most fields)', validity: '5 years' },
  { name: 'GMAT', purpose: 'MBA / business masters', validity: '5 years' },
  { name: 'SAT / ACT', purpose: 'Undergraduate (US)', validity: '5 years' },
];
export const ABROAD_COUNTRIES = [
  { country: 'USA 🇺🇸', intakes: 'Fall, Spring', cost: '$25–60K/yr', highlight: 'Top research, STEM OPT' },
  { country: 'UK 🇬🇧', intakes: 'Sep, Jan', cost: '£15–38K/yr', highlight: '1-yr masters, Graduate Route' },
  { country: 'Canada 🇨🇦', intakes: 'Fall, Winter', cost: 'C$20–50K/yr', highlight: 'PR-friendly, PGWP' },
  { country: 'Australia 🇦🇺', intakes: 'Feb, Jul', cost: 'A$25–45K/yr', highlight: 'Post-study work visa' },
  { country: 'Germany 🇩🇪', intakes: 'Oct, Apr', cost: '€0–20K/yr', highlight: 'Low/no tuition, strong eng.' },
  { country: 'Ireland 🇮🇪', intakes: 'Sep, Jan', cost: '€10–25K/yr', highlight: 'Tech hub, 2-yr stay-back' },
];

// ---- Career boosters ----
export const BOOSTER_COURSES = [
  { title: 'Full-Stack Web Development', provider: 'OneGrasp Academy', level: 'Beginner→Pro', duration: '16 weeks' },
  { title: 'Data Science & Python', provider: 'OneGrasp Academy', level: 'Intermediate', duration: '12 weeks' },
  { title: 'Digital Marketing Mastery', provider: 'OneGrasp Academy', level: 'Beginner', duration: '8 weeks' },
  { title: 'UI/UX Design Fundamentals', provider: 'OneGrasp Academy', level: 'Beginner', duration: '10 weeks' },
  { title: 'Spoken English & Communication', provider: 'OneGrasp Academy', level: 'All levels', duration: '6 weeks' },
  { title: 'Financial Literacy & Investing', provider: 'OneGrasp Academy', level: 'Beginner', duration: '6 weeks' },
];
export const SCHOLARSHIPS = [
  { name: 'National Merit Scholarship', for: 'Class 10–12 toppers', amount: 'Up to ₹50K/yr' },
  { name: 'OneGrasp Need-Based Grant', for: 'Low-income students', amount: 'Up to 100% fees' },
  { name: 'Women in STEM Scholarship', for: 'Girls in engineering/science', amount: 'Up to ₹1L' },
  { name: 'Study-Abroad Excellence Award', for: 'Top abroad applicants', amount: 'Up to $5,000' },
];
export const INTERNSHIPS = [
  { brand: 'Deloitte (Forage)', domain: 'Consulting & Audit', duration: 'Self-paced' },
  { brand: 'JPMorgan (Forage)', domain: 'Software & Finance', duration: 'Self-paced' },
  { brand: 'Accenture (Forage)', domain: 'Tech & Strategy', duration: 'Self-paced' },
  { brand: 'BCG (Forage)', domain: 'Strategy Consulting', duration: 'Self-paced' },
  { brand: 'Tata Group', domain: 'Operations & Management', duration: '4–8 weeks' },
  { brand: 'Google (Skillshop)', domain: 'Marketing & Analytics', duration: 'Self-paced' },
];
