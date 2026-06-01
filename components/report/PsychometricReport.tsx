'use client';

/**
 * 30-page career report. Each <Page> is a fixed A4 sheet, so printing / saving
 * to PDF yields EXACTLY 30 pages. Every value comes from the student's answers
 * via the profile produced by lib/assessment-engine.ts.
 */

import Link from 'next/link';
import { Printer, Phone, Mail, LayoutDashboard } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import type { PsychometricProfile, Bar } from '@/lib/psychometric';
import { MBTI_DESC } from '@/lib/psychometric';
import { CAREER_LIBRARY } from '@/constants/catalog';
import { getCareerDetail, buildSalary } from '@/constants/career-details';

const RED = '#E0242E';
const TOTAL_PAGES = 30;

/* Multi-colour palette for bar charts (cycles like the reference report). */
const PALETTE = ['#2FA37C', '#3F6CA6', '#E8821E', '#7E57A4', '#1C8EA8', '#6F8C4A', '#C0473B', '#4FA3A0'];
function barColor(i: number) { return PALETTE[i % PALETTE.length]; }

/* Donut / gauge colour by score band: green→blue→orange→red. */
function levelColor(percent: number) {
  if (percent >= 80) return '#1F9D57';
  if (percent >= 60) return '#1D4ED8';
  if (percent >= 40) return '#E8821E';
  return RED;
}

/* Personality dimension accent colours. */
const AXIS_COLORS: Record<string, string> = { EI: '#2E9BC4', SN: '#F2B705', TF: '#3CA56B', JP: '#8A5FB0' };

/* ----------------------------- small helpers ----------------------------- */

function normalizeTitle(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function resolveCareerTitle(preferred: string | undefined, fallback: string) {
  const options = CAREER_LIBRARY.map((c) => c.title);
  const target = preferred?.trim();
  if (target) {
    const exact = options.find((title) => normalizeTitle(title) === normalizeTitle(target));
    if (exact) return exact;
    const partial = options.find((title) => {
      const a = normalizeTitle(title);
      const b = normalizeTitle(target);
      return a.includes(b) || b.includes(a);
    });
    if (partial) return partial;
  }
  return fallback;
}
function toLakhs(amount: number) {
  return `Rs ${ (amount / 100000).toFixed(amount >= 1000000 ? 0 : 1) }L`;
}

const VERDICT_STYLE: Record<string, string> = {
  'Top Choice': 'text-red bg-red-soft',
  'Good Choice': 'text-success bg-green-50',
  Optional: 'text-ink-3 bg-line-2',
  Develop: 'text-warning bg-yellow-50',
  Avoid: 'text-ink-4 bg-line-2',
};
const LEVEL_STYLE: Record<string, string> = {
  High: 'text-success bg-green-50',
  Medium: 'text-warning bg-yellow-50',
  Low: 'text-ink-4 bg-line-2',
};

const STAGE_BY_LABEL: Record<string, { stage: string; note: string }> = {
  'Future-Ready': { stage: 'Future-Ready', note: 'You have strong clarity and are ready to execute your plan.' },
  Clarity: { stage: 'Clarity', note: 'You have good direction; refine and commit to a path.' },
  Exploring: { stage: 'Exploring', note: 'You are exploring options - gather information and narrow down.' },
  'Getting Started': { stage: 'Confused', note: 'You are early in planning - explore strengths and options.' },
};

const CLUSTER_DESC: Record<string, string[]> = {
  'Information Technology': ['Build, test and maintain software, data and AI systems.', 'High demand across every industry with strong pay growth.'],
  'Health Science': ['Diagnose, treat and care for patients, or support medical research.', 'Stable, respected and impactful work.'],
  'Science & Research': ['Investigate, experiment and discover across scientific fields.', 'Ideal for the curious and analytical.'],
  'Engineering & Technology': ['Design and build machines, structures and systems.', 'Hands-on problem solving with real-world impact.'],
  'Accounts & Finance': ['Manage money, audit, taxation and investments.', 'Numbers, accuracy and structured work.'],
  'Government & Legal': ['Public administration, policy, law and justice.', 'Service, stability and authority.'],
  'Business Management': ['Lead teams, run operations and grow organisations.', 'Leadership, strategy and people skills.'],
  'Arts & Media': ['Create design, content, film and visual experiences.', 'Imagination meets craft.'],
  'Education & Training': ['Teach, mentor and develop people.', 'Communication and subject mastery.'],
  'Human Service': ['Support wellbeing, counselling and community.', 'Empathy and people skills.'],
  'Marketing & Advertising': ['Brand, growth, sales and communication.', 'Creativity with analytics.'],
  'Media & Communication': ['Journalism, storytelling and digital media.', 'Words, research and reach.'],
};
function clusterDesc(label: string) {
  return CLUSTER_DESC[label] ?? ['A field aligned with your strongest interests and skills.', 'Explore the day-to-day roles before deciding.'];
}

/* subject streams derived from interests + skills */
function streamMatch(p: PsychometricProfile) {
  const r = Object.fromEntries(p.interests.map((b) => [b.label, b.percent])) as Record<string, number>;
  const sk = Object.fromEntries(p.skills.map((b) => [b.label, b.percent])) as Record<string, number>;
  const inv = r['Investigative'] ?? 0;
  const art = r['Artistic'] ?? 0;
  const soc = r['Social'] ?? 0;
  const ent = r['Enterprising'] ?? 0;
  const con = r['Conventional'] ?? 0;
  const num = sk['Numerical Ability'] ?? 0;
  const log = sk['Logical Ability'] ?? 0;
  const verb = sk['Verbal Ability'] ?? 0;
  const clp = (n: number) => Math.max(20, Math.min(98, Math.round(n)));
  return [
    {
      name: 'Science - Maths',
      icon: '📐',
      percent: clp(inv * 0.5 + num * 0.3 + log * 0.2),
      mandatory: ['Maths', 'Physics', 'Chemistry'],
      optional: ['Computer Science', 'Biology', 'Engineering Drawing', 'Economics'],
    },
    {
      name: 'Science - Bio',
      icon: '🧬',
      percent: clp(inv * 0.45 + soc * 0.25 + (sk['Social & Co-operation Skills'] ?? 0) * 0.3),
      mandatory: ['Biology', 'Physics', 'Chemistry'],
      optional: ['Computer Science', 'Maths', 'Psychology', 'Agriculture'],
    },
    {
      name: 'Commerce',
      icon: '💼',
      percent: clp(con * 0.5 + ent * 0.3 + num * 0.2),
      mandatory: ['Accountancy', 'Economics', 'Business Studies'],
      optional: ['Business Maths', 'Computer Science', 'Legal Studies', 'Entrepreneurship'],
    },
    {
      name: 'Humanities',
      icon: '📚',
      percent: clp(art * 0.4 + soc * 0.4 + verb * 0.2),
      mandatory: ['Language Arts', 'History', 'Political Science'],
      optional: ['Psychology', 'Economics', 'Legal Studies', 'Fine Arts'],
    },
  ].sort((a, b) => b.percent - a.percent);
}

/* ----------------------------- UI atoms ----------------------------- */

/* Axis-scaled horizontal bar chart with light gridlines + multi-colour bars,
 * matching the reference report's interest/motivator/cluster charts. */
function ChartCard({
  data, colorMode = 'palette', labelWidth = 130,
}: {
  data: { key: string; label: string; percent: number }[];
  colorMode?: 'palette' | 'level';
  labelWidth?: number;
}) {
  const ticks = [0, 20, 40, 60, 80, 100];
  const gridStyle = {
    backgroundImage: 'repeating-linear-gradient(to right, #ECECEF 0, #ECECEF 1px, transparent 1px, transparent 20%)',
  } as React.CSSProperties;
  return (
    <div className="rounded-xl border border-line p-4 bg-white">
      <div className="space-y-2">
        {data.map((b, i) => {
          const color = colorMode === 'level' ? levelColor(b.percent) : barColor(i);
          return (
            <div key={b.key} className="flex items-center gap-3">
              <span className="shrink-0 text-[11px] text-ink-2 text-right leading-tight" style={{ width: labelWidth }}>{b.label}</span>
              <div className="flex-1 relative h-4 rounded-sm" style={gridStyle}>
                <div className="absolute inset-y-0 left-0 rounded-r-[3px] flex items-center justify-end pr-1.5"
                  style={{ width: `${Math.max(2, b.percent)}%`, background: color }}>
                  {b.percent >= 18 && <span className="text-[9px] font-bold text-white">{b.percent}%</span>}
                </div>
                {b.percent < 18 && (
                  <span className="absolute top-1/2 -translate-y-1/2 text-[9px] font-bold"
                    style={{ left: `calc(${Math.max(2, b.percent)}% + 4px)`, color }}>{b.percent}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* axis */}
      <div className="flex mt-1" style={{ paddingLeft: labelWidth + 12 }}>
        <div className="flex-1 flex justify-between text-[8.5px] text-ink-4">
          {ticks.map((t) => <span key={t}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}

/* Thin gauge used inside the career-path table. */
function Gauge({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="h-2 rounded-full bg-line-2 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${Math.max(4, percent)}%`, background: color }} />
    </div>
  );
}

/* Personality slider: two-tone track + knob at the preference boundary. */
function MbtiSlider({ axis, left, right, leftPct, rightPct, dominant }: {
  axis: string; left: string; right: string; leftPct: number; rightPct: number; dominant: string;
}) {
  const color = AXIS_COLORS[axis] ?? RED;
  const dominantOnLeft = dominant === left;
  const dominantPct = Math.max(leftPct, rightPct);
  return (
    <div>
      <p className="text-center text-[12px] font-bold mb-1" style={{ color }}>{dominantPct}% {dominant}</p>
      <div className="flex items-center gap-3">
        <span className={`w-24 text-right text-[12px] ${dominantOnLeft ? 'font-bold text-ink' : 'text-ink-3'}`}>{left}</span>
        <div className="flex-1 relative h-3 rounded-full overflow-hidden flex" style={{ background: `${color}26` }}>
          <div className="h-full" style={{ width: `${leftPct}%`, background: dominantOnLeft ? color : `${color}55` }} />
          <div className="h-full" style={{ width: `${rightPct}%`, background: dominantOnLeft ? `${color}55` : color }} />
        </div>
        <span className={`w-24 text-[12px] ${!dominantOnLeft ? 'font-bold text-ink' : 'text-ink-3'}`}>{right}</span>
      </div>
    </div>
  );
}

function Donut({ percent, label }: { percent: number; label: string }) {
  const color = levelColor(percent);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <div className="w-20 h-20 rounded-full" style={{ background: `conic-gradient(${color} ${percent * 3.6}deg, #E9E9EC 0deg)` }} />
        <div className="absolute inset-[9px] bg-white rounded-full flex items-center justify-center text-sm font-extrabold" style={{ color }}>{percent}%</div>
      </div>
      <p className="text-[11px] font-bold text-ink-2 mt-1 text-center leading-tight">{label}</p>
    </div>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[17px] font-extrabold text-red border-b border-red-line pb-2 mb-4">{children}</h2>;
}
function Bullets({ items, mark = '•' }: { items: string[]; mark?: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => <li key={i} className="text-[12.5px] text-ink-2 flex gap-2"><span className="text-red">{mark}</span>{t}</li>)}
    </ul>
  );
}

function Page({ n, name, children }: { n: number; name: string; children: React.ReactNode }) {
  return (
    <section
      className="a4-page bg-white shadow-md mx-auto relative flex flex-col"
      style={{ width: '210mm', height: '297mm', breakBefore: n > 1 ? 'page' : 'auto', overflow: 'hidden' }}
    >
      {/* header */}
      <div className="flex items-center justify-between px-10 pt-6 pb-2 border-b border-line">
        <span className="text-[11px] font-bold uppercase tracking-wide text-ink-2">{name}</span>
        <span className="text-[10px] font-semibold text-red uppercase tracking-wide">Career Suitability Report</span>
        <Logo size={22} />
      </div>
      {/* body */}
      <div className="flex-1 px-10 py-6 overflow-hidden">{children}</div>
      {/* footer */}
      <div className="flex items-center justify-between px-10 py-3 border-t border-line text-[10px] text-ink-4">
        <span>📞 8977760443 · support@onegrasp.com</span>
        <span>Page {n} of {TOTAL_PAGES}</span>
      </div>
    </section>
  );
}

/* ----------------------------- the document ----------------------------- */

export default function PsychometricReport({ profile }: { profile: PsychometricProfile }) {
  const p = profile;
  const generated = new Date(p.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const ints = p.intelligences ?? [];
  const conf = p.confidence ?? { percent: 100, answered: 0, total: 0, label: 'High reliability' };
  const stage = STAGE_BY_LABEL[p.matchLabel] ?? STAGE_BY_LABEL.Exploring;
  const streams = streamMatch(p);
  const hasRecommendations = (p.topCareers?.length ?? 0) > 0 && (conf.answered ?? 0) > 0;

  const chosenTitle = hasRecommendations ? resolveCareerTitle(p.careerFocus, p.careerFocus) : '';
  const chosenCareer = hasRecommendations ? (CAREER_LIBRARY.find((c) => c.title === chosenTitle) ?? CAREER_LIBRARY[0]) : null;
  const detail = hasRecommendations ? getCareerDetail(chosenTitle) : null;
  const salary = hasRecommendations ? buildSalary(detail!.salaryBase) : [];
  const maxSalary = Math.max(...salary.map((s) => s.amount), 1);

  // personality dimensions content
  const DIMS = [
    { axis: 'EI', title: 'Where you focus your energy & attention' },
    { axis: 'SN', title: 'How you take in information' },
    { axis: 'TF', title: 'How you make decisions' },
    { axis: 'JP', title: 'How you deal with the outer world' },
  ] as const;
  const axisLetter = (axis: string) => {
    const a = p.mbtiAxes.find((x) => x.axis === axis)!;
    switch (axis) {
      case 'EI': return a.dominant === 'Extrovert' ? 'E' : 'I';
      case 'SN': return a.dominant === 'Sensing' ? 'S' : 'N';
      case 'TF': return a.dominant === 'Thinking' ? 'T' : 'F';
      default: return a.dominant === 'Judging' ? 'J' : 'P';
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <style>{`
        @page {
          size: A4;
          margin: 10mm;
        }
        body {
          background: #f6f3f0;
        }
        .a4-page {
          margin-bottom: 12px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @media print {
          body {
            background: white;
          }
          .report-topbar,
          .report-toolbar {
            display: none !important;
          }
          .a4-page {
            margin: 0 auto !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <header className="report-topbar bg-white border-b border-line sticky top-0 z-40">
        <div className="max-w-[230mm] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/dashboard"><Logo size={30} /></Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-line text-ink-2 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-bg transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-red text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Save as PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[230mm] mx-auto px-4 sm:px-6 py-6 space-y-3">
        {/* ---------- PAGE 1 - COVER ---------- */}
        <Page n={1} name={p.name}>
          <div className="bg-red text-white rounded-2xl px-8 py-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="bg-white rounded-md px-2 py-1"><Logo size={26} /></div>
              <span className="text-white/90 text-sm">onegrasp.com</span>
            </div>
            <div className="mt-10 grid grid-cols-[1.1fr_0.9fr] gap-8">
              <div>
                <p className="text-white/70 text-[11px] uppercase tracking-[0.25em] mb-2">Report prepared for</p>
                <h1 className="text-4xl font-extrabold leading-tight mb-3">{p.name}</h1>
                <div className="inline-flex bg-white text-red px-4 py-2 rounded-lg text-sm font-bold mb-5">
                  Career Suitability Report
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-white/70 text-[10px] uppercase tracking-wide">Personality Type</p>
                    <p className="font-bold">{p.mbtiType} · {p.mbtiAxes.map((a) => a.dominant).join(' · ')}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-[10px] uppercase tracking-wide">Top Interests</p>
                    <p className="font-bold">{p.topInterests.slice(0, 3).join(' · ') || 'Career exploration in progress'}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-[10px] uppercase tracking-wide">Career Focus</p>
                    <p className="font-bold">{p.favoritePath ?? p.dreamCareer ?? p.careerFocus}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
                <p className="text-white/90 font-bold text-sm border-b border-white/15 pb-2 mb-4">Assessment summary</p>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-white/70 text-[10px] uppercase tracking-wide">Readiness</p>
                    <p className="font-bold">{p.overallScore}/100 - {p.matchLabel}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-[10px] uppercase tracking-wide">Reliability</p>
                    <p className="font-bold">{conf.percent}% - {conf.label}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-[10px] uppercase tracking-wide">Generated</p>
                    <p className="font-bold">{generated}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-[10px] uppercase tracking-wide">Top Recommendation</p>
                    <p className="font-bold">{hasRecommendations ? p.topCareers[0]?.title : 'Complete the assessment to unlock this'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {hasRecommendations ? (
            <div className="rounded-2xl bg-red-soft border border-red-line p-5">
              <p className="text-[13px] font-bold text-ink mb-1">Top recommendation: {p.topCareers[0]?.title}</p>
              <p className="text-[12px] text-ink-2">
                {p.name}, your profile aligns most strongly with <b>{p.topCareers[0]?.title}</b> ({p.topCareers[0]?.match}% match)
                {p.topCareers[1] ? `, with ${p.topCareers[1].title} and ${p.topCareers[2]?.title} as strong alternatives.` : '.'}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-5 text-[12.5px] text-ink-2 leading-relaxed">
              Complete the assessment to unlock your strongest-fit career recommendations and detailed pathway analysis.
            </div>
          )}
        </Page>

        {/* ---------- PAGE 2 - SUMMARY ---------- */}
        <Page n={2} name={p.name}>
          <H>Your assessment summary</H>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="rounded-xl border border-line p-4">
              <p className="text-[11px] uppercase tracking-wide text-ink-4 mb-1">Readiness stage</p>
              <p className="text-[18px] font-extrabold text-red">{stage.stage}</p>
              <p className="text-[12px] text-ink-3 mt-1">{stage.note}</p>
            </div>
            <div className="rounded-xl border border-line p-4">
              <p className="text-[11px] uppercase tracking-wide text-ink-4 mb-1">Reliability</p>
              <p className="text-[18px] font-extrabold text-ink">{conf.percent}%</p>
              <p className="text-[12px] text-ink-3 mt-1">{conf.answered}/{conf.total} answers captured - {conf.label}</p>
            </div>
            <div className="rounded-xl border border-line p-4">
              <p className="text-[11px] uppercase tracking-wide text-ink-4 mb-1">Dominant learning style</p>
              <p className="text-[16px] font-extrabold text-ink">{p.dominantLearning}</p>
              <p className="text-[12px] text-ink-3 mt-1">Study methods should match how you absorb and retain information best.</p>
            </div>
            <div className="rounded-xl border border-line p-4">
              <p className="text-[11px] uppercase tracking-wide text-ink-4 mb-1">Top cluster</p>
              <p className="text-[16px] font-extrabold text-ink">{p.clusters[0]?.label ?? 'Career exploration in progress'}</p>
              <p className="text-[12px] text-ink-3 mt-1">This cluster is currently the strongest match for your profile.</p>
            </div>
          </div>
          <p className="text-[12.5px] text-ink-2 mb-5 leading-relaxed">
            Use it to choose subjects, narrow down careers and build an execution plan with confidence.
          </p>
          <H>What we measured</H>
          <div className="grid grid-cols-2 gap-3">
            {(p.sectionMeta ?? []).map((s, i) => (
              <div key={s.id} className="rounded-xl border border-line p-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-red text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                <div>
                  <p className="text-[13px] font-bold text-ink">{s.title}</p>
                  <p className="text-[11px] text-ink-4">{s.answered}/{s.total} answered</p>
                </div>
              </div>
            ))}
          </div>
          {p.analyticalScore && (
            <p className="mt-5 text-[12px] text-ink-3">
              Analytical &amp; logical aptitude score: <b className="text-ink">{p.analyticalScore.correct}/{p.analyticalScore.total}</b> correct.
            </p>
          )}
        </Page>

        {/* ---------- PAGE 3 - PROFILING ---------- */}
        <Page n={3} name={p.name}>
          <H>Your profiling - current stage</H>
          <p className="text-[12.5px] text-ink-2 mb-5 leading-relaxed">
            Profiling shows where you are in your career-planning journey. Based on your readiness score of
            <b className="text-ink"> {p.overallScore}/100</b>, you are at the <b className="text-red">{stage.stage}</b> stage.
          </p>
          <div className="flex items-center justify-between mb-6">
            {['Unaware', 'Confused', 'Exploring', 'Clarity', 'Future-Ready'].map((st) => {
              const active = st === stage.stage;
              return (
                <div key={st} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-red text-white' : 'bg-line-2 text-ink-4'}`}>{st[0]}</div>
                  <p className={`text-[11px] mt-1 ${active ? 'font-bold text-red' : 'text-ink-4'}`}>{st}</p>
                </div>
              );
            })}
          </div>
          <div className="rounded-xl bg-bg border border-line p-5 space-y-3">
            <p className="text-[12.5px] text-ink-2"><b className="text-ink">{stage.stage}:</b> {stage.note}</p>
            <p className="text-[12.5px] text-ink-2"><b className="text-ink">Risks involved:</b> Wrong selection of a career path, career dissatisfaction, and mismatch with your interests.</p>
            <p className="text-[12.5px] text-ink-2"><b className="text-ink">Action plan:</b> Explore strengths &amp; weaknesses - Explore career options - Gather information - Match the most suitable option - Early execution.</p>
          </div>
        </Page>

        {/* ---------- PAGE 4 - PERSONALITY CHART ---------- */}
        <Page n={4} name={p.name}>
          <H>Result of the career personality</H>
          <div className="text-center mb-6">
            <span className="text-5xl font-extrabold text-ink tracking-widest">{p.mbtiType}</span>
            <p className="text-sm text-ink-3 mt-2">{p.mbtiAxes.map((a) => a.dominant).join(' · ')}</p>
          </div>
          <div className="space-y-5">
            {p.mbtiAxes.map((a) => (
              <MbtiSlider key={a.axis} axis={a.axis} left={a.left} right={a.right}
                leftPct={a.leftPct} rightPct={a.rightPct} dominant={a.dominant} />
            ))}
          </div>
          <p className="mt-6 text-[12px] text-ink-3 leading-relaxed">
            Your four-letter type is the combination of your strongest preference on each dimension. The next four pages
            explain what each preference means for your studies and career.
          </p>
        </Page>

        {/* ---------- PAGES 5-8 - PERSONALITY DIMENSIONS ---------- */}
        {DIMS.map((dim, idx) => {
          const a = p.mbtiAxes.find((x) => x.axis === dim.axis)!;
          const letter = axisLetter(dim.axis);
          const bullets = MBTI_DESC[letter] ?? [];
          return (
            <Page key={dim.axis} n={5 + idx} name={p.name}>
              <H>Your career personality analysis</H>
              <div className="flex items-start gap-5">
                <div className="w-24 shrink-0 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-red text-white flex items-center justify-center text-4xl font-extrabold mx-auto">{letter}</div>
                  <p className="text-[12px] font-bold text-ink mt-2">{a.dominant}</p>
                  <p className="text-[18px] font-extrabold text-red">{Math.max(a.leftPct, a.rightPct)}%</p>
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-ink mb-3">{dim.title}</p>
                  <Bullets items={[...bullets, ...(EXTRA_PERSONALITY[letter] ?? [])]} />
                </div>
              </div>
              {idx === 3 && (
                <div className="mt-6">
                  <p className="text-[13px] font-bold text-ink mb-2">Your key strengths</p>
                  <div className="grid grid-cols-2 gap-2">
                    {p.strengths.map((s, i) => (
                      <div key={i} className="rounded-lg border border-line px-3 py-2 text-[12px] text-ink-2">✓ {s}</div>
                    ))}
                  </div>
                </div>
              )}
            </Page>
          );
        })}

        {/* ---------- PAGE 9 - INTERESTS CHART ---------- */}
        <Page n={9} name={p.name}>
          <H>Your career interest types</H>
          <p className="text-[12.5px] text-ink-3 mb-4">The Career Interest Assessment measures six interest patterns (RIASEC). Your strongest themes shape your best-fit careers.</p>
          <ChartCard data={p.interests} />
          <div className="mt-6 grid grid-cols-3 gap-3">
            {p.interests.slice(0, 3).map((b, i) => (
              <div key={b.key} className="rounded-xl border border-line p-3 text-center">
                <div className="w-8 h-8 mx-auto rounded-full bg-red text-white text-xs font-bold flex items-center justify-center mb-1">{i + 1}</div>
                <p className="text-[12px] font-bold text-ink">{b.label}</p>
                <p className="text-[12px] text-red font-bold">{b.percent}%</p>
              </div>
            ))}
          </div>
        </Page>

        {/* ---------- PAGE 10 - INTEREST ANALYSIS ---------- */}
        <Page n={10} name={p.name}>
          <H>Your career interest analysis</H>
          {p.interests.slice(0, 3).map((b) => (
            <div key={b.key} className="mb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-7 h-7 rounded-lg bg-red text-white text-sm font-extrabold flex items-center justify-center">{b.label[0]}</span>
                <p className="text-[13px] font-bold text-ink">{b.label} - {b.percent}%</p>
              </div>
              <Bullets items={INTEREST_DESC[b.label] ?? ['A strong interest area worth exploring through projects and electives.']} />
            </div>
          ))}
        </Page>

        {/* ---------- PAGE 11 - MOTIVATORS CHART ---------- */}
        <Page n={11} name={p.name}>
          <H>Your career motivators</H>
          <p className="text-[12.5px] text-ink-3 mb-4">Values that make work feel satisfying for you, rated from your dream-job preferences.</p>
          <ChartCard data={p.motivators} labelWidth={150} />
        </Page>

        {/* ---------- PAGE 12 - MOTIVATOR ANALYSIS ---------- */}
        <Page n={12} name={p.name}>
          <H>Your career motivator analysis</H>
          {p.motivators.slice(0, 3).map((b) => (
            <div key={b.key} className="mb-4">
              <p className="text-[13px] font-bold text-ink mb-1.5">{b.label} - {b.percent}%</p>
              <Bullets items={MOTIVATOR_DESC[b.label] ?? ['An important driver for your career satisfaction.']} />
            </div>
          ))}
        </Page>

        {/* ---------- PAGE 13 - LEARNING CHART ---------- */}
        <Page n={13} name={p.name}>
          <H>Your learning style</H>
          <p className="text-[12.5px] text-ink-3 mb-4">Your dominant learning style is <b className="text-ink">{p.dominantLearning}</b>.</p>
          <ChartCard data={p.learning} labelWidth={140} />
          <div className="mt-6 flex justify-center gap-6">
            {p.learning.slice(0, 2).map((b) => <Donut key={b.key} percent={b.percent} label={b.label} />)}
          </div>
        </Page>

        {/* ---------- PAGE 14 - LEARNING ANALYSIS ---------- */}
        <Page n={14} name={p.name}>
          <H>Your learning style analysis</H>
          <p className="text-[13px] font-bold text-ink mb-2">{p.dominantLearning}</p>
          <Bullets items={LEARNING_DESC[p.dominantLearning] ?? ['You learn well when material matches this style.']} />
          <p className="text-[13px] font-bold text-ink mt-5 mb-2">Learning improvement strategies</p>
          <Bullets items={LEARNING_TIPS[p.dominantLearning] ?? ['Match study methods to your dominant style for faster recall.']} />
        </Page>

        {/* ---------- PAGE 15 - INTELLIGENCES CHART ---------- */}
        <Page n={15} name={p.name}>
          <H>Your multiple intelligences</H>
          <p className="text-[12.5px] text-ink-3 mb-4">Howard Gardner&apos;s eight intelligences. Your strongest is <b className="text-ink">{p.dominantIntelligence}</b>.</p>
          <ChartCard data={ints} labelWidth={185} />
        </Page>

        {/* ---------- PAGE 16 - INTELLIGENCES ANALYSIS ---------- */}
        <Page n={16} name={p.name}>
          <H>Your multiple intelligences analysis</H>
          {ints.slice(0, 3).map((b) => (
            <div key={b.key} className="mb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${LEVEL_STYLE[b.level]}`}>{b.level}</span>
                <p className="text-[13px] font-bold text-ink">{b.label} - {b.percent}%</p>
              </div>
              <Bullets items={INTELLIGENCE_DESC[b.key] ?? ['A natural strength to build your studies and career around.']} />
            </div>
          ))}
        </Page>

        {/* ---------- PAGE 17 - EQ ---------- */}
        <Page n={17} name={p.name}>
          <H>Your emotional intelligence (EQ)</H>
          <p className="text-[12.5px] text-ink-3 mb-4">Derived from your interpersonal &amp; intrapersonal responses and personality - how you understand and manage emotions.</p>
          <ChartCard colorMode="level" labelWidth={150} data={p.eq.map((b) => ({ key: b.key, label: b.label, percent: b.percent }))} />
          <div className="mt-6 grid grid-cols-3 gap-3">
            {p.eq.slice(0, 3).map((b) => (
              <div key={b.key} className="rounded-xl border border-line p-3">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${LEVEL_STYLE[b.level]}`}>{b.level}</span>
                <p className="text-[12px] font-bold text-ink mt-2">{b.label}</p>
              </div>
            ))}
          </div>
        </Page>

        {/* ---------- PAGES 18-20 - SKILLS ---------- */}
        <Page n={18} name={p.name}>
          <H>Your skills &amp; abilities</H>
          <div className="inline-block bg-ink text-white text-sm font-bold px-4 py-1.5 rounded-lg mb-5">
            Overall Skills &amp; Abilities - {p.overallSkills}% ({p.overallSkills >= 67 ? 'Good' : 'Developing'})
          </div>
          {p.skills.slice(0, 3).map((b) => (
            <SkillBlock key={b.key} bar={b} note={SKILL_NOTE[b.label]} />
          ))}
        </Page>
        <Page n={19} name={p.name}>
          <H>Your skills &amp; abilities</H>
          {p.skills.slice(3, 6).map((b) => (
            <SkillBlock key={b.key} bar={b} note={SKILL_NOTE[b.label]} />
          ))}
        </Page>
        <Page n={20} name={p.name}>
          <H>Your skills &amp; abilities</H>
          {p.skills.slice(6, 8).map((b) => (
            <SkillBlock key={b.key} bar={b} note={SKILL_NOTE[b.label]} />
          ))}
          {p.analyticalScore && (
            <div className="mt-5 rounded-xl bg-bg border border-line p-4">
              <p className="text-[13px] font-bold text-ink mb-1">Analytical &amp; logical aptitude</p>
              <p className="text-[12.5px] text-ink-2">You answered <b>{p.analyticalScore.correct} of {p.analyticalScore.total}</b> aptitude questions correctly. These directly feed your numerical, logical, verbal and spatial scores above.</p>
            </div>
          )}
        </Page>

        {/* ---------- PAGE 21 - CLUSTERS CHART ---------- */}
        <Page n={21} name={p.name}>
          <H>Your career clusters</H>
          <p className="text-[12.5px] text-ink-3 mb-4">Clusters group similar occupations. These are the best clusters for you to explore.</p>
          <ChartCard data={p.clusters} labelWidth={170} />
        </Page>

        {/* ---------- PAGES 22-23 - SELECTED CLUSTERS ---------- */}
        <Page n={22} name={p.name}>
          <H>Your selected career clusters</H>
          {p.clusters.slice(0, 2).map((b, i) => (
            <div key={b.key} className="mb-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red text-white text-lg font-extrabold flex items-center justify-center shrink-0">{i + 1}</div>
              <div>
                <p className="text-[14px] font-bold text-ink">{b.label} - {b.percent}%</p>
                <Bullets items={clusterDesc(b.label)} />
              </div>
            </div>
          ))}
        </Page>
        <Page n={23} name={p.name}>
          <H>Your selected career clusters</H>
          {p.clusters.slice(2, 4).map((b, i) => (
            <div key={b.key} className="mb-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-ink text-white text-lg font-extrabold flex items-center justify-center shrink-0">{i + 3}</div>
              <div>
                <p className="text-[14px] font-bold text-ink">{b.label} - {b.percent}%</p>
                <Bullets items={clusterDesc(b.label)} />
              </div>
            </div>
          ))}
        </Page>

        {/* ---------- PAGES 24-25 - SUBJECTS ---------- */}
        {[0, 1].map((pageIdx) => (
          <Page key={`subj-${pageIdx}`} n={24 + pageIdx} name={p.name}>
            <H>Top subject recommendations for you</H>
            {streams.slice(pageIdx * 2, pageIdx * 2 + 2).map((st, i) => (
              <div key={st.name} className="mb-5 rounded-xl border border-line p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{st.icon}</span>
                  <p className="text-[14px] font-bold text-ink">{pageIdx * 2 + i + 1}. {st.name}</p>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                  <div className="flex flex-col items-center">
                    <Donut percent={st.percent} label="Suitability" />
                    <div className="mt-2 text-center">
                      <p className="text-[10px] font-bold text-red uppercase">Mandatory</p>
                      <p className="text-[11px] text-ink-2 leading-tight">{st.mandatory.join(' · ')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-ink-4 uppercase mb-1.5">Recommended optional subjects</p>
                    <ChartCard labelWidth={120} data={st.optional.map((name, j) => ({
                      key: name, label: name, percent: Math.max(15, 55 - j * 8),
                    }))} />
                  </div>
                </div>
              </div>
            ))}
          </Page>
        ))}

        {/* ---------- PAGES 26-27 - CAREER PATHS ---------- */}
        <Page n={26} name={p.name}>
          <H>Your best-fit career paths</H>
          <p className="text-[12.5px] text-ink-3 mb-4">Combining your personality, interests, intelligences and skills, these careers fit you best.</p>
          {hasRecommendations ? (
            <>
              <div className="space-y-2">
                {p.topCareers.slice(0, 6).map((c, i) => (
                  <div key={c.title} className="flex items-center gap-3 p-2.5 rounded-xl border border-line">
                    <span className="w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0" style={{ background: barColor(i) }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-ink text-[13px]">{c.title}</p>
                      <p className="text-[11px] text-ink-4 truncate">{c.roles} · {c.cluster}</p>
                    </div>
                    <div className="w-28 shrink-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[11px] font-bold" style={{ color: levelColor(c.match) }}>{c.match}%</span>
                      </div>
                      <Gauge percent={c.match} color={levelColor(c.match)} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${VERDICT_STYLE[c.verdict]}`}>{c.verdict}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 bg-red-soft border border-red-line rounded-xl p-4">
                <p className="text-[13px] font-bold text-ink mb-1">Top recommendation: {p.topCareers[0]?.title}</p>
                <p className="text-[12px] text-ink-2">
                  {p.name}, your profile aligns most strongly with <b>{p.topCareers[0]?.title}</b> ({p.topCareers[0]?.match}% match)
                  {p.topCareers[1] ? `, with ${p.topCareers[1].title} and ${p.topCareers[2]?.title} as strong alternatives.` : '.'}
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-line p-5 text-[12.5px] text-ink-2 leading-relaxed">
              Answer more questions to unlock fair career recommendations.
            </div>
          )}
        </Page>
        <Page n={27} name={p.name}>
          <H>Career paths - why they fit</H>
          {hasRecommendations ? (
            <div className="space-y-3">
              {p.topCareers.slice(0, 5).map((c, i) => (
                <div key={c.title} className="rounded-xl border border-line p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[13px] font-bold text-ink">{i + 1}. {c.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${VERDICT_STYLE[c.verdict]}`}>{c.match}% · {c.verdict}</span>
                  </div>
                  <p className="text-[12px] text-ink-2">Roles: {c.roles}. Cluster: {c.cluster}. This path rewards your {p.topInterests[0]} interest and {p.skills[0]?.label.replace(' Ability', '')} strength.</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-line p-5 text-[12.5px] text-ink-2 leading-relaxed">
              No career path is recommended yet because the assessment has not been answered. Please complete the questions so the analysis can stay fair and accurate.
            </div>
          )}
        </Page>

        {/* ---------- PAGE 28 - DEEP DIVE: WORK + ROADMAP ---------- */}
        <Page n={28} name={p.name}>
          {hasRecommendations ? (
            <>
              <H>Chosen path deep dive - {chosenTitle}</H>
              <p className="text-[12px] text-ink-3 mb-3">{chosenCareer!.cluster} · {chosenCareer!.education} · {chosenCareer!.salary}</p>
              <p className="text-[13px] font-bold text-ink mb-2">Work nature</p>
              <Bullets items={detail!.workNature.slice(0, 5)} />
              <p className="text-[13px] font-bold text-ink mt-4 mb-2">Education roadmap</p>
              <div className="grid grid-cols-2 gap-3">
                <RoadCard title="Graduation" items={detail!.roadmap.graduation} />
                <RoadCard title="Post-graduation" items={detail!.roadmap.postGraduation} />
                <RoadCard title="Certifications" items={detail!.roadmap.certifications} />
                <RoadCard title="Occupations" items={detail!.roadmap.occupations} />
              </div>
            </>
          ) : (
            <>
              <H>Chosen path deep dive</H>
              <div className="rounded-xl border border-dashed border-line p-5 text-[12.5px] text-ink-2 leading-relaxed">
                A deep dive will appear here after the assessment is answered. For now, there is no fair way to choose a path.
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Meta label="Career Focus" value={p.careerFocus} />
                <Meta label="Learning Style" value={p.dominantLearning} />
              </div>
            </>
          )}
        </Page>

        {/* ---------- PAGE 29 - DEEP DIVE: SALARY + GAPS ---------- */}
        <Page n={29} name={p.name}>
          {hasRecommendations ? (
            <>
              <H>Chosen path - salary, gaps &amp; next steps</H>
              <p className="text-[13px] font-bold text-ink mb-2">Salary growth - {chosenTitle}</p>
              <div className="space-y-2 mb-5">
                {salary.map((s, i) => (
                  <div key={s.level}>
                    <div className="flex justify-between text-[11px] text-ink-3"><span>{s.level}</span><span className="font-bold text-ink">{toLakhs(s.amount)}</span></div>
                    <div className="h-2 rounded-full bg-line-2 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.max(12, Math.round((s.amount / maxSalary) * 100))}%`, background: i === 0 ? RED : '#6C6E78' }} /></div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[13px] font-bold text-ink mb-2">Gap analysis</p>
                  <Bullets items={p.gaps} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-ink mb-2">Your next steps</p>
                  <Bullets items={p.nextSteps} mark="✓" />
                </div>
              </div>
            </>
          ) : (
            <>
              <H>Next steps</H>
              <div className="rounded-xl border border-dashed border-line p-5 text-[12.5px] text-ink-2 leading-relaxed">
                Complete the assessment to unlock salary estimates, gaps to close, and your next steps.
              </div>
              <div className="mt-4">
                <p className="text-[13px] font-bold text-ink mb-2">What to do now</p>
                <Bullets items={p.nextSteps.slice(0, 3)} mark="→" />
              </div>
            </>
          )}
        </Page>

        {/* ---------- PAGE 30 - METHODOLOGY ---------- */}
        <Page n={30} name={p.name}>
          <H>Assessment methodology summary</H>
          <p className="text-[12px] text-ink-3 mb-4">Based on correlation theory and standard psychometric models. Every input below is derived from your answers.</p>
          <div className="rounded-xl border border-line divide-y divide-line mb-5">
            <MethRow label="Career Personality" value={`${p.mbtiType} - ${p.mbtiAxes.map((a) => a.dominant).join(' + ')}`} />
            <MethRow label="Career Interests" value={p.topInterests.join(' + ')} />
            <MethRow label="Career Motivators" value={p.motivators.slice(0, 2).map((m) => m.label).join(' + ')} />
            <MethRow label="Learning Style" value={p.dominantLearning} />
            <MethRow label="Multiple Intelligences" value={ints.slice(0, 2).map((i) => i.label.split(' (')[0]).join(' + ') || '-'} />
            <MethRow label="Skills & Abilities" value={`Overall ${p.overallSkills}% · ${p.skills[0]?.label.replace(' Ability', '')} highest`} />
            <MethRow label="Analytical & Logical" value={p.analyticalScore ? `${p.analyticalScore.correct}/${p.analyticalScore.total} correct` : '-'} />
            <MethRow label="Selected Clusters" value={p.clusters.slice(0, 4).map((c) => c.label).join(' + ')} />
            <MethRow label="Report Reliability" value={`${conf.percent}% - ${conf.label}`} />
          </div>
          <div className="rounded-2xl bg-ink text-white p-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Want a human to walk you through this?</p>
              <p className="text-xs text-white/70">Talk to a OneGrasp counsellor and lock your execution plan.</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="inline-flex items-center gap-1 bg-white/10 px-3 py-2 rounded-lg"><Phone className="w-3.5 h-3.5" /> 8977760443</span>
              <span className="inline-flex items-center gap-1 bg-red px-3 py-2 rounded-lg"><Mail className="w-3.5 h-3.5" /> support@onegrasp.com</span>
            </div>
          </div>
          <p className="text-[10px] text-ink-4 mt-4 text-center">Generated {generated} · OneGrasp Career Counselling · Non-Commercial Use</p>
        </Page>

        {/* back to dashboard (screen only) */}
        <div className="report-toolbar flex justify-center pt-2">
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-ink text-white font-semibold px-6 py-3 rounded-xl hover:bg-ink-2">
            <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- sub-components ----------------------------- */

function SkillBlock({ bar, note }: { bar: Bar & { rating: string }; note?: string[] }) {
  return (
    <div className="mb-4 flex items-start gap-4">
      <Donut percent={bar.percent} label={bar.rating} />
      <div className="flex-1 pt-1">
        <p className="text-[13px] font-bold text-ink mb-1.5">{bar.label} - {bar.rating}</p>
        <Bullets items={note ?? ['A useful ability that broadens your career options.']} />
      </div>
    </div>
  );
}

function RoadCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-line p-3">
      <p className="text-[11px] font-bold text-red mb-1">{title}</p>
      <ul className="space-y-0.5">{items.slice(0, 5).map((t) => <li key={t} className="text-[11.5px] text-ink-2">• {t}</li>)}</ul>
    </div>
  );
}

function MethRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[0.8fr_1.6fr] gap-3 px-4 py-2.5 items-start">
      <p className="text-[12.5px] font-bold text-ink">{label}</p>
      <p className="text-[12.5px] text-ink-2">{value}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-ink-4 text-[10px] uppercase tracking-wide">{label}</p>
      <p className="text-ink font-bold text-sm">{value}</p>
    </div>
  );
}

/* ----------------------------- content maps ----------------------------- */

const EXTRA_PERSONALITY: Record<string, string[]> = {
  I: ['You are a good listener and reflect before you speak.'],
  E: ['You think out loud and energise the people around you.'],
  S: ['You notice facts and details and learn best from practice.'],
  N: ['You see patterns and possibilities and enjoy big-picture thinking.'],
  T: ['You look for logical, objective solutions to problems.'],
  F: ['You weigh values and people when you decide.'],
  J: ['You like clear plans, deadlines and closure.'],
  P: ['You stay flexible and often juggle several tasks at once.'],
};

const INTEREST_DESC: Record<string, string[]> = {
  Realistic: ['You enjoy hands-on, practical work with tools, machines or the outdoors.', 'You value things you can see, build and touch.'],
  Investigative: ['You are analytical and curious and enjoy research and problem-solving.', 'You like working with ideas, data and technology.'],
  Artistic: ['You are creative, expressive and imaginative.', 'You enjoy design, writing, performance and original work.'],
  Social: ['You enjoy helping, teaching and working with people.', 'You value cooperation and making a difference.'],
  Enterprising: ['You like leading, persuading and driving outcomes.', 'You are comfortable taking initiative and managing others.'],
  Conventional: ['You are organised, detail-oriented and reliable.', 'You enjoy structured work with data and clear procedures.'],
};

const MOTIVATOR_DESC: Record<string, string[]> = {
  Independence: ['You enjoy working independently and making your own decisions.', 'You dislike too much supervision.'],
  'Structured work environment': ['You like routine, guidelines and well-defined processes.', 'You dislike frequent unexpected change.'],
  'Continuous Learning': ['You want to keep upgrading your skills and knowledge.', 'You are drawn to the frontiers of your field.'],
  Creativity: ['You want room to create and express original ideas.', 'You value imagination at work.'],
  Adventure: ['You are energised by challenge, novelty and some risk.', 'You enjoy variety over predictability.'],
  'Social Service': ['You want work that helps people and society.', 'Purpose matters as much as pay.'],
  'High Paced Environment': ['You thrive on competition, pace and excitement.', 'You enjoy fast-moving, challenging work.'],
};

const LEARNING_DESC: Record<string, string[]> = {
  'Auditory Learning': ['You learn best through listening, discussion and talking things through.', 'You interpret meaning from tone, pitch and speech.'],
  'Visual Learning': ['You learn best through images, diagrams, charts and demonstrations.', 'You remember what you see.'],
  'Read & Write Learning': ['You learn best by reading and writing notes.', 'Lists, text and definitions work well for you.'],
  'Kinesthetic Learning': ['You learn best by doing - practicals, models and hands-on practice.', 'You remember what you physically do.'],
};
const LEARNING_TIPS: Record<string, string[]> = {
  'Auditory Learning': ['Study in groups and discuss topics aloud.', 'Record and replay notes; read text out loud.', 'Use audiobooks and recite key facts.'],
  'Visual Learning': ['Convert notes into diagrams, mind-maps and flowcharts.', 'Use colour, highlighting and visual summaries.', 'Watch demos and videos.'],
  'Read & Write Learning': ['Rewrite notes in your own words.', 'Make lists, summaries and definitions.', 'Practise with written questions.'],
  'Kinesthetic Learning': ['Learn by doing experiments, models and projects.', 'Take movement breaks while studying.', 'Use real examples and case studies.'],
};

const INTELLIGENCE_DESC: Record<string, string[]> = {
  linguistic: ['Strong with words, reading, writing and explaining.', 'Careers: law, journalism, teaching, content, communication.'],
  logical: ['Strong with logic, numbers, patterns and analysis.', 'Careers: engineering, data, science, finance, computing.'],
  spatial: ['Strong at visualising objects, maps and designs.', 'Careers: architecture, design, engineering, surgery.'],
  kinesthetic: ['Strong with body, movement and hands-on work.', 'Careers: sports, surgery, mechanics, performing arts.'],
  musical: ['Strong with rhythm, melody and sound.', 'Careers: music, audio, performance, content production.'],
  interpersonal: ['Strong at understanding and working with people.', 'Careers: management, counselling, sales, HR, teaching.'],
  intrapersonal: ['Strong self-awareness, reflection and independence.', 'Careers: research, writing, entrepreneurship, psychology.'],
  naturalist: ['Strong connection to nature and the living world.', 'Careers: biology, agriculture, environment, veterinary.'],
};

const SKILL_NOTE: Record<string, string[]> = {
  'Numerical Ability': ['Comfort with numbers and quantitative data.', 'An advantage across many career options.'],
  'Logical Ability': ['Reasoning and analysing data in different formats.', 'Essential for analytical profiles.'],
  'Verbal Ability': ['Clear written and spoken communication.', 'Helps you express your message effectively.'],
  'Administrative & Organising Skills': ['Planning, scheduling and coordinating resources.', 'Keeps work on time and on track.'],
  'Spatial & Visualisation Ability': ['Exploring, analysing and creating visual solutions.', 'Important in design and technical fields.'],
  'Leadership & Decision Making': ['Strategic thinking, influence and quick decisions.', 'Helps you lead and adapt.'],
  'Social & Co-operation Skills': ['Building and maintaining relationships.', 'Valuable in service and people-facing work.'],
  'Mechanical Abilities': ['Understanding how mechanical things work.', 'Useful in engineering and technical services.'],
};
