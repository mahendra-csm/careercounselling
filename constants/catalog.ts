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
  steps: string[];
  resources: { label: string; url: string }[];
}
export const CAREER_LIBRARY: CareerInfo[] = [
  { title: 'Software Developer', cluster: 'Information Technology', description: 'Designs, builds and maintains software applications and systems.', skills: ['Coding', 'Problem solving', 'Logic'], education: 'B.Tech CSE / BCA / self-taught', salary: '₹6–35 LPA',
    steps: ['Learn one language well (Python or JavaScript)', 'Build small projects — a website, a game, an app', 'Practise problem-solving and put your work on GitHub'],
    resources: [{ label: 'freeCodeCamp (free)', url: 'https://www.freecodecamp.org/' }, { label: 'Harvard CS50x (free)', url: 'https://cs50.harvard.edu/x/' }] },
  { title: 'Data Scientist', cluster: 'Information Technology', description: 'Turns data into insights and builds ML/AI models.', skills: ['Statistics', 'Python', 'ML'], education: 'B.Tech / B.Sc + Data Science', salary: '₹8–40 LPA',
    steps: ['Get strong at maths & statistics', 'Learn Python and data libraries (pandas, scikit-learn)', 'Practise on real datasets and competitions'],
    resources: [{ label: 'Kaggle Learn (free)', url: 'https://www.kaggle.com/learn' }, { label: 'Khan Academy — Statistics', url: 'https://www.khanacademy.org/math/statistics-probability' }] },
  { title: 'Doctor (MBBS)', cluster: 'Health Science', description: 'Diagnoses and treats patients across specialities.', skills: ['Biology', 'Empathy', 'Diligence'], education: 'MBBS → MD/MS', salary: '₹8–50 LPA',
    steps: ['Take Science (PCB) in Class 11–12', 'Prepare for and clear NEET-UG', 'Complete MBBS, then specialise (MD/MS)'],
    resources: [{ label: 'NEET — Official (NTA)', url: 'https://neet.nta.nic.in/' }, { label: 'Khan Academy — Biology', url: 'https://www.khanacademy.org/science/biology' }] },
  { title: 'Mechanical Engineer', cluster: 'Engineering', description: 'Designs machines, engines and manufacturing systems.', skills: ['Physics', 'CAD', 'Spatial reasoning'], education: 'B.Tech Mechanical', salary: '₹4–18 LPA',
    steps: ['Master Physics & Maths (PCM)', 'Clear JEE / state engineering exams', 'Learn CAD tools and build hands-on projects'],
    resources: [{ label: 'NPTEL — Mechanical (free)', url: 'https://nptel.ac.in/' }, { label: 'Khan Academy — Physics', url: 'https://www.khanacademy.org/science/physics' }] },
  { title: 'Chartered Accountant', cluster: 'Accounts & Finance', description: 'Handles audit, taxation and financial advisory.', skills: ['Numerical', 'Detail', 'Ethics'], education: 'CA (ICAI) / B.Com', salary: '₹7–30 LPA',
    steps: ['Register for CA Foundation after Class 12 (Commerce)', 'Clear Foundation → Intermediate → Final', 'Complete articleship (practical training)'],
    resources: [{ label: 'ICAI — Official', url: 'https://www.icai.org/' }, { label: 'Khan Academy — Finance', url: 'https://www.khanacademy.org/college-careers-more/personal-finance' }] },
  { title: 'Investment Banker', cluster: 'Accounts & Finance', description: 'Advises on capital raising, M&A and investments.', skills: ['Finance', 'Analysis', 'Negotiation'], education: 'MBA Finance / CFA', salary: '₹12–60 LPA',
    steps: ['Build a base in commerce/finance', 'Do finance job simulations to learn the work', 'Target a top MBA or CFA and finance internships'],
    resources: [{ label: 'Forage — Finance simulations (free)', url: 'https://www.theforage.com/simulations' }, { label: 'Khan Academy — Capital Markets', url: 'https://www.khanacademy.org/economics-finance-domain/core-finance' }] },
  { title: 'Psychologist / Counsellor', cluster: 'Human Service', description: 'Supports mental health and behavioural wellbeing.', skills: ['Empathy', 'Listening', 'Research'], education: 'BA/MA Psychology', salary: '₹4–20 LPA',
    steps: ['Take Psychology / Humanities', 'Do BA → MA in Psychology', 'Specialise (clinical, counselling) with internships'],
    resources: [{ label: 'Yale — Science of Well-Being (free)', url: 'https://www.coursera.org/learn/the-science-of-well-being' }, { label: 'Khan Academy', url: 'https://www.khanacademy.org/' }] },
  { title: 'Teacher / Professor', cluster: 'Education', description: 'Educates and mentors students at school/college.', skills: ['Communication', 'Patience', 'Subject mastery'], education: 'B.Ed / MA + NET', salary: '₹3–15 LPA',
    steps: ['Master your subject', 'Do a degree + B.Ed (school) or MA/PhD + NET (college)', 'Start tutoring/mentoring to build experience'],
    resources: [{ label: 'SWAYAM — courses (free)', url: 'https://swayam.gov.in/' }, { label: 'Khan Academy', url: 'https://www.khanacademy.org/' }] },
  { title: 'UX / Graphic Designer', cluster: 'Arts & Media', description: 'Designs intuitive interfaces and visual experiences.', skills: ['Creativity', 'Design tools', 'Empathy'], education: 'B.Des / UX courses', salary: '₹5–25 LPA',
    steps: ['Learn design basics & tools (Figma, Canva)', 'Redesign apps/posters to build a portfolio', 'Take a UX course and share your work'],
    resources: [{ label: 'Google UX Design (audit free)', url: 'https://www.coursera.org/professional-certificates/google-ux-design' }, { label: 'Canva Design School', url: 'https://www.canva.com/designschool/' }] },
  { title: 'Content Creator / Journalist', cluster: 'Media & Communication', description: 'Tells stories across writing, video and media.', skills: ['Writing', 'Research', 'Creativity'], education: 'BA Journalism / Mass Comm', salary: '₹3–20 LPA',
    steps: ['Write/film regularly and publish', 'Learn editing and storytelling', 'Build an audience and a portfolio'],
    resources: [{ label: 'Google Digital Garage (free)', url: 'https://grow.google/intl/en_in/' }, { label: 'YouTube Creators', url: 'https://www.youtube.com/creators/' }] },
  { title: 'Entrepreneur', cluster: 'Business', description: 'Builds and scales a business from an idea.', skills: ['Leadership', 'Risk-taking', 'Sales'], education: 'Any + BBA/MBA helpful', salary: 'Variable',
    steps: ['Solve a small real problem for people', 'Learn the basics of business & money', 'Launch a tiny venture and iterate'],
    resources: [{ label: 'YC Startup School (free)', url: 'https://www.startupschool.org/' }, { label: 'Technovation (teen founders)', url: 'https://www.technovation.org/' }] },
  { title: 'Marketing Manager', cluster: 'Marketing', description: 'Drives brand, growth and demand strategy.', skills: ['Communication', 'Analytics', 'Creativity'], education: 'BBA/MBA Marketing', salary: '₹6–28 LPA',
    steps: ['Learn digital marketing fundamentals', 'Run a small campaign (a page, an event)', 'Get certified and analyse results'],
    resources: [{ label: 'Google Digital Garage (free)', url: 'https://grow.google/intl/en_in/' }, { label: 'HubSpot Academy (free)', url: 'https://academy.hubspot.com/' }] },
  { title: 'Civil Servant (IAS/IPS)', cluster: 'Government', description: 'Administers public policy and governance.', skills: ['Knowledge', 'Leadership', 'Integrity'], education: 'Graduate + UPSC CSE', salary: '₹10–18 LPA + perks',
    steps: ['Build broad general knowledge & current affairs', 'Finish any graduation degree', 'Prepare for and clear UPSC CSE'],
    resources: [{ label: 'UPSC — Official', url: 'https://upsc.gov.in/' }, { label: 'NCERT books (free)', url: 'https://ncert.nic.in/textbook.php' }] },
  { title: 'Lawyer', cluster: 'Legal', description: 'Advises and represents clients in legal matters.', skills: ['Argument', 'Reading', 'Detail'], education: 'BA LLB / LLB', salary: '₹5–30 LPA',
    steps: ['Read widely; sharpen reasoning & English', 'Clear CLAT for a 5-year integrated law degree', 'Intern with lawyers/firms during college'],
    resources: [{ label: 'CLAT — Consortium of NLUs', url: 'https://consortiumofnlus.ac.in/' }, { label: 'Khan Academy — LSAT reasoning', url: 'https://www.khanacademy.org/prep/lsat' }] },
  { title: 'Architect', cluster: 'Design & Engineering', description: 'Designs buildings and spaces — form and function.', skills: ['Spatial', 'Creativity', 'Maths'], education: 'B.Arch (5 yrs)', salary: '₹4–20 LPA',
    steps: ['Practise drawing & sketching; keep Maths strong', 'Clear NATA / JEE Paper 2 for B.Arch', 'Build a portfolio of design ideas'],
    resources: [{ label: 'NATA — Official', url: 'https://www.nata.in/' }, { label: 'Khan Academy — Geometry', url: 'https://www.khanacademy.org/math/geometry' }] },
  { title: 'Pilot', cluster: 'Aviation', description: 'Operates aircraft for airlines or defence.', skills: ['Focus', 'Reflexes', 'Physics'], education: 'CPL / NDA (Air Force)', salary: '₹15–80 LPA',
    steps: ['Take Science (PCM) and stay medically fit', 'Choose a path: CPL (airlines) or NDA (Air Force)', 'Clear exams/medicals and log flying hours'],
    resources: [{ label: 'DGCA — Official', url: 'https://www.dgca.gov.in/' }, { label: 'NDA — UPSC', url: 'https://upsc.gov.in/' }] },
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

// ---- Virtual internships & free programs (Class 6–12) ----
// Real, free programs. `minGrade`/`maxGrade` = the school grades they suit best.
// Always verify current eligibility on the official page before applying.
export type ProgramType = 'Job Simulation' | 'Course' | 'Research' | 'Competition' | 'Hands-on' | 'Internship';
export interface VirtualProgram {
  title: string; provider: string; domain: string; type: ProgramType;
  minGrade: number; maxGrade: number; effort: string; url: string;
}
export const VIRTUAL_INTERNSHIPS: VirtualProgram[] = [
  // Middle school (6–8) friendly
  { title: 'Scratch — Creative Coding', provider: 'MIT', domain: 'Coding & Animation', type: 'Hands-on', minGrade: 6, maxGrade: 9, effort: 'Self-paced', url: 'https://scratch.mit.edu/' },
  { title: 'Tynker — Coding for Kids', provider: 'Tynker', domain: 'Coding & Games', type: 'Course', minGrade: 6, maxGrade: 9, effort: 'Self-paced', url: 'https://www.tynker.com/' },
  { title: 'CS Discoveries', provider: 'Code.org', domain: 'Computer Science', type: 'Course', minGrade: 6, maxGrade: 10, effort: 'Self-paced', url: 'https://code.org/' },
  { title: 'Hour of Code', provider: 'Code.org', domain: 'Coding intro', type: 'Hands-on', minGrade: 6, maxGrade: 12, effort: '1 hour', url: 'https://hourofcode.com/' },
  { title: 'Khan Academy — All subjects', provider: 'Khan Academy', domain: 'Maths, Science, CS', type: 'Course', minGrade: 6, maxGrade: 12, effort: 'Self-paced', url: 'https://www.khanacademy.org/' },
  { title: 'Amazon Future Engineer', provider: 'Amazon', domain: 'Computer Science', type: 'Course', minGrade: 6, maxGrade: 12, effort: 'Self-paced', url: 'https://www.amazonfutureengineer.com/' },
  { title: 'NASA STEM @ Home', provider: 'NASA', domain: 'Space & STEM', type: 'Hands-on', minGrade: 6, maxGrade: 12, effort: 'Self-paced', url: 'https://www.nasa.gov/learning-resources/' },
  // Class 9–10
  { title: 'freeCodeCamp', provider: 'freeCodeCamp', domain: 'Web Development', type: 'Course', minGrade: 9, maxGrade: 12, effort: 'Self-paced + certificate', url: 'https://www.freecodecamp.org/' },
  { title: 'Google Digital Garage', provider: 'Google', domain: 'Digital Skills', type: 'Course', minGrade: 9, maxGrade: 12, effort: 'Self-paced + certificate', url: 'https://grow.google/intl/en_in/' },
  { title: 'IBM SkillsBuild', provider: 'IBM', domain: 'AI, Cloud, Cyber', type: 'Course', minGrade: 9, maxGrade: 12, effort: 'Self-paced + badges', url: 'https://skillsbuild.org/' },
  { title: 'Microsoft Learn (Student)', provider: 'Microsoft', domain: 'Cloud & AI', type: 'Course', minGrade: 9, maxGrade: 12, effort: 'Self-paced', url: 'https://learn.microsoft.com/training/' },
  { title: 'Elements of AI', provider: 'Univ. of Helsinki', domain: 'AI basics', type: 'Course', minGrade: 9, maxGrade: 12, effort: 'Self-paced + certificate', url: 'https://www.elementsofai.com/' },
  { title: 'Canva Design School', provider: 'Canva', domain: 'Graphic Design', type: 'Course', minGrade: 8, maxGrade: 12, effort: 'Self-paced', url: 'https://www.canva.com/designschool/' },
  { title: 'Technovation Girls', provider: 'Technovation', domain: 'App & AI (girls)', type: 'Competition', minGrade: 8, maxGrade: 12, effort: 'Seasonal program', url: 'https://www.technovation.org/' },
  { title: 'Skill India Digital', provider: 'Govt of India', domain: 'Job skills', type: 'Course', minGrade: 9, maxGrade: 12, effort: 'Self-paced + certificate', url: 'https://www.skillindiadigital.gov.in/courses' },
  // Class 11–12 (career exploration, job simulations, research)
  { title: 'JPMorgan — Software Engineering', provider: 'Forage', domain: 'Software & Finance', type: 'Job Simulation', minGrade: 11, maxGrade: 12, effort: '~5 hrs · certificate', url: 'https://www.theforage.com/simulations' },
  { title: 'Deloitte — Technology Consulting', provider: 'Forage', domain: 'Consulting & Tech', type: 'Job Simulation', minGrade: 11, maxGrade: 12, effort: '~5 hrs · certificate', url: 'https://www.theforage.com/simulations' },
  { title: 'BCG — Strategy Consulting', provider: 'Forage', domain: 'Strategy', type: 'Job Simulation', minGrade: 11, maxGrade: 12, effort: '~6 hrs · certificate', url: 'https://www.theforage.com/simulations' },
  { title: 'CS50x — Intro to Computer Science', provider: 'Harvard', domain: 'Computer Science', type: 'Course', minGrade: 11, maxGrade: 12, effort: 'Self-paced + certificate', url: 'https://cs50.harvard.edu/x/' },
  { title: 'NASA OSTEM Internships', provider: 'NASA', domain: 'STEM Research', type: 'Internship', minGrade: 11, maxGrade: 12, effort: 'Application-based', url: 'https://intern.nasa.gov/' },
  { title: 'Smithsonian Virtual Internships', provider: 'Smithsonian', domain: 'Museums & Research', type: 'Research', minGrade: 11, maxGrade: 12, effort: 'Application-based', url: 'https://www.smithsonianofi.com/' },
  { title: 'Stanford AIMI (AI in Medicine)', provider: 'Stanford', domain: 'AI & Healthcare', type: 'Research', minGrade: 11, maxGrade: 12, effort: 'Self-paced + program', url: 'https://aimi.stanford.edu/' },
  { title: 'SWAYAM — Academic courses', provider: 'Govt of India', domain: 'Academics & Tech', type: 'Course', minGrade: 11, maxGrade: 12, effort: 'Self-paced (exam optional)', url: 'https://swayam.gov.in/' },
  { title: 'NPTEL — Engineering & Science', provider: 'IITs / IISc', domain: 'STEM', type: 'Course', minGrade: 11, maxGrade: 12, effort: 'Self-paced + certificate', url: 'https://nptel.ac.in/' },
];

// ---- Career boosters: learn paths (free, step-by-step) ----
export interface LearnPath {
  title: string; tag: string; blurb: string;
  steps: string[];
  resources: { label: string; url: string }[];
}
export const LEARN_PATHS: LearnPath[] = [
  {
    title: 'Learn to Code', tag: 'Tech',
    blurb: 'From first block to your first real project — fully free.',
    steps: ['Start visual with Scratch or Code.org', 'Learn Python or JavaScript basics', 'Build 2–3 small projects', 'Take a structured course (freeCodeCamp / CS50x)'],
    resources: [{ label: 'Scratch (MIT)', url: 'https://scratch.mit.edu/' }, { label: 'freeCodeCamp', url: 'https://www.freecodecamp.org/' }, { label: 'Harvard CS50x', url: 'https://cs50.harvard.edu/x/' }],
  },
  {
    title: 'Get Job-Ready with Simulations', tag: 'Career',
    blurb: 'Do real tasks from real companies and earn certificates.',
    steps: ['Pick a field (tech, finance, consulting)', 'Complete a Forage job simulation', 'Add the certificate to your profile', 'Reflect on what you enjoyed'],
    resources: [{ label: 'Forage — free simulations', url: 'https://www.theforage.com/simulations' }],
  },
  {
    title: 'Master AI Basics', tag: 'AI',
    blurb: 'Understand AI — no maths PhD required.',
    steps: ['Take “Elements of AI”', 'Try Google’s AI lessons', 'Experiment with free AI tools', 'Build a tiny AI project'],
    resources: [{ label: 'Elements of AI', url: 'https://www.elementsofai.com/' }, { label: 'Google AI', url: 'https://ai.google/learn-ai-skills/' }, { label: 'IBM SkillsBuild', url: 'https://skillsbuild.org/' }],
  },
  {
    title: 'Communication & English', tag: 'Soft skills',
    blurb: 'Speak and write with confidence.',
    steps: ['Practise reading aloud daily', 'Learn grammar + vocabulary (Khan)', 'Join a speaking club / record yourself', 'Present to friends or family'],
    resources: [{ label: 'Khan Academy — Grammar', url: 'https://www.khanacademy.org/humanities/grammar' }, { label: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish' }],
  },
  {
    title: 'Money & Financial Literacy', tag: 'Life skill',
    blurb: 'Understand saving, budgeting and investing early.',
    steps: ['Learn how money & banks work', 'Understand saving vs investing', 'Practise budgeting', 'Explore stocks & compounding'],
    resources: [{ label: 'Khan Academy — Personal Finance', url: 'https://www.khanacademy.org/college-careers-more/personal-finance' }, { label: 'NCFE (RBI/SEBI)', url: 'https://www.ncfe.org.in/' }],
  },
  {
    title: 'Design & Creativity', tag: 'Design',
    blurb: 'Make posters, UIs and visual stories.',
    steps: ['Learn design basics in Canva', 'Recreate designs you like', 'Try UI design in Figma', 'Build a small portfolio'],
    resources: [{ label: 'Canva Design School', url: 'https://www.canva.com/designschool/' }, { label: 'Figma — Learn', url: 'https://www.figma.com/resource-library/' }],
  },
];
