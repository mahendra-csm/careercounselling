'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, Mail, Phone, Printer,
  Compass, Palette, Flame, BookOpen, Brain, Calculator,
  Target, Sparkles, TrendingUp, Lightbulb, Heart, GraduationCap,
  Search, Layers, Rocket, ClipboardCheck, CheckCircle2, ArrowRight,
  Wrench, FlaskConical, Users, Briefcase, ClipboardList, Box, Activity,
  Music, User, Leaf, Hash, MessageSquare, Crown, Scale, Wand2, Cpu,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { MBTI_DESC } from '@/lib/psychometric';
import type {
  AnalyticalBreakdown,
  DomainFitment,
  PsychometricProfile,
  SectionScore,
} from '@/lib/psychometric';

const TOTAL_PAGES = 15;

/* Mindler-style SaaS-clean palette. */
const C = {
  ink: '#16243B',
  body: '#3A4A61',
  muted: '#6F7E94',
  line: '#E4EAF3',
  faint: '#F5F8FC',
  page: '#E8EDF4',
  blue: '#2D7FF0',
  navy: '#16314C',
  yellow: '#F2C94C',
  green: '#27AE60',
  red: '#EB5757',
};

type SectionTheme = { color: string; soft: string; deep: string; icon: LucideIcon };

const SECTION_THEME: Record<string, SectionTheme> = {
  personality: { color: '#9B51E0', soft: '#F3ECFD', deep: '#5B2E94', icon: Compass },
  interests: { color: '#F2994A', soft: '#FDF0E6', deep: '#9C5A1E', icon: Palette },
  motivators: { color: '#EB5757', soft: '#FDEAEA', deep: '#9C2B2B', icon: Flame },
  learning: { color: '#2D9CDB', soft: '#E7F4FC', deep: '#1B6491', icon: BookOpen },
  intelligences: { color: '#27AE60', soft: '#E6F6EC', deep: '#176B3A', icon: Brain },
  analytical: { color: '#2F6BED', soft: '#E8EFFD', deep: '#1B3F94', icon: Calculator },
  eq: { color: '#11998E', soft: '#E3F5F2', deep: '#0A5E58', icon: Heart },
  clusters: { color: '#2D7FF0', soft: '#E8F1FE', deep: '#16314C', icon: Layers },
};

const SECTION_MEANING: Record<string, string> = {
  personality: 'How you naturally take in information, make decisions and organise your world.',
  interests: 'The kinds of activities and work environments you are genuinely drawn to.',
  motivators: 'The values and rewards that keep you engaged and energised at work.',
  learning: 'The channels through which you absorb and retain new information fastest.',
  intelligences: 'Your strongest natural aptitudes across the multiple-intelligence model.',
  analytical: 'Your measured reasoning accuracy across numerical, logical, verbal and spatial tasks.',
  eq: 'How well you recognise, regulate and use emotions — yours and other people’s.',
};

function themeFor(id: string): SectionTheme {
  return SECTION_THEME[id] ?? { color: C.blue, soft: C.faint, deep: C.navy, icon: Sparkles };
}

const LENSES = [
  { id: 'personality', label: 'Personality', caption: 'How you are wired' },
  { id: 'interests', label: 'Interests', caption: 'What excites you' },
  { id: 'motivators', label: 'Motivators', caption: 'What drives you' },
  { id: 'learning', label: 'Learning', caption: 'How you absorb' },
  { id: 'intelligences', label: 'Intelligences', caption: 'Your natural strengths' },
  { id: 'analytical', label: 'Analytical', caption: 'How you reason' },
];

const TRAIT_NAMES: Record<string, string> = {
  E: 'Extravert', I: 'Introvert', S: 'Sensing', N: 'Intuitive',
  T: 'Thinking', F: 'Feeling', J: 'Judging', P: 'Perceiving',
};

/** Picks a flat glyph for an item label (used by the icon-tile summary). */
function glyphFor(label: string): LucideIcon {
  const l = label.toLowerCase();
  const map: [string, LucideIcon][] = [
    ['realistic', Wrench], ['investigative', FlaskConical], ['artistic', Palette],
    ['social', Users], ['enterprising', Briefcase], ['conventional', ClipboardList],
    ['linguistic', BookOpen], ['logical', Calculator], ['spatial', Box],
    ['kinesthetic', Activity], ['musical', Music], ['interpersonal', Users],
    ['intrapersonal', User], ['naturalist', Leaf],
    ['numerical', Hash], ['verbal', MessageSquare], ['mechanical', Wrench],
    ['leadership', Crown], ['administrative', ClipboardList], ['organis', ClipboardList],
    ['co-operation', Users], ['visual', Box], ['creativ', Wand2], ['legal', Scale],
    ['emot', Heart], ['empathy', Heart], ['regulation', Heart], ['motivation', Flame],
    ['relationship', Users], ['awareness', User], ['independence', User],
    ['adventure', Rocket], ['structure', ClipboardList], ['learning', BookOpen],
    ['paced', Activity], ['service', Heart], ['tech', Cpu],
  ];
  for (const [key, icon] of map) if (l.includes(key)) return icon;
  return Sparkles;
}

type DomainFallbackModel = {
  key: string; label: string; focus: string;
  clusterHints: string[]; skillHints: string[]; interestHints: string[];
};

const DOMAIN_LIBRARY: DomainFallbackModel[] = [
  { key: 'engineering-technology', label: 'Engineering & Technology', focus: 'Systems thinking, applied problem solving, design logic, and technical execution.', clusterHints: ['Engineering & Technology', 'Information Technology', 'Design & Architecture'], skillHints: ['Logical Ability', 'Numerical Ability', 'Spatial & Visualisation Ability', 'Mechanical Abilities'], interestHints: ['Realistic', 'Investigative'] },
  { key: 'research-analytics', label: 'Research & Analytics', focus: 'Evidence-led investigation, modelling, experimentation, and pattern analysis.', clusterHints: ['Science & Research', 'Information Technology', 'Health Science'], skillHints: ['Logical Ability', 'Numerical Ability', 'Verbal Ability'], interestHints: ['Investigative', 'Conventional'] },
  { key: 'psychology-human-behaviour', label: 'Psychology & Human Behaviour', focus: 'Behaviour insight, reflection, listening, and people-centered analysis.', clusterHints: ['Human Service', 'Education & Training', 'Healthcare'], skillHints: ['Social & Co-operation Skills', 'Verbal Ability', 'Logical Ability'], interestHints: ['Social', 'Investigative'] },
  { key: 'arts-design-culture', label: 'Arts, Design & Culture', focus: 'Creative expression, visual thinking, narrative building, and cultural output.', clusterHints: ['Arts & Media', 'Media & Communication', 'Design & Architecture'], skillHints: ['Spatial & Visualisation Ability', 'Verbal Ability', 'Social & Co-operation Skills'], interestHints: ['Artistic', 'Social'] },
  { key: 'business-entrepreneurship', label: 'Business & Entrepreneurship', focus: 'Leadership, influence, execution, and growth in ambiguous environments.', clusterHints: ['Business Management', 'Marketing & Advertising', 'Entrepreneurship'], skillHints: ['Leadership & Decision Making', 'Administrative & Organising Skills', 'Verbal Ability'], interestHints: ['Enterprising', 'Conventional'] },
  { key: 'finance-strategy', label: 'Finance & Strategy', focus: 'Commercial judgment, numbers, systems, and structured decision-making.', clusterHints: ['Accounts & Finance', 'Government & Legal', 'Administration'], skillHints: ['Numerical Ability', 'Logical Ability', 'Administrative & Organising Skills'], interestHints: ['Conventional', 'Enterprising'] },
  { key: 'education-social-impact', label: 'Education & Social Impact', focus: 'Teaching, communication, mission-led support, and human development.', clusterHints: ['Education & Training', 'Human Service', 'Healthcare'], skillHints: ['Verbal Ability', 'Social & Co-operation Skills', 'Administrative & Organising Skills'], interestHints: ['Social', 'Artistic'] },
  { key: 'health-life-sciences', label: 'Health & Life Sciences', focus: 'Care, disciplined evidence use, diagnosis, and scientific service.', clusterHints: ['Health Science', 'Healthcare', 'Science & Research'], skillHints: ['Logical Ability', 'Social & Co-operation Skills', 'Administrative & Organising Skills'], interestHints: ['Investigative', 'Social'] },
];

const DOMAIN_STREAMS: Record<string, { stream: string; mandatory: string[]; optional: string[] }> = {
  'engineering-technology': { stream: 'Science (PCM)', mandatory: ['Mathematics', 'Physics', 'Chemistry'], optional: ['Computer Science', 'Engineering Drawing', 'Economics'] },
  'research-analytics': { stream: 'Science (PCM / PCB)', mandatory: ['Mathematics', 'Physics', 'Chemistry'], optional: ['Computer Science', 'Biology', 'Statistics'] },
  'psychology-human-behaviour': { stream: 'Humanities / Science', mandatory: ['Psychology', 'English'], optional: ['Sociology', 'Biology', 'Political Science'] },
  'arts-design-culture': { stream: 'Humanities / Fine Arts', mandatory: ['Fine Arts', 'English'], optional: ['Graphic Design', 'Sociology', 'Mass Media'] },
  'business-entrepreneurship': { stream: 'Commerce', mandatory: ['Accountancy', 'Business Studies', 'Economics'], optional: ['Mathematics', 'Entrepreneurship', 'Computer Science'] },
  'finance-strategy': { stream: 'Commerce (with Maths)', mandatory: ['Accountancy', 'Business Studies', 'Mathematics'], optional: ['Economics', 'Statistics', 'Computer Science'] },
  'education-social-impact': { stream: 'Humanities', mandatory: ['English', 'Sociology'], optional: ['Psychology', 'Political Science', 'History'] },
  'health-life-sciences': { stream: 'Science (PCB)', mandatory: ['Biology', 'Physics', 'Chemistry'], optional: ['Mathematics', 'Biotechnology', 'Psychology'] },
};

/* ----------------------------- helpers ----------------------------- */

function average(values: number[]) { return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0; }
function clampPercent(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }
function trimSkillLabel(label: string) { return label.replace(' & Decision Making', '').replace(' Ability', ''); }
function trimIntelligenceLabel(label: string) { return label.split(' (')[0]; }
function firstName(name: string) { const c = name.trim(); return c ? c.split(' ')[0] : 'Student'; }
function bandLabel(score: number) { return score >= 66 ? 'High' : score >= 45 ? 'Medium' : 'Low'; }
function toneLabel(score: number) { return score >= 82 ? 'High conviction' : score >= 68 ? 'Strong signal' : score >= 52 ? 'Developing signal' : 'Early signal'; }

function confidenceFromProfile(profile: PsychometricProfile) {
  if (profile.confidence) return profile.confidence;
  const answered = profile.sectionMeta?.reduce((s, i) => s + i.answered, 0) ?? 0;
  const total = profile.sectionMeta?.reduce((s, i) => s + i.total, 0) ?? 0;
  const percent = total ? clampPercent((answered / total) * 100) : 0;
  return { percent, answered, total, label: percent >= 90 ? 'High reliability' : percent >= 70 ? 'Good reliability' : percent >= 50 ? 'Moderate reliability' : 'Low reliability' };
}

function buildFallbackBreakdown(profile: PsychometricProfile): AnalyticalBreakdown[] {
  const total = profile.analyticalScore?.total ?? 0;
  const perBucket = total ? Math.max(1, Math.round(total / 4)) : 4;
  const skillMap = Object.fromEntries(profile.skills.map((s) => [s.label, s.percent])) as Record<string, number>;
  return [
    { key: 'numerical', label: 'Numerical reasoning', percent: skillMap['Numerical Ability'] ?? 0, total: perBucket, correct: Math.round(((skillMap['Numerical Ability'] ?? 0) / 100) * perBucket) },
    { key: 'logical', label: 'Logical reasoning', percent: skillMap['Logical Ability'] ?? 0, total: perBucket, correct: Math.round(((skillMap['Logical Ability'] ?? 0) / 100) * perBucket) },
    { key: 'verbal', label: 'Verbal reasoning', percent: skillMap['Verbal Ability'] ?? 0, total: perBucket, correct: Math.round(((skillMap['Verbal Ability'] ?? 0) / 100) * perBucket) },
    { key: 'spatial', label: 'Spatial reasoning', percent: skillMap['Spatial & Visualisation Ability'] ?? 0, total: perBucket, correct: Math.round(((skillMap['Spatial & Visualisation Ability'] ?? 0) / 100) * perBucket) },
  ].sort((a, b) => b.percent - a.percent);
}

function buildFallbackSections(profile: PsychometricProfile, ab: AnalyticalBreakdown[]): SectionScore[] {
  const intelligences = profile.intelligences ?? [];
  const personalityScore = clampPercent(average(profile.mbtiAxes.map((a) => Math.max(a.leftPct, a.rightPct))));
  const analyticalScore = profile.analyticalScore?.total ? clampPercent((profile.analyticalScore.correct / profile.analyticalScore.total) * 100) : clampPercent(average(ab.map((i) => i.percent)));
  return [
    { id: 'personality', title: 'Personality', score: personalityScore, basis: 'Consistency across the four working-style axes.', strengths: profile.mbtiAxes.slice().sort((a, b) => Math.abs(b.rightPct - b.leftPct) - Math.abs(a.rightPct - a.leftPct)).slice(0, 2).map((a) => `${a.dominant} preference is clearly expressed`), weaknesses: profile.mbtiAxes.slice().sort((a, b) => Math.abs(a.rightPct - a.leftPct) - Math.abs(b.rightPct - b.leftPct)).slice(0, 2).map((a) => `Balance between ${a.left.toLowerCase()} and ${a.right.toLowerCase()} may need clearer routines.`) },
    { id: 'interests', title: 'Interests', score: clampPercent(average(profile.interests.slice(0, 3).map((i) => i.percent))), basis: 'Strength of your dominant interest themes.', strengths: profile.interests.slice(0, 3).map((i) => `${i.label} interest`), weaknesses: profile.interests.slice(-2).map((i) => `Lower pull toward ${i.label.toLowerCase()} tasks.`) },
    { id: 'motivators', title: 'Motivators', score: clampPercent(average(profile.motivators.slice(0, 3).map((i) => i.percent))), basis: 'Clarity of the work environments that energise you.', strengths: profile.motivators.slice(0, 2).map((i) => `${i.label} is a strong work driver`), weaknesses: profile.motivators.slice(-2).map((i) => `${i.label} is a weaker day-to-day driver.`) },
    { id: 'learning', title: 'Learning', score: clampPercent((profile.learning[0]?.percent ?? 0) + (profile.learning[1]?.percent ?? 0)), basis: 'Concentration of your preferred study channels.', strengths: profile.learning.slice(0, 2).map((i) => `${i.label} supports faster absorption`), weaknesses: profile.learning.slice(-2).map((i) => `${i.label} is a lower-efficiency study input.`) },
    { id: 'intelligences', title: 'Intelligences', score: clampPercent(average(intelligences.slice(0, 3).map((i) => i.percent))), basis: 'Strength of the leading intelligence signals.', strengths: intelligences.slice(0, 3).map((i) => `${trimIntelligenceLabel(i.label)} intelligence`), weaknesses: intelligences.slice(-2).map((i) => `${trimIntelligenceLabel(i.label)} needs more deliberate use.`) },
    { id: 'analytical', title: 'Analytical reasoning', score: analyticalScore, basis: profile.analyticalScore?.total ? `${profile.analyticalScore.correct}/${profile.analyticalScore.total} correct across measured reasoning tasks.` : 'Estimated from the measured aptitude pattern in the profile.', strengths: ab.slice(0, 2).map((i) => `${i.label}: ${i.correct}/${i.total} correct`), weaknesses: ab.slice(-2).map((i) => `${i.label} needs more deliberate practice.`) },
  ];
}

function buildFallbackDomains(profile: PsychometricProfile): DomainFitment[] {
  const clusterMap = Object.fromEntries(profile.clusters.map((i) => [i.label, i.percent])) as Record<string, number>;
  const skillMap = Object.fromEntries(profile.skills.map((i) => [i.label, i.percent])) as Record<string, number>;
  const interestMap = Object.fromEntries(profile.interests.map((i) => [i.label, i.percent])) as Record<string, number>;
  return DOMAIN_LIBRARY.map((domain) => {
    const clusterScore = average(domain.clusterHints.map((k) => clusterMap[k] ?? 0));
    const skillScore = average(domain.skillHints.map((k) => skillMap[k] ?? 0));
    const interestScore = average(domain.interestHints.map((k) => interestMap[k] ?? 0));
    const score = clampPercent(clusterScore * 0.32 + skillScore * 0.4 + interestScore * 0.28);
    const leadingSkills = domain.skillHints.map((k) => ({ label: trimSkillLabel(k), percent: skillMap[k] ?? 0 })).sort((a, b) => b.percent - a.percent).slice(0, 2);
    const leadingInterests = domain.interestHints.map((k) => ({ label: k, percent: interestMap[k] ?? 0 })).sort((a, b) => b.percent - a.percent).slice(0, 2);
    const signals = [`${leadingInterests.map((i) => i.label).join(' + ')} interests`, `${leadingSkills.map((i) => i.label).join(' and ')} capability`, `${domain.clusterHints[0]} ecosystem alignment`];
    return { key: domain.key, label: domain.label, score, focus: domain.focus, rationale: `This domain is supported by ${signals[0].toLowerCase()}, ${signals[1].toLowerCase()}, and visible alignment with ${domain.clusterHints[0].toLowerCase()}.`, signals };
  }).sort((a, b) => b.score - a.score);
}

function domainEvidence(domain: DomainFitment, profile: PsychometricProfile) {
  const model = DOMAIN_LIBRARY.find((i) => i.key === domain.key);
  const skillMap = Object.fromEntries(profile.skills.map((i) => [i.label, i.percent])) as Record<string, number>;
  const interestMap = Object.fromEntries(profile.interests.map((i) => [i.label, i.percent])) as Record<string, number>;
  const clusterMap = Object.fromEntries(profile.clusters.map((i) => [i.label, i.percent])) as Record<string, number>;
  if (!model) return [{ label: 'Interests', value: domain.score }, { label: 'Capability', value: domain.score }, { label: 'Ecosystem fit', value: domain.score }];
  return [
    { label: 'Interests', value: clampPercent(average(model.interestHints.map((k) => interestMap[k] ?? 0))) },
    { label: 'Capability', value: clampPercent(average(model.skillHints.map((k) => skillMap[k] ?? 0))) },
    { label: 'Ecosystem fit', value: clampPercent(average(model.clusterHints.map((k) => clusterMap[k] ?? 0))) },
  ];
}

function buildExecutiveNarrative(profile: PsychometricProfile, domains: DomainFitment[], sections: SectionScore[], analytical: AnalyticalBreakdown[], confidence: ReturnType<typeof confidenceFromProfile>) {
  const topDomain = domains[0];
  const strongest = [...sections].sort((a, b) => b.score - a.score)[0];
  const weakest = [...sections].sort((a, b) => a.score - b.score)[0];
  const topSkill = trimSkillLabel(profile.skills[0]?.label ?? 'capability signal');
  const topInterest = profile.topInterests[0] ?? profile.interests[0]?.label ?? 'general exploration';
  const topIntelligence = trimIntelligenceLabel(profile.dominantIntelligence ?? profile.intelligences?.[0]?.label ?? 'core intelligence');
  const topAnalytical = analytical[0]?.label.toLowerCase();
  return `${firstName(profile.name)} shows the strongest fit toward ${topDomain?.label.toLowerCase() ?? 'broad discovery domains'}, supported by ${topInterest.toLowerCase()} interests, ${topSkill.toLowerCase()}, and ${topIntelligence.toLowerCase()}. ${strongest?.title ?? 'The profile'} currently carries the clearest evidence signal, while ${weakest?.title.toLowerCase() ?? 'the lowest-scoring area'} should receive the next focused development effort. ${topAnalytical ? `${topAnalytical} is the sharpest measured reasoning block in the current dataset.` : 'Measured reasoning evidence is still building.'} Reliability is ${confidence.label.toLowerCase()}.`;
}

function buildPriorityActions(profile: PsychometricProfile, domains: DomainFitment[], sections: SectionScore[], analytical: AnalyticalBreakdown[]) {
  const weakest = [...sections].sort((a, b) => a.score - b.score)[0];
  const weakestAnalytical = [...analytical].sort((a, b) => a.percent - b.percent)[0];
  const topDomain = domains[0];
  return [
    weakest ? `Raise ${weakest.title.toLowerCase()} with one structured improvement habit each week.` : 'Build stronger evidence by completing more of the assessment.',
    weakestAnalytical ? `Practice ${weakestAnalytical.label.toLowerCase()} in short, repeated sessions to improve measured accuracy.` : 'Continue building reasoning evidence through aptitude practice.',
    topDomain ? `Test the ${topDomain.label.toLowerCase()} domain through projects, reading, mentorship, or shadowing.` : 'Test one broad domain through projects, reading, and real-world exposure.',
    `Use ${profile.dominantLearning.toLowerCase()} methods when learning new material so strengths compound faster.`,
  ];
}

/* ------------------------- shared UI atoms ------------------------- */

function Card({ children, className = '', pad = 'p-5' }: { children: ReactNode; className?: string; pad?: string }) {
  return <div className={`rounded-2xl border bg-white ${pad} ${className}`} style={{ borderColor: C.line, boxShadow: '0 1px 2px rgba(22,36,59,0.04), 0 10px 24px rgba(22,36,59,0.05)' }}>{children}</div>;
}

function Eyebrow({ children, color = C.muted }: { children: ReactNode; color?: string }) {
  return <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color }}>{children}</p>;
}

/** Mindler signature: all bars in one bordered box, labels INSIDE the bars,
    sitting on a Low | Medium | High gridded track. */
function MindlerBars({ items, color }: { items: { label: string; value: number }[]; color: string }) {
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: C.line }}>
      <div className="relative px-3 py-3">
        <div className="pointer-events-none absolute inset-0 flex px-3">
          <div className="flex-1 border-r" style={{ borderColor: '#EDF1F7' }} />
          <div className="flex-1 border-r" style={{ borderColor: '#EDF1F7' }} />
          <div className="flex-1" />
        </div>
        <div className="relative space-y-1.5">
          {items.map((it) => (
            <div key={it.label} className="relative h-[26px] w-full overflow-hidden rounded-[5px]" style={{ background: C.faint }}>
              <div className="flex h-full items-center rounded-[5px] pl-2.5 pr-2" style={{ width: `${Math.max(26, it.value)}%`, background: color }}>
                <span className="truncate text-[11px] font-semibold text-white">{it.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex border-t" style={{ borderColor: C.line, background: C.faint }}>
        {['Low', 'Medium', 'High'].map((z) => (
          <div key={z} className="flex-1 py-1.5 text-center text-[9.5px] font-semibold uppercase tracking-wider" style={{ color: C.muted }}>{z}</div>
        ))}
      </div>
    </div>
  );
}

/** Mindler "Dominant ___" card — colored header strip + result + description. */
function DominantCard({ theme, tag, title, body }: { theme: SectionTheme; tag: string; title: string; body: string }) {
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: `${theme.color}55` }}>
      <div className="px-4 py-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white" style={{ background: theme.color }}>{tag}</div>
      <div className="p-4" style={{ background: theme.soft }}>
        <p className="text-[13px] font-bold" style={{ color: theme.deep }}>{title}</p>
        <p className="mt-1.5 text-[12px] leading-5" style={{ color: C.body }}>{body}</p>
      </div>
    </div>
  );
}

/** Chunky flat colored icon tile (the Mindler "Dominant" grid look). */
function FlatTile({ icon: Icon, label, color }: { icon: LucideIcon; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm" style={{ background: `linear-gradient(150deg, ${color}, ${color}cc)` }}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-1.5 max-w-[88px] text-[10px] font-semibold leading-tight" style={{ color: C.body }}>{label}</p>
    </div>
  );
}

/** 1–7 numbered scale dot indicator (per-trait detail). */
function ScaleDots({ value, color, count = 7 }: { value: number; color: string; count?: number }) {
  const active = Math.min(count, Math.max(1, Math.round((value / 100) * count)));
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => {
        const n = i + 1; const on = n === active;
        return <span key={n} className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold" style={{ background: on ? color : '#EEF2F8', color: on ? '#fff' : C.muted }}>{n}</span>;
      })}
    </div>
  );
}

function Bullet({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-[12px] leading-5" style={{ color: C.body }}>
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} /><span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StrengthWeakness({ strengths, weaknesses }: { strengths: string[]; weaknesses: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border p-3.5" style={{ borderColor: C.line, background: '#F1FAF4' }}>
        <div className="mb-2 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" style={{ color: C.green }} /><Eyebrow color={C.green}>Strengths</Eyebrow></div>
        <Bullet items={strengths.slice(0, 3)} color={C.green} />
      </div>
      <div className="rounded-xl border p-3.5" style={{ borderColor: C.line, background: '#FDF2F2' }}>
        <div className="mb-2 flex items-center gap-1.5"><Target className="h-4 w-4" style={{ color: C.red }} /><Eyebrow color={C.red}>Areas to develop</Eyebrow></div>
        <Bullet items={weaknesses.slice(0, 3)} color={C.red} />
      </div>
    </div>
  );
}

function Donut({ value, size = 132, color = C.blue, track = '#E7EEF8', caption = 'Fit index' }: { value: number; size?: number; color?: string; track?: string; caption?: string }) {
  const stroke = 12; const radius = (size - stroke) / 2; const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="44%" textAnchor="middle" dominantBaseline="central" style={{ fill: C.ink, fontSize: size * 0.26, fontWeight: 700 }}>{value}</text>
      <text x="50%" y="63%" textAnchor="middle" dominantBaseline="central" style={{ fill: C.muted, fontSize: size * 0.085, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{caption}</text>
    </svg>
  );
}

function RingStat({ label, value, color, size = 78 }: { label: string; value: number; color: string; size?: number }) {
  const stroke = 9; const radius = (size - stroke) / 2; const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <div className="flex flex-col items-center text-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EEF2F8" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" style={{ fill: C.ink, fontSize: size * 0.26, fontWeight: 700 }}>{value}</text>
      </svg>
      <p className="mt-1.5 text-[10.5px] font-semibold leading-tight" style={{ color: C.body }}>{label}</p>
    </div>
  );
}

/** Radar / spider chart — turns a set of scores into an instant "profile shape". */
function RadarChart({ axes, color, size = 192 }: { axes: { label: string; value: number }[]; color: string; size?: number }) {
  const n = axes.length;
  const cx = size / 2, cy = size / 2, R = size / 2 - 30;
  const ang = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, r: number): [number, number] => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
  const ringPoly = (f: number) => axes.map((_, i) => pt(i, R * f).join(',')).join(' ');
  const dataPoly = axes.map((a, i) => pt(i, (R * Math.max(0, Math.min(100, a.value))) / 100).join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" aria-hidden>
      {[0.25, 0.5, 0.75, 1].map((f) => <polygon key={f} points={ringPoly(f)} fill={f === 1 ? '#FBFCFE' : 'none'} stroke="#E4EAF3" strokeWidth="1" />)}
      {axes.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#EEF2F8" strokeWidth="1" />; })}
      <polygon points={dataPoly} fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {axes.map((a, i) => { const [x, y] = pt(i, (R * Math.max(0, Math.min(100, a.value))) / 100); return <circle key={i} cx={x} cy={y} r="3" fill={color} />; })}
      {axes.map((a, i) => {
        const [x, y] = pt(i, R + 13);
        const c = Math.cos(ang(i));
        const anchor = Math.abs(c) < 0.3 ? 'middle' : c > 0 ? 'start' : 'end';
        return <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" style={{ fontSize: 8, fontWeight: 600, fill: C.muted }}>{a.label}</text>;
      })}
    </svg>
  );
}

/** Plain-language takeaway callout — converts scores into an insight sentence. */
function InsightBanner({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border p-3" style={{ borderColor: `${color}40`, background: `${color}0d` }}>
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: color }}><Lightbulb className="h-3 w-3 text-white" /></span>
      <p className="text-[12px] leading-5" style={{ color: C.body }}><b style={{ color: C.ink }}>What this means: </b>{children}</p>
    </div>
  );
}

/** Clean rising-chart motif for section hero banners (white-on-colour). */
function HeroDeco() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" fill="none" aria-hidden>
      <circle cx="184" cy="30" r="20" fill="#fff" opacity="0.12" />
      <circle cx="184" cy="30" r="11" fill="#fff" opacity="0.18" />
      {[{ x: 96, h: 26 }, { x: 116, h: 40 }, { x: 136, h: 56 }, { x: 156, h: 74 }, { x: 176, h: 92 }].map((b) => (
        <rect key={b.x} x={b.x} y={104 - b.h} width="12" height={b.h} rx="3" fill="#fff" opacity="0.16" />
      ))}
      <polyline points="102,84 122,72 142,58 162,42 182,26" stroke="#fff" strokeWidth="2.4" strokeOpacity="0.55" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {[[102, 84], [122, 72], [142, 58], [162, 42], [182, 26]].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="3.4" fill="#fff" />
      ))}
    </svg>
  );
}

/** Flat "path to the flag" illustration for the career-match page. */
function CareerIllo() {
  return (
    <svg viewBox="0 0 260 120" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <ellipse cx="130" cy="106" rx="120" ry="12" fill="#2D7FF0" opacity="0.08" />
      {/* steps rising to the right */}
      {[{ x: 20, h: 22, c: '#CFE0F7' }, { x: 70, h: 40, c: '#9DC2F0' }, { x: 120, h: 58, c: '#5B9DF7' }, { x: 170, h: 78, c: '#2D7FF0' }].map((s) => (
        <rect key={s.x} x={s.x} y={100 - s.h} width="46" height={s.h} rx="6" fill={s.c} />
      ))}
      {/* flag on top step */}
      <rect x="206" y="14" width="3.5" height="32" rx="1.5" fill="#16314C" />
      <path d="M209.5,16 L236,22 L209.5,30 Z" fill="#F2994A" />
      {/* star + dots */}
      <path d="M150,12 l2.2,4.6 5,0.6 -3.7,3.5 1,5 -4.5,-2.5 -4.5,2.5 1,-5 -3.7,-3.5 5,-0.6 Z" fill="#F2C94C" />
      <circle cx="42" cy="34" r="3" fill="#27AE60" /><circle cx="92" cy="22" r="2.4" fill="#EB5757" />
      {/* dashed path */}
      <path d="M30,86 C70,80 90,60 130,52 C160,46 180,40 206,30" stroke="#2D7FF0" strokeWidth="2" strokeDasharray="3 4" fill="none" strokeOpacity="0.5" />
    </svg>
  );
}

/** Flat, real-world-themed illustration for each career domain. */
function DomainArt({ domainKey, size = 56 }: { domainKey: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 64 64', fill: 'none' as const, xmlns: 'http://www.w3.org/2000/svg' };
  switch (domainKey) {
    case 'engineering-technology':
      return (<svg {...common} aria-hidden><circle cx="26" cy="28" r="13" fill="#fff" stroke="#2D7FF0" strokeWidth="3" /><circle cx="26" cy="28" r="4" fill="#2D7FF0" />{[0, 60, 120, 180, 240, 300].map((a) => { const r = (a * Math.PI) / 180; return <rect key={a} x={26 + Math.cos(r) * 13 - 2} y={28 + Math.sin(r) * 13 - 2} width="4" height="6" rx="1.5" fill="#2D7FF0" transform={`rotate(${a} 26 28)`} />; })}<rect x="38" y="40" width="16" height="10" rx="2" fill="#27AE60" /><rect x="41" y="36" width="10" height="6" rx="1.5" fill="#1E8A4C" /></svg>);
    case 'research-analytics':
      return (<svg {...common} aria-hidden><path d="M26 12 h12 v10 l9 20 a4 4 0 0 1 -4 6 h-22 a4 4 0 0 1 -4 -6 l9 -20 z" fill="#E6F6EC" stroke="#27AE60" strokeWidth="2.5" /><path d="M20 38 h24 l3 6 a4 4 0 0 1 -4 6 h-22 a4 4 0 0 1 -4 -6 z" fill="#27AE60" /><circle cx="28" cy="44" r="2" fill="#fff" /><circle cx="36" cy="47" r="1.5" fill="#fff" /><rect x="24" y="10" width="16" height="4" rx="2" fill="#176B3A" /></svg>);
    case 'psychology-human-behaviour':
      return (<svg {...common} aria-hidden><path d="M40 14 C24 12 14 24 16 36 c1 7 7 9 7 14 v4 h14 v-6 c8 -3 12 -10 11 -19 C47 22 46 16 40 14 z" fill="#F3ECFD" stroke="#9B51E0" strokeWidth="2.5" /><path d="M31 28 c-3 -4 -9 -1 -7 4 c1 4 7 7 7 7 s6 -3 7 -7 c2 -5 -4 -8 -7 -4 z" fill="#9B51E0" /></svg>);
    case 'arts-design-culture':
      return (<svg {...common} aria-hidden><path d="M32 14 C20 14 12 22 12 32 c0 9 7 14 14 14 3 0 4 -2 4 -4 0 -3 3 -4 6 -4 6 0 12 -4 12 -12 0 -10 -8 -18 -16 -12 z" fill="#FDF0E6" stroke="#F2994A" strokeWidth="2.5" /><circle cx="22" cy="28" r="2.6" fill="#EB5757" /><circle cx="30" cy="22" r="2.6" fill="#F2C94C" /><circle cx="39" cy="26" r="2.6" fill="#2D9CDB" /><circle cx="40" cy="35" r="2.6" fill="#27AE60" /><rect x="40" y="40" width="4" height="14" rx="2" fill="#9C5A1E" transform="rotate(35 42 47)" /></svg>);
    case 'business-entrepreneurship':
      return (<svg {...common} aria-hidden><rect x="14" y="26" width="36" height="22" rx="3" fill="#EB5757" /><path d="M26 26 v-4 a3 3 0 0 1 3 -3 h6 a3 3 0 0 1 3 3 v4" fill="none" stroke="#9C2B2B" strokeWidth="3" /><rect x="14" y="33" width="36" height="3" fill="#9C2B2B" opacity="0.5" /><path d="M40 22 l8 -6 m0 0 h-5 m5 0 v5" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>);
    case 'finance-strategy':
      return (<svg {...common} aria-hidden><rect x="14" y="34" width="7" height="16" rx="1.5" fill="#9DC2F0" /><rect x="25" y="26" width="7" height="24" rx="1.5" fill="#5B9DF7" /><rect x="36" y="18" width="7" height="32" rx="1.5" fill="#2D7FF0" /><circle cx="44" cy="20" r="9" fill="#F2C94C" stroke="#C99A1E" strokeWidth="2" /><text x="44" y="24" textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: '#9C7A12' }}>₹</text></svg>);
    case 'education-social-impact':
      return (<svg {...common} aria-hidden><path d="M12 26 l20 -8 20 8 -20 8 z" fill="#2D9CDB" /><path d="M20 31 v8 c0 3 24 3 24 0 v-8" fill="none" stroke="#1B6491" strokeWidth="2.5" /><rect x="50" y="26" width="2.5" height="10" fill="#1B6491" /><path d="M18 40 h28 v10 a2 2 0 0 1 -2 2 h-24 a2 2 0 0 1 -2 -2 z" fill="#E7F4FC" stroke="#2D9CDB" strokeWidth="2" /></svg>);
    case 'health-life-sciences':
      return (<svg {...common} aria-hidden><path d="M32 50 C18 40 12 32 12 24 a10 10 0 0 1 20 -4 a10 10 0 0 1 20 4 c0 8 -6 16 -20 26 z" fill="#FDEAEA" stroke="#EB5757" strokeWidth="2.5" /><path d="M16 30 h8 l3 -7 4 14 3 -7 h14" stroke="#EB5757" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>);
    default:
      return (<svg {...common} aria-hidden><circle cx="32" cy="32" r="18" fill="#E8F1FE" stroke="#2D7FF0" strokeWidth="2.5" /><path d="M24 32 l6 6 12 -13" stroke="#2D7FF0" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>);
  }
}

/** Mindler-style framework: head + brain with the six lenses orbiting it,
    each a colored ring badge connected by a flowing line, with a caption. */
function FrameworkFlow({ sections }: { sections: SectionScore[] }) {
  const scoreById = Object.fromEntries(sections.map((s) => [s.id, s.score]));
  const pos = [
    { left: 14, top: 17 }, { left: 11, top: 50 }, { left: 14, top: 83 },
    { left: 86, top: 17 }, { left: 89, top: 50 }, { left: 86, top: 83 },
  ];
  const nodes = LENSES.map((lens, i) => ({ ...lens, theme: themeFor(lens.id), score: scoreById[lens.id] ?? 0, ...pos[i] }));
  return (
    <div className="relative h-full w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {nodes.map((n) => {
          const sx = n.left < 50 ? 38 : 62; const ex = n.left;
          return <path key={n.id} d={`M${sx},50 Q${(sx + ex) / 2},${(50 + n.top) / 2} ${ex},${n.top}`} stroke={n.theme.color} strokeWidth="0.5" fill="none" strokeOpacity="0.5" />;
        })}
      </svg>
      <div className="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2"><HeadIllo /></div>
      {nodes.map((n) => {
        const Icon = n.theme.icon;
        return (
          <div key={n.id} className="absolute w-[130px] -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${n.left}%`, top: `${n.top}%` }}>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: n.theme.deep }}>{n.label}</p>
            <span className="mx-auto my-1 flex h-12 w-12 items-center justify-center rounded-full border-4 bg-white" style={{ borderColor: n.theme.color, color: n.theme.color, boxShadow: '0 6px 14px rgba(22,36,59,0.10)' }}><Icon className="h-5 w-5" /></span>
            <p className="text-[9px] leading-tight" style={{ color: C.muted }}>{n.caption}</p>
          </div>
        );
      })}
    </div>
  );
}

function SectionHero({ theme, eyebrow, title, subtitle }: { theme: SectionTheme; eyebrow: string; title: string; subtitle: string }) {
  const Icon = theme.icon;
  return (
    <div className="relative overflow-hidden rounded-2xl px-6 py-5" style={{ background: `linear-gradient(135deg, ${theme.color}, ${theme.deep})` }}>
      <div className="absolute right-0 top-0 h-full w-56 opacity-80"><HeroDeco /></div>
      <div className="relative flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/18 text-white backdrop-blur"><Icon className="h-6 w-6" /></span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">{eyebrow}</p>
          <h2 className="text-[22px] font-extrabold leading-tight text-white">{title}</h2>
          <p className="mt-0.5 max-w-[470px] text-[11.5px] leading-4 text-white/85">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

/** Iconic side-profile head with a stylised brain — the framework illustration. */
function HeadIllo() {
  return (
    <svg viewBox="0 0 230 240" className="mx-auto h-full w-full max-h-[300px]" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="head-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3F8BF2" /><stop offset="1" stopColor="#1E4FA8" /></linearGradient>
      </defs>
      <circle cx="115" cy="118" r="104" fill="#2D7FF0" opacity="0.07" />
      <circle cx="115" cy="118" r="78" fill="#2D7FF0" opacity="0.05" />
      {/* neck + shoulders */}
      <path d="M86,176 L86,200 C86,214 70,220 58,224 L172,224 C150,216 142,206 142,192 L142,176 Z" fill="url(#head-g)" opacity="0.55" />
      {/* head silhouette facing right */}
      <path d="M70,178 C46,150 46,96 72,68 C96,42 146,44 162,76 C168,90 165,100 173,108 C181,116 185,118 181,124 C177,129 169,126 168,134 C173,150 159,172 132,182 C112,190 86,190 70,178 Z" fill="url(#head-g)" />
      {/* stylised brain */}
      <g transform="translate(132 96)">
        <circle cx="-16" cy="-2" r="13" fill="#fff" opacity="0.92" />
        <circle cx="1" cy="-9" r="12" fill="#fff" opacity="0.92" />
        <circle cx="14" cy="1" r="12" fill="#fff" opacity="0.92" />
        <circle cx="-3" cy="10" r="11" fill="#fff" opacity="0.92" />
        <circle cx="11" cy="13" r="9" fill="#fff" opacity="0.92" />
        <path d="M-22,-2 q7,-9 14,0 q7,9 14,0 q6,-6 10,2" stroke="#2D7FF0" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M-8,-12 q2,10 -2,20" stroke="#2D7FF0" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
      {/* spark dots */}
      <circle cx="186" cy="70" r="4" fill="#F2C94C" /><circle cx="196" cy="92" r="2.6" fill="#27AE60" /><circle cx="60" cy="60" r="3" fill="#2D9CDB" />
    </svg>
  );
}

/** Floating flat badge with a tiny glyph (used in the cover scene). */
function Badge({ x, y, bg, kind }: { x: number; y: number; bg: string; kind: 'cap' | 'target' | 'bulb' | 'briefcase' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="20" fill="#fff" opacity="0.95" />
      <circle cx="0" cy="0" r="20" fill={bg} opacity="0.16" />
      {kind === 'cap' && <g fill={bg}><path d="M-11,-2 L0,-8 L11,-2 L0,4 Z" /><path d="M-7,0 L-7,6 Q0,10 7,6 L7,0 L0,3 Z" /><rect x="10" y="-2" width="1.6" height="8" /></g>}
      {kind === 'target' && <g><circle cx="0" cy="0" r="9" fill="none" stroke={bg} strokeWidth="2.4" /><circle cx="0" cy="0" r="4" fill={bg} /></g>}
      {kind === 'bulb' && <g fill={bg}><circle cx="0" cy="-2" r="7" /><rect x="-3.5" y="4" width="7" height="4" rx="1.5" /></g>}
      {kind === 'briefcase' && <g fill={bg}><rect x="-9" y="-3" width="18" height="12" rx="2.5" /><path d="M-4,-3 L-4,-6 L4,-6 L4,-3" fill="none" stroke={bg} strokeWidth="2" /></g>}
    </g>
  );
}

/** Cover scene: isometric growth bars + report card + magnifier + floating badges.
    Designed to sit on a dark/blue panel (whites and accents pop). */
function IsoHero() {
  return (
    <svg viewBox="0 0 340 300" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="iso-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#EAF2FE" /></linearGradient>
      </defs>
      <ellipse cx="175" cy="244" rx="140" ry="40" fill="#fff" opacity="0.08" />
      {[{ x: 110, h: 56, top: '#A86BE8', side: '#8B4FCE' }, { x: 164, h: 92, top: '#37B0E6', side: '#2A8FC4' }, { x: 218, h: 128, top: '#3FD389', side: '#2BB373' }].map((bar) => {
        const baseY = 206; const topY = baseY - bar.h; const w = 40; const d = 18;
        return (
          <g key={bar.x}>
            <path d={`M${bar.x},${topY} l${w},0 l${d},-${d * 0.6} l-${w},0 z`} fill={bar.top} opacity="0.95" />
            <path d={`M${bar.x},${topY} l${w},0 l0,${bar.h} l-${w},0 z`} fill={bar.top} />
            <path d={`M${bar.x + w},${topY} l${d},-${d * 0.6} l0,${bar.h} l-${d},${d * 0.6} z`} fill={bar.side} />
          </g>
        );
      })}
      {/* report card with checklist */}
      <g transform="rotate(-8 78 110)">
        <rect x="40" y="72" width="84" height="104" rx="11" fill="url(#iso-c)" stroke="#D8E4F6" />
        <rect x="53" y="88" width="40" height="8" rx="4" fill="#2D7FF0" />
        <rect x="53" y="106" width="58" height="5" rx="2.5" fill="#D7E2F2" /><rect x="53" y="118" width="58" height="5" rx="2.5" fill="#D7E2F2" />
        <rect x="53" y="138" width="24" height="24" rx="7" fill="#F2C94C" /><path d="M59 150l4 4 9-10" stroke="#16314C" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="85" y="142" width="34" height="5" rx="2.5" fill="#D7E2F2" /><rect x="85" y="153" width="26" height="5" rx="2.5" fill="#D7E2F2" />
      </g>
      {/* magnifier */}
      <g transform="translate(150 150)"><circle cx="0" cy="0" r="26" fill="#fff" opacity="0.18" /><circle cx="0" cy="0" r="26" fill="none" stroke="#fff" strokeWidth="5" /><rect x="18" y="18" width="30" height="9" rx="4.5" transform="rotate(45 18 18)" fill="#fff" /></g>
      {/* floating career badges */}
      <Badge x={60} y={46} bg="#F2994A" kind="bulb" />
      <Badge x={296} y={70} bg="#27AE60" kind="cap" />
      <Badge x={300} y={170} bg="#EB5757" kind="target" />
      <Badge x={44} y={210} bg="#2D7FF0" kind="briefcase" />
    </svg>
  );
}

function DomainFitmentCard({ domain, rank, profile }: { domain: DomainFitment; rank: number; profile: PsychometricProfile }) {
  const evidence = domainEvidence(domain, profile);
  const accent = rank === 1 ? C.blue : rank === 2 ? '#2D9CDB' : '#27AE60';
  return (
    <Card pad="p-4">
      <div className="grid grid-cols-[1.35fr_1fr] gap-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-[14px] font-extrabold text-white" style={{ background: accent }}>{rank}</span>
            <div className="min-w-0 flex-1"><Eyebrow>Fitment domain #{rank}</Eyebrow><h3 className="text-[17px] font-bold leading-tight" style={{ color: C.ink }}>{domain.label}</h3></div>
            <span className="rounded-lg px-3 py-1.5 text-[13px] font-bold" style={{ background: `${accent}14`, color: accent }}>{domain.score}<span className="text-[10px] font-semibold opacity-70">/100</span></span>
          </div>
          <p className="mt-2.5 text-[12px] leading-5" style={{ color: C.body }}>{domain.focus}</p>
          <p className="mt-2 text-[11.5px] leading-5" style={{ color: C.muted }}>{domain.rationale}</p>
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: C.line, background: C.faint }}>
          <Eyebrow>Why it fits — evidence</Eyebrow>
          <div className="mt-2.5 space-y-2.5">
            {evidence.map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex items-center justify-between text-[11px]" style={{ color: C.body }}><span className="font-medium">{bar.label}</span><span className="font-bold tabular-nums" style={{ color: C.ink }}>{bar.value}</span></div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white" style={{ border: `1px solid ${C.line}` }}><div className="h-full rounded-full" style={{ width: `${Math.max(4, bar.value)}%`, background: accent }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function PageFrame({ page, kicker, name, children }: { page: number; kicker: string; name: string; children: ReactNode }) {
  return (
    <section className="a4-page mx-auto flex flex-col overflow-hidden bg-white" style={{ width: '210mm', height: '297mm', breakBefore: page > 1 ? 'page' : 'auto' }}>
      <header className="flex items-center justify-between px-10 pt-6 pb-3">
        <div className="flex items-center gap-2.5"><Logo size={22} /><span className="text-[12px] font-semibold" style={{ color: C.muted }}>Career Discovery Report</span></div>
        <span className="text-[11px] font-medium" style={{ color: C.muted }}>{kicker}</span>
      </header>
      <div className="flex-1 overflow-hidden px-10 pb-2">{children}</div>
      <footer className="flex items-center justify-between border-t px-10 py-3 text-[10px]" style={{ borderColor: C.line, color: C.muted }}>
        <div className="flex items-center gap-4"><span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" />8977760443</span><span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" />support@onegrasp.com</span></div>
        <span className="font-medium">{name} · Page {page} of {TOTAL_PAGES}</span>
      </footer>
    </section>
  );
}

/* Reusable section page: hero + explainer + dominant card + Mindler bars + footer block. */
function SectionPage({ page, kicker, name, theme, eyebrow, title, subtitle, whatIs, dominantTag, dominantTitle, dominantBody, bars, insight, footer }: {
  page: number; kicker: string; name: string; theme: SectionTheme; eyebrow: string; title: string; subtitle: string;
  whatIs: string; dominantTag: string; dominantTitle: string; dominantBody: string;
  bars: { label: string; value: number }[]; insight?: ReactNode; footer: ReactNode;
}) {
  return (
    <PageFrame page={page} kicker={kicker} name={name}>
      <div className="flex h-full flex-col gap-3.5">
        <SectionHero theme={theme} eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <p className="text-[12px] leading-5" style={{ color: C.body }}><b style={{ color: C.ink }}>What this measures: </b>{whatIs}</p>
        <div className="grid grid-cols-[0.92fr_1.08fr] gap-4">
          <DominantCard theme={theme} tag={dominantTag} title={dominantTitle} body={dominantBody} />
          <MindlerBars items={bars} color={theme.color} />
        </div>
        {insight && <InsightBanner color={theme.color}>{insight}</InsightBanner>}
        <div className="flex-1">{footer}</div>
      </div>
    </PageFrame>
  );
}

/* ------------------------------ report ----------------------------- */

export default function PsychometricReport({ profile }: { profile: PsychometricProfile }) {
  const confidence = confidenceFromProfile(profile);
  const analytical = profile.analyticalBreakdown?.length ? profile.analyticalBreakdown : buildFallbackBreakdown(profile);
  const sections = profile.sectionScores?.length ? profile.sectionScores : buildFallbackSections(profile, analytical);
  const domains = (profile.domainFitments?.length ? profile.domainFitments : buildFallbackDomains(profile)).slice(0, 5);

  const generated = new Date(profile.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const summary = buildExecutiveNarrative(profile, domains, sections, analytical, confidence);
  const priorities = buildPriorityActions(profile, domains, sections, analytical);
  const strongestSection = [...sections].sort((a, b) => b.score - a.score)[0];
  const weakestSection = [...sections].sort((a, b) => a.score - b.score)[0];
  const eqAverage = clampPercent(average(profile.eq.map((i) => i.percent)));
  const topCapabilities = profile.skills.slice(0, 6);
  const topIntelligences = (profile.intelligences ?? []).slice(0, 8);
  const sectionById = Object.fromEntries(sections.map((s) => [s.id, s])) as Record<string, SectionScore>;
  const clusters = [...profile.clusters].sort((a, b) => b.percent - a.percent).slice(0, 8);
  const traitLetters = (profile.mbtiType || '').split('');
  const streamDomains = domains.slice(0, 2).map((d) => ({ domain: d, stream: DOMAIN_STREAMS[d.key] })).filter((x) => x.stream);
  const SkillRingColors = ['#2D7FF0', '#27AE60', '#11998E', '#9B51E0', '#F2994A', '#2D9CDB', '#EB5757', '#16314C'];

  // top domain "career match" fit bars
  const topDomain = domains[0];
  const matchEvidence = topDomain ? domainEvidence(topDomain, profile) : [];
  const matchBars = topDomain ? [
    { label: 'Interest fit', value: matchEvidence[0]?.value ?? 0 },
    { label: 'Aptitude / capability', value: matchEvidence[1]?.value ?? 0 },
    { label: 'Ecosystem alignment', value: matchEvidence[2]?.value ?? 0 },
    { label: 'Personality fit', value: sectionById.personality?.score ?? 0 },
    { label: 'Emotional quotient', value: eqAverage },
  ] : [];

  return (
    <div className="min-h-screen" style={{ background: C.page }}>
      <style>{`
        @page { size: A4; margin: 0; }
        body { background: ${C.page}; }
        .a4-page { margin-bottom: 16px; box-shadow: 0 20px 44px rgba(22,36,59,0.14); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print { body { background: white; } .report-toolbar { display: none !important; } .a4-page { margin: 0 auto !important; box-shadow: none !important; } }
      `}</style>

      <header className="report-toolbar sticky top-0 z-40 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-16 max-w-[230mm] items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/dashboard"><Logo size={30} /></Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[#F4F8FD]" style={{ borderColor: C.line, color: C.body }}><LayoutDashboard className="h-4 w-4" /><span className="hidden sm:inline">Back to Dashboard</span><span className="sm:hidden">Dashboard</span></Link>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow" style={{ background: C.blue }}><Printer className="h-4 w-4" /><span className="hidden sm:inline">Save as PDF</span><span className="sm:hidden">PDF</span></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[230mm] space-y-4 px-4 py-6 sm:px-6">

        {/* ===== PAGE 1 — COVER ===== */}
        <PageFrame page={1} kicker="Prepared by OneGrasp" name={profile.name}>
          <div className="flex h-full flex-col gap-5">
            {/* bold colored hero band */}
            <div className="relative overflow-hidden rounded-3xl" style={{ background: `linear-gradient(135deg, ${C.blue} 0%, #2360C4 55%, ${C.navy} 100%)` }}>
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 600 320" preserveAspectRatio="none" aria-hidden>
                <defs><pattern id="cov-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#fff" opacity="0.10" /></pattern></defs>
                <rect width="600" height="320" fill="url(#cov-dots)" />
                <path d="M0,250 C120,210 180,300 320,250 C440,210 520,280 600,240 L600,320 L0,320 Z" fill="#fff" opacity="0.05" />
                <circle cx="70" cy="60" r="80" fill="#fff" opacity="0.05" />
              </svg>
              <div className="relative grid grid-cols-[1.05fr_0.95fr] gap-4 px-8 py-7">
                <div className="flex flex-col justify-center">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur"><Sparkles className="h-3.5 w-3.5 text-[#F2C94C]" /> Psychometric Career Assessment</span>
                  <h1 className="mt-4 text-[44px] font-extrabold leading-[1.02] text-white">Career<br />Discovery<br /><span style={{ color: C.yellow }}>Report</span></h1>
                  <p className="mt-3 max-w-[340px] text-[12.5px] leading-5 text-white/85">Deep insights into your holistic profile and recommended career domains, mapped from how you actually answered across six lenses.</p>
                </div>
                <div className="relative h-[250px]"><IsoHero /></div>
              </div>
            </div>

            {/* name + details card */}
            <div className="grid grid-cols-[1fr_auto] items-center gap-6 rounded-2xl border p-5" style={{ borderColor: C.line, background: C.faint }}>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div><Eyebrow>Prepared for</Eyebrow><p className="mt-1 text-[24px] font-extrabold" style={{ color: C.ink }}>{profile.name}</p></div>
                <div><Eyebrow>Generated</Eyebrow><p className="mt-1 text-[14px] font-semibold" style={{ color: C.body }}>{generated}</p></div>
                <div><Eyebrow>Reliability</Eyebrow><p className="mt-1 text-[14px] font-semibold" style={{ color: C.body }}>{confidence.label} · {confidence.answered}/{confidence.total} answered</p></div>
                <div><Eyebrow>Top domain</Eyebrow><p className="mt-1 text-[14px] font-semibold" style={{ color: C.body }}>{domains[0]?.label ?? '—'}</p></div>
              </div>
              <div className="flex items-center gap-3 border-l pl-6" style={{ borderColor: C.line }}><Donut value={profile.overallScore} caption="Fit index" /></div>
            </div>

            <div className="flex-1">
              <Eyebrow>Your top 5 fitment domains</Eyebrow>
              <div className="mt-2.5 grid grid-cols-5 gap-2.5">
                {domains.map((domain, index) => {
                  const accent = [C.blue, '#2D9CDB', '#27AE60', '#9B51E0', '#F2994A'][index] ?? C.blue;
                  return (
                    <div key={domain.key} className="rounded-2xl border p-3" style={{ borderColor: C.line, borderTop: `4px solid ${accent}` }}>
                      <div className="flex items-center justify-between"><span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${accent}16` }}><DomainArt domainKey={domain.key} size={20} /></span><span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold" style={{ background: `${accent}14`, color: accent }}>{domain.score}</span></div>
                      <p className="mt-2 text-[9px] font-bold uppercase tracking-wider" style={{ color: accent }}>#{index + 1}</p>
                      <p className="mt-0.5 text-[11px] font-bold leading-tight" style={{ color: C.ink }}>{domain.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </PageFrame>

        {/* ===== PAGE 2 — FRAMEWORK ===== */}
        <PageFrame page={2} kicker="The discovery framework" name={profile.name}>
          <div className="flex h-full flex-col">
            <div>
              <Eyebrow color={C.blue}>The OneGrasp framework</Eyebrow>
              <h2 className="mt-1 text-[26px] font-extrabold" style={{ color: C.ink }}>Six lenses, read together</h2>
              <p className="mt-2 max-w-[660px] text-[12.5px] leading-5" style={{ color: C.body }}>Your report combines six independent lenses into one integrated picture. No single answer decides your direction — the lenses are weighed together to recommend broad career <b>domains</b>, never single job roles.</p>
            </div>

            <Card pad="p-3" className="mt-3 flex-1">
              <div className="h-full w-full"><FrameworkFlow sections={sections} /></div>
            </Card>

            <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl px-5 py-3.5 text-white" style={{ background: `linear-gradient(135deg, ${C.navy}, #24405E)` }}>
              <p className="text-[12.5px] font-semibold">Let’s look at your results for each of these lenses — and help you discover the domains that fit you best.</p>
              <div className="flex shrink-0 items-center gap-4">
                <div className="text-center"><p className="text-[9px] uppercase tracking-wider text-white/60">Strongest</p><p className="text-[12px] font-bold">{strongestSection?.title ?? '—'}</p></div>
                <div className="text-center"><p className="text-[9px] uppercase tracking-wider text-white/60">Fit index</p><p className="text-[18px] font-extrabold leading-none" style={{ color: C.yellow }}>{profile.overallScore}</p></div>
              </div>
            </div>
          </div>
        </PageFrame>

        {/* ===== PAGE 3 — ABOUT + JOURNEY ===== */}
        <PageFrame page={3} kicker="About this report" name={profile.name}>
          <div className="flex h-full flex-col gap-4">
            <SectionHero theme={SECTION_THEME.clusters} eyebrow="Your career planning journey" title={`Welcome, ${firstName(profile.name)}`} subtitle="A scientific, evidence-based map of how you think, what excites you, and where you fit." />
            <Card pad="p-4"><Eyebrow color={C.blue}>About this report</Eyebrow><p className="mt-2 text-[13px] leading-6" style={{ color: C.body }}>Congratulations on completing your assessment. This report analyses your <b>personality, interests, motivators, learning style, intelligences and reasoning</b> — everything here is derived only from your own answers. We use it to recommend broad, future-ready <b>domains</b> rather than narrow job titles, so you keep your options open while moving in the right direction.</p></Card>
            <div>
              <Eyebrow color={C.blue}>Our 5-step career planning framework</Eyebrow>
              <div className="mt-2.5 grid grid-cols-5 gap-3">
                {[{ n: 1, t: 'Career Analysis', icon: Search }, { n: 2, t: 'Best Options', icon: Layers }, { n: 3, t: 'Educational Plan', icon: GraduationCap }, { n: 4, t: 'Execution Plan', icon: Rocket }, { n: 5, t: 'Counselling', icon: ClipboardCheck }].map((step) => {
                  const Icon = step.icon;
                  return <div key={step.n} className="rounded-2xl p-3.5 text-center text-white" style={{ background: step.n % 2 ? `linear-gradient(150deg, ${C.blue}, ${C.navy})` : `linear-gradient(150deg, #2D9CDB, ${C.navy})` }}><Icon className="mx-auto h-5 w-5" /><p className="mt-2 text-[18px] font-extrabold" style={{ color: C.yellow }}>{step.n}</p><p className="text-[11px] font-semibold leading-tight">{step.t}</p></div>;
                })}
              </div>
            </div>
            <Card pad="p-4" className="flex-1">
              <Eyebrow color={C.blue}>What’s inside</Eyebrow>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {LENSES.map((lens) => {
                  const theme = themeFor(lens.id); const Icon = theme.icon; const score = sectionById[lens.id]?.score ?? 0;
                  return <div key={lens.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: C.line }}><span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: theme.soft, color: theme.color }}><Icon style={{ width: 18, height: 18 }} /></span><div className="min-w-0"><p className="truncate text-[12.5px] font-bold" style={{ color: C.ink }}>{lens.label}</p><p className="text-[10.5px]" style={{ color: C.muted }}>{score}/100 · {bandLabel(score)}</p></div></div>;
                })}
              </div>
              <div className="mt-3 rounded-xl border p-3" style={{ borderColor: C.line, background: C.faint }}><p className="text-[11.5px] leading-5" style={{ color: C.body }}><b style={{ color: C.ink }}>How to read scores:</b> every bar sits on a <b>Low / Medium / High</b> track. Higher isn’t always “better” — it shows where your signal is strongest. Use the strengths to lean in, and the develop notes to grow.</p></div>
            </Card>
          </div>
        </PageFrame>

        {/* ===== PAGE 4 — PERSONALITY ===== */}
        <PageFrame page={4} kicker="Lens 1 · Personality" name={profile.name}>
          <div className="flex h-full flex-col gap-4">
            <SectionHero theme={SECTION_THEME.personality} eyebrow="Career personality" title="How you think, decide & work" subtitle="Your consistent behaviour patterns and natural decision style." />
            <div className="grid grid-cols-[0.92fr_1.08fr] gap-4">
              <DominantCard theme={SECTION_THEME.personality} tag="Your personality type" title={`${profile.mbtiType} — ${traitLetters.map((l) => TRAIT_NAMES[l] ?? l).join(', ')}`} body={`These are neutral decision-style signals, not stereotype labels. ${sectionById.personality?.strengths?.[0] ?? 'Your preferences are clearest on the axes shown.'}.`} />
              <div className="overflow-hidden rounded-xl border" style={{ borderColor: C.line }}>
                <div className="px-4 py-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white" style={{ background: SECTION_THEME.personality.color }}>Your decision-style axes</div>
                <div className="space-y-2.5 p-4">
                  {profile.mbtiAxes.map((axis) => (
                    <div key={axis.axis}>
                      <div className="flex items-center justify-between text-[10.5px] font-medium" style={{ color: C.muted }}><span>{axis.left}</span><span>{axis.right}</span></div>
                      <div className="relative mt-1 h-2.5 overflow-hidden rounded-full" style={{ background: C.faint }}><span className="absolute inset-y-0" style={{ left: '50%', width: 1, background: '#DCE4F0' }} /><div className="h-full rounded-full" style={{ width: `${axis.rightPct}%`, background: SECTION_THEME.personality.color }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-4 gap-2.5">
              {traitLetters.map((letter, i) => (
                <div key={`${letter}-${i}`} className="flex flex-col rounded-xl border p-3" style={{ borderColor: C.line }}>
                  <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg text-[13px] font-extrabold text-white" style={{ background: SECTION_THEME.personality.color }}>{letter}</span><p className="text-[12px] font-bold" style={{ color: C.ink }}>{TRAIT_NAMES[letter] ?? letter}</p></div>
                  <div className="mt-2"><ScaleDots value={profile.mbtiAxes[i] ? profile.mbtiAxes[i].rightPct : 60} color={SECTION_THEME.personality.color} /></div>
                  <p className="mt-2 text-[10px] leading-4" style={{ color: C.body }}>{MBTI_DESC[letter]?.[0] ?? ''}</p>
                </div>
              ))}
            </div>
            <StrengthWeakness strengths={sectionById.personality?.strengths ?? profile.strengths} weaknesses={sectionById.personality?.weaknesses ?? []} />
          </div>
        </PageFrame>

        {/* ===== PAGE 5 — INTERESTS ===== */}
        <PageFrame page={5} kicker="Lens 2 · Interests" name={profile.name}>
          <div className="flex h-full flex-col gap-3.5">
            <SectionHero theme={SECTION_THEME.interests} eyebrow="Career interests (RIASEC)" title="What excites & fascinates you" subtitle="The activities and work areas you are naturally drawn to and stay engaged with." />
            <p className="text-[12px] leading-5" style={{ color: C.body }}><b style={{ color: C.ink }}>What this measures: </b>{SECTION_MEANING.interests}</p>
            <div className="grid grid-cols-[0.82fr_1.18fr] gap-4">
              <Card pad="p-3" className="flex flex-col">
                <Eyebrow color={SECTION_THEME.interests.color}>Your interest shape</Eyebrow>
                <div className="mt-1 h-[196px] w-full"><RadarChart axes={profile.interests.map((i) => ({ label: i.label, value: i.percent }))} color={SECTION_THEME.interests.color} /></div>
              </Card>
              <div className="flex flex-col gap-3">
                <DominantCard theme={SECTION_THEME.interests} tag="Your dominant interests" title={profile.topInterests.slice(0, 2).join(' + ') || (profile.interests[0]?.label ?? '—')} body={`You are most drawn to ${(profile.topInterests.slice(0, 2).join(' and ') || profile.interests[0]?.label || 'these areas').toLowerCase()}. These themes shape the domains you’ll find most fulfilling.`} />
                <MindlerBars items={profile.interests.map((i) => ({ label: i.label, value: i.percent }))} color={SECTION_THEME.interests.color} />
              </div>
            </div>
            <InsightBanner color={SECTION_THEME.interests.color}>Your shape leans toward <b>{(profile.topInterests.slice(0, 2).join(' and ') || profile.interests[0]?.label || 'a few themes').toLowerCase()}</b>. Domains that blend these — like {domains[0]?.label.toLowerCase() ?? 'your top domain'} — will keep you genuinely engaged, while the smallest points on the shape are areas you can comfortably deprioritise.</InsightBanner>
            <div className="flex-1"><StrengthWeakness strengths={sectionById.interests?.strengths ?? []} weaknesses={sectionById.interests?.weaknesses ?? []} /></div>
          </div>
        </PageFrame>

        {/* ===== PAGE 6 — MOTIVATORS ===== */}
        <SectionPage page={6} kicker="Lens 3 · Motivators" name={profile.name} theme={SECTION_THEME.motivators}
          eyebrow="Career motivators & values" title="What drives your decisions" subtitle="The values that make work feel satisfying and keep you energised long-term."
          whatIs={SECTION_MEANING.motivators}
          dominantTag="Your top drivers" dominantTitle={profile.motivators.slice(0, 2).map((m) => m.label).join(' + ')}
          dominantBody={`You work best when a role offers ${profile.motivators.slice(0, 2).map((m) => m.label.toLowerCase()).join(' and ')}. Protect these and a career will feel meaningful; ${(profile.motivators.slice(-1)[0]?.label ?? 'others').toLowerCase()} matters less to you day-to-day.`}
          bars={profile.motivators.map((m) => ({ label: m.label, value: m.percent }))}
          insight={`When you weigh up options, score each one on ${profile.motivators.slice(0, 2).map((m) => m.label.toLowerCase()).join(' and ')} first — those are the conditions that will keep you engaged for years, not just months.`}
          footer={<StrengthWeakness strengths={sectionById.motivators?.strengths ?? []} weaknesses={sectionById.motivators?.weaknesses ?? []} />}
        />

        {/* ===== PAGE 7 — LEARNING ===== */}
        <SectionPage page={7} kicker="Lens 4 · Learning style" name={profile.name} theme={SECTION_THEME.learning}
          eyebrow="Learning style (VARK)" title="How you learn best" subtitle="The channels through which you absorb and remember new information most efficiently."
          whatIs={SECTION_MEANING.learning}
          dominantTag="Your dominant channel" dominantTitle={profile.dominantLearning}
          dominantBody={`Lead with ${profile.dominantLearning.toLowerCase()} methods, then reinforce with ${(profile.learning[1]?.label ?? 'your second channel').toLowerCase()}. Mixing your top two channels makes new material stick far faster than re-reading alone.`}
          bars={profile.learning.map((l) => ({ label: l.label, value: l.percent }))}
          insight={`Before your next exam, convert your notes into a ${profile.dominantLearning.toLowerCase().replace(' learning', '')} format — it matches how your brain encodes information, so you'll revise in less time.`}
          footer={<StrengthWeakness strengths={sectionById.learning?.strengths ?? []} weaknesses={sectionById.learning?.weaknesses ?? []} />}
        />

        {/* ===== PAGE 8 — SKILLS ===== */}
        <PageFrame page={8} kicker="Skills & abilities" name={profile.name}>
          <div className="flex h-full flex-col gap-4">
            <SectionHero theme={SECTION_THEME.analytical} eyebrow="Skills & abilities" title="Your natural ability profile" subtitle="A snapshot of the abilities you can build on and the ones worth strengthening." />
            <Card pad="p-4">
              <div className="flex items-center justify-between"><Eyebrow color={C.blue}>Overall skills score</Eyebrow><span className="text-[12px] font-bold" style={{ color: C.blue }}>{profile.overallSkills}% · {bandLabel(profile.overallSkills)}</span></div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full" style={{ background: C.faint }}><div className="h-full rounded-full" style={{ width: `${profile.overallSkills}%`, background: `linear-gradient(90deg, #9B51E0, ${C.blue})` }} /></div>
            </Card>
            <div className="grid flex-1 grid-cols-[0.86fr_1.14fr] gap-4">
              <Card pad="p-3" className="flex flex-col"><Eyebrow color={C.blue}>Your ability shape</Eyebrow><div className="mt-1 flex-1"><RadarChart axes={profile.skills.slice(0, 8).map((s) => ({ label: trimSkillLabel(s.label), value: s.percent }))} color={C.blue} size={206} /></div></Card>
              <Card pad="p-4"><Eyebrow color={C.blue}>Ability breakdown</Eyebrow><div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-4">{profile.skills.slice(0, 8).map((item, i) => <RingStat key={item.key} label={trimSkillLabel(item.label)} value={item.percent} color={SkillRingColors[i % SkillRingColors.length]} size={66} />)}</div></Card>
            </div>
            <InsightBanner color={C.blue}>Your ability shape is strongest on <b>{topCapabilities.slice(0, 2).map((s) => trimSkillLabel(s.label).toLowerCase()).join(' and ')}</b>. Build career options around these spikes — and treat the flatter edges ({profile.skills.slice(-2).map((s) => trimSkillLabel(s.label).toLowerCase()).join(', ')}) as optional growth areas, not blockers.</InsightBanner>
            <StrengthWeakness strengths={topCapabilities.slice(0, 3).map((s) => `${trimSkillLabel(s.label)} (${s.percent}%)`)} weaknesses={profile.skills.slice(-2).map((s) => `${trimSkillLabel(s.label)} needs deliberate practice`)} />
          </div>
        </PageFrame>

        {/* ===== PAGE 9 — INTELLIGENCES ===== */}
        <SectionPage page={9} kicker="Lens 5 · Intelligences" name={profile.name} theme={SECTION_THEME.intelligences}
          eyebrow="Multiple intelligences" title="Your natural strengths" subtitle="Gardner’s model of intelligence — where your mind works most naturally."
          whatIs={SECTION_MEANING.intelligences}
          dominantTag="Your dominant intelligence" dominantTitle={trimIntelligenceLabel(profile.dominantIntelligence ?? topIntelligences[0]?.label ?? '—')}
          dominantBody={`${trimIntelligenceLabel(profile.dominantIntelligence ?? topIntelligences[0]?.label ?? 'This intelligence')} is your most natural way of processing the world. Pair a weaker intelligence with a strong one to develop it faster.`}
          bars={topIntelligences.map((i) => ({ label: trimIntelligenceLabel(i.label), value: i.percent }))}
          insight={`Domains that reward ${trimIntelligenceLabel(profile.dominantIntelligence ?? topIntelligences[0]?.label ?? 'your dominant').toLowerCase()} thinking will feel effortless to you — gravitate toward fields where that intelligence is the main tool.`}
          footer={<StrengthWeakness strengths={sectionById.intelligences?.strengths ?? []} weaknesses={sectionById.intelligences?.weaknesses ?? []} />}
        />

        {/* ===== PAGE 10 — ANALYTICAL ===== */}
        <PageFrame page={10} kicker="Lens 6 · Analytical reasoning" name={profile.name}>
          <div className="flex h-full flex-col gap-4">
            <SectionHero theme={SECTION_THEME.analytical} eyebrow="Analytical & logical thinking" title="How you reason" subtitle="Measured accuracy across numerical, logical, verbal and spatial reasoning tasks." />
            <p className="text-[12px] leading-5" style={{ color: C.body }}><b style={{ color: C.ink }}>What this measures: </b>{SECTION_MEANING.analytical}</p>
            <Card pad="p-4">
              <div className="flex items-center justify-between"><Eyebrow color={SECTION_THEME.analytical.color}>Correct-answer evidence</Eyebrow>{profile.analyticalScore?.total ? <span className="text-[11px] font-semibold" style={{ color: C.muted }}>{profile.analyticalScore.correct}/{profile.analyticalScore.total} correct overall</span> : null}</div>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {analytical.map((item) => (
                  <div key={item.key} className="rounded-xl border p-3" style={{ borderColor: C.line, background: C.faint }}>
                    <p className="text-[11px] font-semibold" style={{ color: C.muted }}>{item.label}</p>
                    <p className="mt-2 text-[22px] font-extrabold" style={{ color: SECTION_THEME.analytical.color }}>{item.percent}%</p>
                    <p className="text-[11px]" style={{ color: C.muted }}>{item.correct}/{item.total} correct</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white" style={{ border: `1px solid ${C.line}` }}><div className="h-full rounded-full" style={{ width: `${Math.max(4, item.percent)}%`, background: SECTION_THEME.analytical.color }} /></div>
                  </div>
                ))}
              </div>
            </Card>
            <div className="flex-1"><StrengthWeakness strengths={sectionById.analytical?.strengths ?? []} weaknesses={sectionById.analytical?.weaknesses ?? []} /></div>
          </div>
        </PageFrame>

        {/* ===== PAGE 11 — EQ ===== */}
        <SectionPage page={11} kicker="Emotional intelligence" name={profile.name} theme={SECTION_THEME.eq}
          eyebrow="Emotional quotient (EQ)" title="How you handle emotions" subtitle="How well you recognise, manage and use emotions — your own and other people’s."
          whatIs={SECTION_MEANING.eq}
          dominantTag="Your strongest EQ area" dominantTitle={[...profile.eq].sort((a, b) => b.percent - a.percent)[0]?.label ?? '—'}
          dominantBody={`Overall EQ is ${bandLabel(eqAverage).toLowerCase()} (${eqAverage}%). Your strongest component is ${([...profile.eq].sort((a, b) => b.percent - a.percent)[0]?.label ?? '').toLowerCase()} — a real asset in teamwork and people-facing work.`}
          bars={profile.eq.map((e) => ({ label: e.label, value: e.percent }))}
          insight={`Your ${([...profile.eq].sort((a, b) => b.percent - a.percent)[0]?.label ?? 'strongest area').toLowerCase()} is a standout — it will help you the most in group projects, leadership and any field that depends on reading people well.`}
          footer={<div className="grid grid-cols-2 gap-3"><div className="rounded-xl border p-3.5" style={{ borderColor: C.line, background: SECTION_THEME.eq.soft }}><Eyebrow color={SECTION_THEME.eq.color}>Why EQ matters</Eyebrow><p className="mt-1.5 text-[12px] leading-5" style={{ color: C.body }}>Emotional intelligence shapes teamwork, leadership and resilience as much as raw ability — often the deciding factor in long-term success.</p></div><div className="flex items-center justify-center rounded-xl border p-3.5" style={{ borderColor: C.line }}><Donut value={eqAverage} size={104} color={SECTION_THEME.eq.color} caption="EQ" /></div></div>}
        />

        {/* ===== PAGE 12 — TOP 5 DOMAINS ===== */}
        <PageFrame page={12} kicker="Your recommended domains" name={profile.name}>
          <div className="flex h-full flex-col gap-3">
            <div className="flex items-end justify-between gap-6"><div><Eyebrow color={C.blue}>Top 5 career fitment domains</Eyebrow><h2 className="mt-1 text-[24px] font-extrabold" style={{ color: C.ink }}>Where you fit best</h2><p className="mt-1 text-[12px] leading-5" style={{ color: C.body }}>Built by reading all your answers across the six lenses together — broad fields to explore, never a single fixed job.</p></div><span className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold" style={{ borderColor: C.line, color: C.body, background: C.faint }}>Domains, not roles</span></div>
            <div className="flex flex-1 flex-col gap-2.5">
              {domains.map((domain, index) => {
                const accent = [C.blue, '#2D9CDB', '#27AE60', '#9B51E0', '#F2994A'][index] ?? C.blue;
                const ev = domainEvidence(domain, profile);
                return (
                  <div key={domain.key} className="flex flex-1 items-center gap-4 rounded-2xl border p-3.5" style={{ borderColor: C.line, borderLeft: `5px solid ${accent}` }}>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${accent}14` }}><DomainArt domainKey={domain.key} size={40} /></div>
                    <div className="w-[34%] shrink-0">
                      <div className="flex items-center gap-2"><span className="text-[11px] font-extrabold" style={{ color: accent }}>#{index + 1}</span><h3 className="text-[15px] font-bold leading-tight" style={{ color: C.ink }}>{domain.label}</h3></div>
                      <p className="mt-1 text-[10.5px] leading-4" style={{ color: C.muted }}>{domain.focus}</p>
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      {ev.map((b) => (
                        <div key={b.label} className="flex items-center gap-2">
                          <span className="w-[78px] shrink-0 text-[9.5px] font-medium" style={{ color: C.muted }}>{b.label}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: C.faint }}><div className="h-full rounded-full" style={{ width: `${Math.max(4, b.value)}%`, background: accent }} /></div>
                        </div>
                      ))}
                    </div>
                    <div className="shrink-0 text-center"><p className="text-[24px] font-extrabold leading-none" style={{ color: accent }}>{domain.score}</p><p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: C.muted }}>fit</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        </PageFrame>

        {/* ===== PAGE 13 — CAREER MATCH + CLUSTERS ===== */}
        <PageFrame page={13} kicker="Your #1 domain match" name={profile.name}>
          <div className="flex h-full flex-col gap-3.5">
            <SectionHero theme={SECTION_THEME.clusters} eyebrow="Your #1 career domain" title={topDomain?.label ?? 'Your top domain'} subtitle="How strongly your full profile aligns with this domain — and why." />
            <div className="grid grid-cols-[1.1fr_0.9fr] gap-4">
              <Card pad="p-4">
                <div className="mb-2 h-[88px] w-full overflow-hidden rounded-xl" style={{ background: C.faint }}><CareerIllo /></div>
                <Eyebrow color={C.blue}>About this domain</Eyebrow>
                <p className="mt-2 text-[12px] leading-5" style={{ color: C.body }}>{topDomain?.focus}</p>
                <p className="mt-2 text-[11.5px] leading-5" style={{ color: C.muted }}>{topDomain?.rationale}</p>
              </Card>
              <Card pad="p-4" className="flex flex-col">
                <div className="flex items-center justify-between"><Eyebrow color={C.blue}>Your match</Eyebrow><span className="rounded-lg px-3 py-1 text-[14px] font-extrabold" style={{ background: '#E8F1FE', color: C.blue }}>{topDomain?.score}%</span></div>
                <div className="mt-3 flex-1"><MindlerBars items={matchBars} color={C.blue} /></div>
              </Card>
            </div>
            <Card pad="p-4" className="flex-1">
              <Eyebrow color={C.blue}>Career cluster alignment</Eyebrow>
              <div className="mt-2.5"><MindlerBars items={clusters.map((c) => ({ label: c.label, value: c.percent }))} color={C.blue} /></div>
            </Card>
          </div>
        </PageFrame>

        {/* ===== PAGE 14 — DOMINANT SUMMARY (icon tiles) ===== */}
        <PageFrame page={14} kicker="Your profile at a glance" name={profile.name}>
          <div className="flex h-full flex-col gap-4">
            <div><Eyebrow color={C.blue}>Snapshot</Eyebrow><h2 className="mt-1 text-[24px] font-extrabold" style={{ color: C.ink }}>Your dominant profile</h2><p className="mt-1.5 text-[12.5px] leading-5" style={{ color: C.body }}>The strongest signal from each lens, at a glance.</p></div>
            {[
              { tag: 'Your dominant personality', theme: SECTION_THEME.personality, items: profile.mbtiAxes.map((a) => a.dominant).slice(0, 4) },
              { tag: 'Your dominant interests', theme: SECTION_THEME.interests, items: profile.interests.slice(0, 4).map((i) => i.label) },
              { tag: 'Your dominant intelligences', theme: SECTION_THEME.intelligences, items: topIntelligences.slice(0, 4).map((i) => trimIntelligenceLabel(i.label)) },
              { tag: 'Your dominant skills', theme: SECTION_THEME.analytical, items: topCapabilities.slice(0, 4).map((s) => trimSkillLabel(s.label)) },
              { tag: 'Your dominant motivators', theme: SECTION_THEME.motivators, items: profile.motivators.slice(0, 4).map((m) => m.label) },
              { tag: 'Your dominant EQ', theme: SECTION_THEME.eq, items: [...profile.eq].sort((a, b) => b.percent - a.percent).slice(0, 4).map((e) => e.label) },
            ].map((row) => (
              <div key={row.tag}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: row.theme.deep }}>{row.tag}</p>
                <div className="flex flex-wrap gap-5">{row.items.map((label) => <FlatTile key={label} icon={glyphFor(label)} label={label} color={row.theme.color} />)}</div>
              </div>
            ))}
          </div>
        </PageFrame>

        {/* ===== PAGE 15 — SUBJECTS + NEXT STEPS ===== */}
        <PageFrame page={15} kicker="Subjects & next steps" name={profile.name}>
          <div className="flex h-full flex-col gap-3.5">
            <SectionHero theme={SECTION_THEME.clusters} eyebrow="Your action plan" title="Subjects & next steps" subtitle="Where to focus academically, and what to do next to act on this report." />

            <div className="grid grid-cols-5 gap-2.5">
              {domains.map((domain, index) => {
                const accent = [C.blue, '#2D9CDB', '#27AE60', '#9B51E0', '#F2994A'][index] ?? C.blue;
                return (
                  <div key={domain.key} className="flex flex-col items-center rounded-xl border p-2.5 text-center" style={{ borderColor: C.line }}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${accent}14` }}><DomainArt domainKey={domain.key} size={28} /></div>
                    <p className="mt-1.5 text-[9.5px] font-bold leading-tight" style={{ color: C.ink }}>{domain.label}</p>
                  </div>
                );
              })}
            </div>

            <div><Eyebrow color={C.blue}>Suggested streams & subjects</Eyebrow></div>
            <div className="grid grid-cols-2 gap-3">
              {streamDomains.map(({ domain, stream }) => stream && (
                <div key={domain.key} className="rounded-xl border p-3.5" style={{ borderColor: C.line, borderLeft: `4px solid ${C.blue}` }}>
                  <p className="text-[12px] font-bold" style={{ color: C.ink }}>{domain.label} <span className="font-semibold" style={{ color: C.blue }}>· {stream.stream}</span></p>
                  <div className="mt-2 flex flex-wrap gap-1.5">{stream.mandatory.map((m) => <span key={m} className="rounded-md px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: C.navy }}>{m}</span>)}{stream.optional.map((m) => <span key={m} className="rounded-md border px-2 py-0.5 text-[10px] font-semibold" style={{ borderColor: C.line, color: C.body }}>{m}</span>)}</div>
                </div>
              ))}
            </div>

            <div className="grid flex-1 grid-cols-2 gap-3">
              <Card pad="p-4"><div className="flex items-center gap-2"><Lightbulb className="h-4 w-4" style={{ color: C.yellow }} /><Eyebrow>Development priorities</Eyebrow></div><div className="mt-2"><Bullet items={priorities.slice(0, 3)} color={C.blue} /></div></Card>
              <Card pad="p-4"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4" style={{ color: C.green }} /><Eyebrow>Immediate next moves</Eyebrow></div><div className="mt-2"><Bullet items={[priorities[3], `Lean into your strongest lens: ${strongestSection?.title.toLowerCase() ?? 'profile strength'}.`, `Use your #1 domain for deeper counselling and subject planning.`]} color={C.green} /></div></Card>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.navy})` }}>
              <div><p className="text-[14px] font-bold">Ready for your roadmap?</p><p className="text-[11.5px] text-white/85">Book a 1-on-1 counselling session to turn this report into a step-by-step plan.</p></div>
              <span className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold" style={{ background: C.yellow, color: C.navy }}>Schedule a session <ArrowRight className="h-4 w-4" /></span>
            </div>
          </div>
        </PageFrame>
      </div>
    </div>
  );
}
