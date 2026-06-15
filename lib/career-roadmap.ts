/**
 * Career roadmap content per recommended domain — degrees, key skills, starter
 * projects, career paths, and future scope. Keyed by the domain keys used by the
 * report's DOMAIN_LIBRARY. Original, India-relevant guidance (2026).
 */

export interface DomainRoadmap {
  degrees: string[];
  skills: string[];
  projects: string[];
  paths: string[];
  scope: string;
}

export const DOMAIN_ROADMAP: Record<string, DomainRoadmap> = {
  'engineering-technology': {
    degrees: ['B.Tech / B.E. (CSE, ECE, Mechanical, Civil)', 'B.Sc. (Computer Science / IT)', 'Diploma in Engineering', 'Integrated M.Tech'],
    skills: ['Problem-solving & logic', 'Coding (Python/C++)', 'CAD / electronics basics', 'Maths & physics fundamentals'],
    projects: ['Build a small robot or IoT device', 'Code a working app or game', 'Enter a hackathon or science fair'],
    paths: ['Software / hardware engineer', 'Data or AI engineer', 'Product / R&D / robotics roles'],
    scope: 'Very high demand and strong pay; growing fastest in AI, IoT, EVs and clean energy.',
  },
  'research-analytics': {
    degrees: ['B.Sc. (Statistics / Maths / Physics)', 'B.Tech (Data Science / CSE)', 'BS-MS (research institutes)', 'Economics (with maths)'],
    skills: ['Logical & numerical reasoning', 'Data analysis (Excel, Python, SQL)', 'Scientific method', 'Clear writing'],
    projects: ['Analyse a public dataset and present findings', 'Run a small experiment and report it', 'Try a Kaggle beginner competition'],
    paths: ['Data analyst / scientist', 'Research associate', 'Actuary / quant / economist'],
    scope: 'Data and research roles are in high demand across every industry and government.',
  },
  'psychology-human-behaviour': {
    degrees: ['B.A. / B.Sc. Psychology', 'B.A. Sociology / Social Work', 'Liberal Arts (Behavioural Science)', 'M.A. Clinical / Counselling (later)'],
    skills: ['Active listening & empathy', 'Observation & analysis', 'Communication', 'Research methods'],
    projects: ['Volunteer at a counselling / NGO helpline', 'Run a small survey on a behaviour topic', 'Keep a structured observation journal'],
    paths: ['Counsellor / clinical psychologist', 'HR & people analytics', 'UX research / social research'],
    scope: 'Growing demand for mental-health, HR and behavioural-research professionals.',
  },
  'arts-design-culture': {
    degrees: ['B.Des / B.F.A. (Design / Fine Arts)', 'B.A. Mass Media / Journalism', 'Animation & VFX', 'Architecture (B.Arch)'],
    skills: ['Visual & creative thinking', 'Design tools (Figma, Canva, Adobe)', 'Storytelling', 'Attention to aesthetics'],
    projects: ['Build a design / art portfolio', 'Make a short film, comic or poster series', 'Redesign a product or app screen'],
    paths: ['UI/UX or graphic designer', 'Content creator / film & media', 'Architect / animator'],
    scope: 'Strong demand for designers and creators as every brand goes digital.',
  },
  'business-entrepreneurship': {
    degrees: ['BBA / BBM', 'B.Com (Hons)', 'Integrated MBA', 'Economics'],
    skills: ['Leadership & decision-making', 'Communication & persuasion', 'Basic finance', 'Initiative & ownership'],
    projects: ['Start a small venture or stall', 'Lead a club, event or fundraiser', 'Build a simple business plan'],
    paths: ['Entrepreneur / founder', 'Management & consulting', 'Marketing, sales & operations'],
    scope: 'Huge scope in startups, management and the growing Indian consumer economy.',
  },
  'finance-strategy': {
    degrees: ['B.Com / BBA Finance', 'B.A. Economics (with maths)', 'CA / CFA / CS track', 'B.Sc. Statistics / Actuarial'],
    skills: ['Numerical & logical reasoning', 'Attention to detail', 'Spreadsheets & analysis', 'Commercial judgment'],
    projects: ['Track a mock stock portfolio', 'Build a personal / family budget model', 'Analyse a company’s public results'],
    paths: ['Analyst / investment banking', 'Chartered accountant / auditor', 'Financial planner / actuary'],
    scope: 'Steady, well-paid demand in banking, fintech, audit and corporate finance.',
  },
  'education-social-impact': {
    degrees: ['B.A. / B.Sc. + B.Ed.', 'B.A. (Humanities / Social Sciences)', 'Social Work (BSW)', 'Public Policy'],
    skills: ['Communication & patience', 'Empathy & teamwork', 'Organising & planning', 'Subject knowledge'],
    projects: ['Tutor or mentor younger students', 'Run an awareness or community drive', 'Create simple learning content'],
    paths: ['Teacher / educator / trainer', 'NGO & development sector', 'Public policy / civil services'],
    scope: 'Reliable demand in education, EdTech, development and public service.',
  },
  'health-life-sciences': {
    degrees: ['MBBS / BDS / BAMS', 'B.Sc. Nursing / Allied Health', 'B.Pharm / Biotechnology', 'B.Sc. Life Sciences'],
    skills: ['Biology & chemistry', 'Care & responsibility', 'Discipline & precision', 'Calm under pressure'],
    projects: ['Volunteer at a health camp or clinic', 'Do a biology / life-science project', 'Shadow a healthcare professional'],
    paths: ['Doctor / dentist / nurse', 'Pharma / biotech research', 'Public health & healthcare management'],
    scope: 'Always-essential field with growing demand in healthcare, pharma and biotech.',
  },
};

export function roadmapFor(key: string): DomainRoadmap | undefined {
  return DOMAIN_ROADMAP[key];
}
