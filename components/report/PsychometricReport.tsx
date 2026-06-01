'use client';

/**
 * Mindler-style career report — condensed, highly visual and kid-friendly
 * (readable from class 1 to class 12). Each <Page> is a fixed A4 sheet so
 * printing / saving to PDF yields exactly TOTAL_PAGES pages. Every number is
 * derived from the student's own answers via lib/assessment-engine.ts.
 */

import Link from 'next/link';
import { Printer, Phone, Mail, LayoutDashboard, Sparkles, CheckCircle2, Target, TrendingUp } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import type { PsychometricProfile } from '@/lib/psychometric';
import { MBTI_DESC } from '@/lib/psychometric';
import { CAREER_LIBRARY } from '@/constants/catalog';
import { getCareerDetail, buildSalary } from '@/constants/career-details';

const TOTAL_PAGES = 14;

/* ----------------------------- palette ----------------------------- */
/* Pleasant, friendly per-dimension colours. */
const C = {
  personality: '#8B5CF6', // violet
  interest: '#F59E0B',    // amber
  intelligence: '#EC4899',// pink
  skill: '#10B981',       // emerald
  motivator: '#3B82F6',   // blue
  learning: '#06B6D4',    // cyan
  eq: '#22C55E',          // green
  cluster: '#6366F1',     // indigo
  ink: '#1F2430',
};
const RED = '#E0242E';
const PALETTE = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1', '#22C55E'];
const ZONE = { low: '#FDECEA', med: '#FEF6E0', high: '#E9F7EF' };

/* emoji icons (kid-friendly, print well) */
const MBTI_EMOJI: Record<string, string> = { I: '🤔', E: '🗣️', S: '🔍', N: '💭', T: '🧠', F: '💖', J: '🗂️', P: '🎲' };
const RIASEC_EMOJI: Record<string, string> = { R: '🔧', I: '🔬', A: '🎨', S: '🤝', E: '📈', C: '🗂️' };
const INT_EMOJI: Record<string, string> = {
  linguistic: '📖', logical: '🔢', spatial: '🧭', kinesthetic: '🤸',
  musical: '🎵', interpersonal: '👥', intrapersonal: '🪞', naturalist: '🌿',
};

/* ----------------------------- helpers ----------------------------- */
function level(p: number) { return p >= 67 ? 'High' : p >= 34 ? 'Medium' : 'Low'; }
function score19(p: number) { return Math.max(1, Math.min(9, Math.round((p / 100) * 8) + 1)); }

function normalizeTitle(t: string) { return t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function resolveCareerTitle(preferred: string | undefined, fallback: string) {
  const options = CAREER_LIBRARY.map((c) => c.title);
  const target = preferred?.trim();
  if (target) {
    const exact = options.find((title) => normalizeTitle(title) === normalizeTitle(target));
    if (exact) return exact;
    const partial = options.find((title) => {
      const a = normalizeTitle(title); const b = normalizeTitle(target);
      return a.includes(b) || b.includes(a);
    });
    if (partial) return partial;
  }
  return fallback;
}
function toLakhs(amount: number) { return `Rs ${(amount / 100000).toFixed(amount >= 1000000 ? 0 : 1)}L`; }

const VERDICT_STYLE: Record<string, string> = {
  'Top Choice': 'text-white', 'Good Choice': 'text-white',
  Optional: 'text-white', Develop: 'text-white', Avoid: 'text-white',
};
const VERDICT_BG: Record<string, string> = {
  'Top Choice': '#10B981', 'Good Choice': '#3B82F6', Optional: '#94A3B8', Develop: '#F59E0B', Avoid: '#EF4444',
};

const STAGE_BY_LABEL: Record<string, { stage: string; emoji: string; note: string }> = {
  'Future-Ready': { stage: 'Future-Ready', emoji: '🚀', note: 'You have strong clarity and are ready to act on your plan.' },
  Clarity: { stage: 'Clarity', emoji: '🌟', note: 'You have good direction — now refine and commit to a path.' },
  Exploring: { stage: 'Exploring', emoji: '🧭', note: 'You are exploring options — gather information and narrow down.' },
  'Getting Started': { stage: 'Just Starting', emoji: '🌱', note: 'You are early in planning — explore your strengths and options.' },
};

const CLUSTER_DESC: Record<string, string[]> = {
  'Information Technology': ['Build apps, websites, data and AI systems.', 'Wanted in every industry, with strong pay growth.'],
  'Health Science': ['Care for patients or support medical research.', 'Stable, respected and meaningful work.'],
  'Science & Research': ['Investigate, experiment and discover new things.', 'Great for curious, analytical minds.'],
  'Engineering & Technology': ['Design and build machines, structures and systems.', 'Hands-on problem solving with real impact.'],
  'Accounts & Finance': ['Work with money, audits, taxes and investments.', 'Numbers, accuracy and structure.'],
  'Government & Legal': ['Public service, policy, law and justice.', 'Service, stability and authority.'],
  'Business Management': ['Lead teams and grow organisations.', 'Leadership, strategy and people skills.'],
  'Arts & Media': ['Create design, content, film and visuals.', 'Where imagination meets craft.'],
  'Education & Training': ['Teach, mentor and help people grow.', 'Communication and subject mastery.'],
  'Human Service': ['Support wellbeing, counselling and community.', 'Empathy and people skills.'],
  'Marketing & Advertising': ['Brand, growth, sales and communication.', 'Creativity with analytics.'],
  'Media & Communication': ['Journalism, storytelling and digital media.', 'Words, research and reach.'],
};
function clusterDesc(label: string) {
  return CLUSTER_DESC[label] ?? ['A field that matches your strongest interests and skills.', 'Explore the day-to-day roles before deciding.'];
}

/* subject streams derived from interests + skills */
function streamMatch(p: PsychometricProfile) {
  const r = Object.fromEntries(p.interests.map((b) => [b.label, b.percent])) as Record<string, number>;
  const sk = Object.fromEntries(p.skills.map((b) => [b.label, b.percent])) as Record<string, number>;
  const inv = r['Investigative'] ?? 0; const art = r['Artistic'] ?? 0; const soc = r['Social'] ?? 0;
  const ent = r['Enterprising'] ?? 0; const con = r['Conventional'] ?? 0;
  const num = sk['Numerical Ability'] ?? 0; const log = sk['Logical Ability'] ?? 0; const verb = sk['Verbal Ability'] ?? 0;
  const clp = (n: number) => Math.max(20, Math.min(98, Math.round(n)));
  return [
    { name: 'Science - Maths', icon: '📐', percent: clp(inv * 0.5 + num * 0.3 + log * 0.2),
      mandatory: ['Maths', 'Physics', 'Chemistry'], optional: ['Computer Science', 'Biology', 'Economics'] },
    { name: 'Science - Bio', icon: '🧬', percent: clp(inv * 0.45 + soc * 0.25 + (sk['Social & Co-operation Skills'] ?? 0) * 0.3),
      mandatory: ['Biology', 'Physics', 'Chemistry'], optional: ['Computer Science', 'Maths', 'Psychology'] },
    { name: 'Commerce', icon: '💼', percent: clp(con * 0.5 + ent * 0.3 + num * 0.2),
      mandatory: ['Accountancy', 'Economics', 'Business Studies'], optional: ['Business Maths', 'Legal Studies'] },
    { name: 'Humanities', icon: '📚', percent: clp(art * 0.4 + soc * 0.4 + verb * 0.2),
      mandatory: ['Language Arts', 'History', 'Political Science'], optional: ['Psychology', 'Fine Arts'] },
  ].sort((a, b) => b.percent - a.percent);
}

/* ----------------------------- UI atoms ----------------------------- */

/** Mindler-signature Low/Medium/High zoned bar. */
function ZoneBar({ label, percent, color, labelWidth = 150 }: { label: string; percent: number; color: string; labelWidth?: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-[11px] text-ink-2 text-right leading-tight" style={{ width: labelWidth }}>{label}</span>
      <div className="flex-1 relative h-5 rounded-md overflow-hidden border border-line">
        <div className="absolute inset-0 flex">
          <div className="flex-1" style={{ background: ZONE.low }} />
          <div className="flex-1" style={{ background: ZONE.med }} />
          <div className="flex-1" style={{ background: ZONE.high }} />
        </div>
        <div className="absolute inset-y-0 left-0 rounded-r-md flex items-center justify-end pr-1.5"
          style={{ width: `${Math.max(3, percent)}%`, background: color }}>
          {percent >= 16 && <span className="text-[9px] font-bold text-white">{percent}%</span>}
        </div>
        {percent < 16 && (
          <span className="absolute top-1/2 -translate-y-1/2 text-[9px] font-bold"
            style={{ left: `calc(${Math.max(3, percent)}% + 4px)`, color }}>{percent}%</span>
        )}
      </div>
    </div>
  );
}
function ZoneAxis({ labelWidth = 150 }: { labelWidth?: number }) {
  return (
    <div className="flex mt-1" style={{ paddingLeft: labelWidth + 12 }}>
      <div className="flex-1 flex justify-between text-[8.5px] font-semibold text-ink-4">
        <span>Low</span><span>Medium</span><span>High</span>
      </div>
    </div>
  );
}
function ZoneChart({ data, color, labelWidth = 150 }: { data: { key: string; label: string; percent: number }[]; color: string | ((i: number) => string); labelWidth?: number }) {
  return (
    <div className="rounded-2xl border border-line p-4 bg-white">
      <div className="space-y-2">
        {data.map((b, i) => (
          <ZoneBar key={b.key} label={b.label} percent={b.percent} labelWidth={labelWidth}
            color={typeof color === 'function' ? color(i) : color} />
        ))}
      </div>
      <ZoneAxis labelWidth={labelWidth} />
    </div>
  );
}

/** Colourful dominant-trait tile with an emoji icon. */
function TraitTile({ emoji, title, sub, color }: { emoji: string; title: string; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl p-3 text-center" style={{ background: `${color}14`, border: `1.5px solid ${color}55` }}>
      <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-1.5" style={{ background: `${color}26` }}>{emoji}</div>
      <p className="text-[12px] font-extrabold text-ink leading-tight">{title}</p>
      {sub && <p className="text-[10.5px] font-bold mt-0.5" style={{ color }}>{sub}</p>}
    </div>
  );
}

/** 1..9 score chips (Mindler personality style). */
function ScaleChips({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
        <span key={n} className="w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center"
          style={n === score ? { background: color, color: '#fff' } : { background: '#F1F1F4', color: '#9A9AA5' }}>{n}</span>
      ))}
    </div>
  );
}

/** Meaning / Analysis / Development boxes. */
function DimBox({ color, meaning, analysis, development }: { color: string; meaning: string; analysis: string; development: string[] }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-line overflow-hidden">
          <div className="px-3 py-1 text-[10px] font-bold text-white" style={{ background: color }}>What it means</div>
          <p className="px-3 py-2 text-[11px] text-ink-2 leading-snug">{meaning}</p>
        </div>
        <div className="rounded-xl border border-line overflow-hidden">
          <div className="px-3 py-1 text-[10px] font-bold text-white" style={{ background: color }}>Your result</div>
          <p className="px-3 py-2 text-[11px] text-ink-2 leading-snug">{analysis}</p>
        </div>
      </div>
      <div className="rounded-xl border border-line overflow-hidden">
        <div className="px-3 py-1 text-[10px] font-bold text-white" style={{ background: C.ink }}>How to grow 🌱</div>
        <ul className="px-3 py-2 grid sm:grid-cols-2 gap-x-4 gap-y-1">
          {development.map((d, i) => <li key={i} className="text-[11px] text-ink-2 flex gap-1.5"><span style={{ color }}>•</span>{d}</li>)}
        </ul>
      </div>
    </div>
  );
}

function Donut({ percent, label, color }: { percent: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <div className="w-20 h-20 rounded-full" style={{ background: `conic-gradient(${color} ${percent * 3.6}deg, #ECECEF 0deg)` }} />
        <div className="absolute inset-[9px] bg-white rounded-full flex items-center justify-center text-base font-extrabold" style={{ color }}>{percent}%</div>
      </div>
      <p className="text-[11px] font-bold text-ink-2 mt-1 text-center leading-tight">{label}</p>
    </div>
  );
}

function H({ children, color = RED }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-2 h-6 rounded-full" style={{ background: color }} />
      <h2 className="text-[18px] font-extrabold text-ink">{children}</h2>
    </div>
  );
}
function Bullets({ items, color = RED }: { items: string[]; color?: string }) {
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => <li key={i} className="text-[12px] text-ink-2 flex gap-2"><span style={{ color }}>•</span>{t}</li>)}
    </ul>
  );
}

function Page({ n, name, children }: { n: number; name: string; children: React.ReactNode }) {
  return (
    <section className="a4-page bg-white shadow-md mx-auto relative flex flex-col"
      style={{ width: '210mm', height: '297mm', breakBefore: n > 1 ? 'page' : 'auto', overflow: 'hidden' }}>
      <div className="flex items-center justify-between px-10 pt-6 pb-2 border-b border-line">
        <span className="text-[11px] font-bold uppercase tracking-wide text-ink-2">{name}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: RED }}>Career Discovery Report</span>
        <Logo size={22} />
      </div>
      <div className="flex-1 px-10 py-6 overflow-hidden">{children}</div>
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
  const firstName = (p.name || 'Student').split(' ')[0];
  const ints = p.intelligences ?? [];
  const conf = p.confidence ?? { percent: 100, answered: 0, total: 0, label: 'High reliability' };
  const stage = STAGE_BY_LABEL[p.matchLabel] ?? STAGE_BY_LABEL.Exploring;
  const streams = streamMatch(p);
  const eqAvg = p.eq.length ? Math.round(p.eq.reduce((s, e) => s + e.percent, 0) / p.eq.length) : 0;
  const hasRecommendations = (p.topCareers?.length ?? 0) > 0 && (conf.answered ?? 0) > 0;

  const chosenTitle = hasRecommendations ? resolveCareerTitle(p.careerFocus, p.careerFocus) : '';
  const chosenCareer = hasRecommendations ? (CAREER_LIBRARY.find((c) => c.title === chosenTitle) ?? CAREER_LIBRARY[0]) : null;
  const detail = hasRecommendations ? getCareerDetail(chosenTitle) : null;
  const salary = hasRecommendations && detail ? buildSalary(detail.salaryBase) : [];
  const maxSalary = Math.max(...salary.map((s) => s.amount), 1);

  // hub framework nodes
  const hubNodes = [
    { emoji: '🧩', label: 'Personality', value: p.mbtiType, color: C.personality, pos: { left: '50%', top: '12%' } },
    { emoji: '🎯', label: 'Interests', value: p.topInterests[0] ?? '—', color: C.interest, pos: { left: '85%', top: '31%' } },
    { emoji: '💡', label: 'Intelligence', value: (p.dominantIntelligence ?? '—').split(' (')[0], color: C.intelligence, pos: { left: '85%', top: '69%' } },
    { emoji: '🛠️', label: 'Skills', value: `${p.overallSkills}%`, color: C.skill, pos: { left: '50%', top: '88%' } },
    { emoji: '⭐', label: 'Motivators', value: p.motivators[0]?.label ?? '—', color: C.motivator, pos: { left: '15%', top: '69%' } },
    { emoji: '❤️', label: 'Emotional', value: `${eqAvg}%`, color: C.eq, pos: { left: '15%', top: '31%' } },
  ];
  const nodeXY = (pos: { left: string; top: string }) => ({ x: (parseFloat(pos.left) / 100) * 320, y: (parseFloat(pos.top) / 100) * 320 });

  return (
    <div className="min-h-screen bg-bg">
      <style>{`
        @page { size: A4; margin: 10mm; }
        body { background: #f6f3f0; }
        .a4-page { margin-bottom: 12px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          body { background: white; }
          .report-topbar, .report-toolbar { display: none !important; }
          .a4-page { margin: 0 auto !important; box-shadow: none !important; }
        }
      `}</style>

      <header className="report-topbar bg-white border-b border-line sticky top-0 z-40">
        <div className="max-w-[230mm] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/dashboard"><Logo size={30} /></Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="inline-flex items-center gap-2 border border-line text-ink-2 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-bg transition-colors">
              <LayoutDashboard className="w-4 h-4" /><span className="hidden sm:inline">Back to Dashboard</span><span className="sm:hidden">Dashboard</span>
            </Link>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-red text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow">
              <Printer className="w-4 h-4" /><span className="hidden sm:inline">Save as PDF</span><span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[230mm] mx-auto px-4 sm:px-6 py-6 space-y-3">

        {/* ---------- PAGE 1 · COVER ---------- */}
        <Page n={1} name={p.name}>
          <div className="rounded-3xl p-8 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.personality}, ${C.motivator})` }}>
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
            <div className="absolute -right-4 top-24 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.10)' }} />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-bold bg-white/20 rounded-full px-3 py-1"><Sparkles className="w-3.5 h-3.5" /> My Career Discovery</span>
              <h1 className="text-5xl font-extrabold mt-4 leading-tight">Hi {firstName}! 👋</h1>
              <p className="text-white/90 mt-2 text-lg">Here is what makes you <b>uniquely awesome</b> — and the careers that fit you best.</p>
              <p className="text-white/70 text-sm mt-6">Prepared on {generated}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <StatCard emoji={stage.emoji} label="Your stage" value={stage.stage} color={C.personality} />
            <StatCard emoji="✅" label="Report reliability" value={`${conf.percent}%`} color={C.skill} />
            <StatCard emoji="⭐" label="Readiness score" value={`${p.overallScore}/100`} color={C.interest} />
          </div>

          <div className="mt-5 rounded-2xl border border-line p-5">
            <p className="text-[13px] font-extrabold text-ink mb-2">What is inside this report?</p>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                ['🧩', 'Your Personality'], ['🎯', 'Your Interests'], ['💡', 'Your Intelligences'],
                ['🛠️', 'Your Skills'], ['⭐', 'Your Motivators'], ['🧠', 'Learning & Emotions'],
                ['🗂️', 'Career Clusters'], ['📚', 'Best Subjects'], ['🚀', 'Best-Fit Careers'],
              ].map(([e, t]) => (
                <div key={t} className="flex items-center gap-2 rounded-xl bg-bg border border-line px-3 py-2">
                  <span className="text-lg">{e}</span><span className="text-[11.5px] font-bold text-ink-2">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {hasRecommendations && (
            <div className="mt-4 rounded-2xl p-4 text-white flex items-center gap-3" style={{ background: C.skill }}>
              <Target className="w-6 h-6 shrink-0" />
              <p className="text-[13px]"><b>Your top career match:</b> {p.topCareers[0]?.title} — {p.topCareers[0]?.match}% fit!</p>
            </div>
          )}
        </Page>

        {/* ---------- PAGE 2 · FRAMEWORK HUB ---------- */}
        <Page n={2} name={p.name}>
          <H>Your Career DNA — the 6 building blocks</H>
          <p className="text-[12px] text-ink-3 mb-3">We measured 6 parts of who you are. Together they point to the careers that will make you happy and successful.</p>
          <div className="relative mx-auto" style={{ width: 320, height: 320 }}>
            <svg viewBox="0 0 320 320" className="absolute inset-0 w-full h-full">
              {hubNodes.map((nd) => { const { x, y } = nodeXY(nd.pos); return <line key={nd.label} x1={160} y1={160} x2={x} y2={y} stroke={nd.color} strokeWidth={2} strokeOpacity={0.4} />; })}
            </svg>
            <div className="absolute rounded-full flex flex-col items-center justify-center text-white text-center shadow-lg"
              style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 96, height: 96, background: `linear-gradient(135deg, ${C.personality}, ${C.motivator})` }}>
              <span className="text-2xl">🧬</span><span className="text-[10px] font-extrabold leading-tight mt-0.5">YOUR<br />CAREER DNA</span>
            </div>
            {hubNodes.map((nd) => (
              <div key={nd.label} className="absolute flex flex-col items-center" style={{ left: nd.pos.left, top: nd.pos.top, transform: 'translate(-50%,-50%)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md" style={{ background: '#fff', border: `2px solid ${nd.color}` }}>{nd.emoji}</div>
                <span className="mt-1 text-[10px] font-extrabold text-ink">{nd.label}</span>
                <span className="text-[9.5px] font-bold leading-tight text-center max-w-[90px] truncate" style={{ color: nd.color }}>{nd.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${stage.stage ? C.personality : RED}33`, background: `${C.personality}0D` }}>
            <p className="text-[13px] font-extrabold text-ink mb-1">{stage.emoji} You are at the “{stage.stage}” stage</p>
            <p className="text-[12px] text-ink-2">{stage.note}</p>
          </div>
        </Page>

        {/* ---------- PAGE 3 · PERSONALITY OVERVIEW ---------- */}
        <Page n={3} name={p.name}>
          <H color={C.personality}>Your Personality 🧩</H>
          <p className="text-[12px] text-ink-3 mb-3">Your personality is your natural style — how you get energy, take in information, decide and plan.</p>
          <div className="text-center mb-4">
            <span className="inline-block text-4xl font-extrabold tracking-[0.3em] px-6 py-2 rounded-2xl text-white" style={{ background: C.personality }}>{p.mbtiType}</span>
            <p className="text-[12px] text-ink-3 mt-2">{p.mbtiAxes.map((a) => a.dominant).join(' · ')}</p>
          </div>
          <div className="grid grid-cols-4 gap-2.5 mb-4">
            {p.mbtiAxes.map((a) => {
              const letter = letterFor(a);
              const pct = Math.max(a.leftPct, a.rightPct);
              return <TraitTile key={a.axis} emoji={MBTI_EMOJI[letter] ?? '⭐'} title={a.dominant} sub={`${pct}%`} color={C.personality} />;
            })}
          </div>
          <div className="rounded-2xl border border-line p-4 space-y-3">
            {p.mbtiAxes.map((a) => (
              <div key={a.axis}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className={a.dominant === a.left ? 'font-extrabold text-ink' : 'text-ink-4'}>{a.left}</span>
                  <span className="font-bold" style={{ color: C.personality }}>{Math.max(a.leftPct, a.rightPct)}% {a.dominant}</span>
                  <span className={a.dominant === a.right ? 'font-extrabold text-ink' : 'text-ink-4'}>{a.right}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden flex" style={{ background: `${C.personality}22` }}>
                  <div style={{ width: `${a.leftPct}%`, background: a.dominant === a.left ? C.personality : `${C.personality}55` }} />
                  <div style={{ width: `${a.rightPct}%`, background: a.dominant === a.right ? C.personality : `${C.personality}55` }} />
                </div>
              </div>
            ))}
          </div>
        </Page>

        {/* ---------- PAGE 4 · PERSONALITY IN DETAIL ---------- */}
        <Page n={4} name={p.name}>
          <H color={C.personality}>Your Personality in detail</H>
          <div className="space-y-3">
            {DIMS.map((dim) => {
              const a = p.mbtiAxes.find((x) => x.axis === dim.axis)!;
              const letter = letterFor(a);
              const pct = Math.max(a.leftPct, a.rightPct);
              return (
                <div key={dim.axis} className="rounded-2xl border border-line p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${C.personality}1A` }}>{MBTI_EMOJI[letter]}</span>
                    <div className="flex-1">
                      <p className="text-[13px] font-extrabold text-ink">{a.dominant} <span className="text-ink-4 font-normal">· {dim.title}</span></p>
                    </div>
                    <ScaleChips score={score19(pct)} color={C.personality} />
                  </div>
                  <DimBox color={C.personality}
                    meaning={(EXTRA_PERSONALITY[letter] ?? [''])[0]}
                    analysis={(MBTI_DESC[letter] ?? ['A natural part of how you work.'])[0]}
                    development={DEV_PERSONALITY[letter] ?? ['Keep practising and stay curious.']} />
                </div>
              );
            })}
          </div>
        </Page>

        {/* ---------- PAGE 5 · INTERESTS ---------- */}
        <Page n={5} name={p.name}>
          <H color={C.interest}>Your Interests 🎯</H>
          <p className="text-[12px] text-ink-3 mb-3">Interests are the activities you naturally enjoy. The more a bar leans towards <b>High</b>, the more it excites you.</p>
          <ZoneChart data={p.interests} color={C.interest} labelWidth={120} />
          <p className="text-[12px] font-extrabold text-ink mt-4 mb-2">Your top 3 interest areas</p>
          <div className="grid grid-cols-3 gap-2.5">
            {p.interests.slice(0, 3).map((b) => (
              <TraitTile key={b.key} emoji={RIASEC_EMOJI[b.key] ?? '⭐'} title={b.label} sub={`${b.percent}% · ${level(b.percent)}`} color={C.interest} />
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {p.interests.slice(0, 2).map((b) => (
              <div key={b.key} className="rounded-xl border border-line p-3">
                <p className="text-[12px] font-extrabold text-ink mb-1">{RIASEC_EMOJI[b.key]} {b.label}</p>
                <Bullets color={C.interest} items={INTEREST_DESC[b.label] ?? ['A strong interest area worth exploring.']} />
              </div>
            ))}
          </div>
        </Page>

        {/* ---------- PAGE 6 · MULTIPLE INTELLIGENCES ---------- */}
        <Page n={6} name={p.name}>
          <H color={C.intelligence}>Your Smarts 💡 (Multiple Intelligences)</H>
          <p className="text-[12px] text-ink-3 mb-3">Everyone is smart in different ways! Here are your 8 kinds of smart. Your strongest is <b>{p.dominantIntelligence}</b>.</p>
          <ZoneChart data={ints} color={C.intelligence} labelWidth={185} />
          <p className="text-[12px] font-extrabold text-ink mt-4 mb-2">Your top 3 kinds of smart</p>
          <div className="grid grid-cols-3 gap-2.5">
            {ints.slice(0, 3).map((b) => (
              <TraitTile key={b.key} emoji={INT_EMOJI[b.key] ?? '⭐'} title={b.label.split(' (')[0]} sub={`${b.percent}% · ${b.level}`} color={C.intelligence} />
            ))}
          </div>
        </Page>

        {/* ---------- PAGE 7 · SKILLS & ABILITIES ---------- */}
        <Page n={7} name={p.name}>
          <H color={C.skill}>Your Skills &amp; Abilities 🛠️</H>
          <div className="flex items-center gap-3 mb-3">
            <Donut percent={p.overallSkills} label="Overall" color={C.skill} />
            <p className="text-[12px] text-ink-2">Your overall skill score is <b style={{ color: C.skill }}>{p.overallSkills}% ({level(p.overallSkills)})</b>. The bars below show where you shine and where you can grow.</p>
          </div>
          <ZoneChart data={p.skills.map((s) => ({ key: s.key, label: s.label, percent: s.percent }))} color={C.skill} labelWidth={185} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-line p-3">
              <p className="text-[11px] font-extrabold text-ink mb-1">💪 Your strengths</p>
              <Bullets color={C.skill} items={p.skills.slice(0, 3).map((s) => `${s.label} — ${s.rating}`)} />
            </div>
            <div className="rounded-xl border border-line p-3">
              <p className="text-[11px] font-extrabold text-ink mb-1">🌱 Grow these</p>
              <Bullets color={C.interest} items={p.skills.slice(-2).map((s) => `${s.label} — ${s.rating}`)} />
            </div>
          </div>
        </Page>

        {/* ---------- PAGE 8 · MOTIVATORS & LEARNING ---------- */}
        <Page n={8} name={p.name}>
          <H color={C.motivator}>What drives you ⭐ &amp; how you learn 🧠</H>
          <p className="text-[12px] font-extrabold text-ink mb-2">Your motivators (what makes work feel happy)</p>
          <ZoneChart data={p.motivators} color={C.motivator} labelWidth={170} />
          <p className="text-[12px] font-extrabold text-ink mt-4 mb-2">Your learning style — you learn best by: <span style={{ color: C.learning }}>{p.dominantLearning}</span></p>
          <ZoneChart data={p.learning} color={C.learning} labelWidth={150} />
          <div className="mt-3 rounded-xl border border-line p-3">
            <p className="text-[11px] font-extrabold text-ink mb-1">📌 Study tips for you</p>
            <Bullets color={C.learning} items={LEARNING_TIPS[p.dominantLearning] ?? ['Match study methods to your style for faster learning.']} />
          </div>
        </Page>

        {/* ---------- PAGE 9 · EMOTIONAL INTELLIGENCE ---------- */}
        <Page n={9} name={p.name}>
          <H color={C.eq}>Your Emotional Strength ❤️</H>
          <p className="text-[12px] text-ink-3 mb-3">This is how well you understand and handle feelings — yours and other people&apos;s. It helps you make friends, lead and stay calm.</p>
          <ZoneChart data={p.eq.map((e) => ({ key: e.key, label: e.label, percent: e.percent }))} color={C.eq} labelWidth={170} />
          <div className="grid grid-cols-3 gap-2.5 mt-4">
            {p.eq.slice(0, 3).map((b) => (
              <TraitTile key={b.key} emoji="💚" title={b.label} sub={`${b.percent}% · ${b.level}`} color={C.eq} />
            ))}
          </div>
          {p.analyticalScore && (
            <div className="mt-4 rounded-2xl p-4 text-white flex items-center gap-3" style={{ background: C.cluster }}>
              <span className="text-2xl">🧮</span>
              <p className="text-[12.5px]">In the thinking quiz you got <b>{p.analyticalScore.correct} out of {p.analyticalScore.total}</b> correct. Nice reasoning!</p>
            </div>
          )}
        </Page>

        {/* ---------- PAGE 10 · CAREER CLUSTERS ---------- */}
        <Page n={10} name={p.name}>
          <H color={C.cluster}>Your Career Clusters 🗂️</H>
          <p className="text-[12px] text-ink-3 mb-3">A cluster is a family of careers that need similar skills. These are the best families for you to explore.</p>
          <ZoneChart data={p.clusters} color={C.cluster} labelWidth={170} />
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {p.clusters.slice(0, 4).map((b, i) => (
              <div key={b.key} className="rounded-xl border border-line p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center" style={{ background: PALETTE[i % PALETTE.length] }}>{i + 1}</span>
                  <p className="text-[12px] font-extrabold text-ink">{b.label}</p>
                  <span className="ml-auto text-[11px] font-bold" style={{ color: C.cluster }}>{b.percent}%</span>
                </div>
                <Bullets color={C.cluster} items={clusterDesc(b.label)} />
              </div>
            ))}
          </div>
        </Page>

        {/* ---------- PAGE 11 · SUBJECTS ---------- */}
        <Page n={11} name={p.name}>
          <H color={C.interest}>Best Subjects / Streams for you 📚</H>
          <p className="text-[12px] text-ink-3 mb-3">Based on your interests and skills, these streams suit you best. Higher % = a better fit.</p>
          <div className="grid grid-cols-2 gap-3">
            {streams.map((st, i) => (
              <div key={st.name} className="rounded-2xl border border-line p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{st.icon}</span>
                  <p className="text-[13px] font-extrabold text-ink">{i + 1}. {st.name}</p>
                  <span className="ml-auto text-[12px] font-extrabold" style={{ color: PALETTE[i % PALETTE.length] }}>{st.percent}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-line-2 overflow-hidden mb-2">
                  <div className="h-full rounded-full" style={{ width: `${st.percent}%`, background: PALETTE[i % PALETTE.length] }} />
                </div>
                <p className="text-[10px] font-bold uppercase mb-0.5" style={{ color: RED }}>Core subjects</p>
                <p className="text-[11px] text-ink-2 mb-1.5">{st.mandatory.join(' · ')}</p>
                <p className="text-[10px] font-bold uppercase text-ink-4 mb-0.5">Good options</p>
                <p className="text-[11px] text-ink-2">{st.optional.join(' · ')}</p>
              </div>
            ))}
          </div>
        </Page>

        {/* ---------- PAGE 12 · BEST-FIT CAREERS ---------- */}
        <Page n={12} name={p.name}>
          <H color={C.skill}>Your Best-Fit Careers 🚀</H>
          {hasRecommendations ? (
            <>
              <p className="text-[12px] text-ink-3 mb-3">Putting it all together, these careers match you best. The bar shows how strong the match is.</p>
              <div className="space-y-2">
                {p.topCareers.slice(0, 6).map((c, i) => (
                  <div key={c.title} className="flex items-center gap-3 p-2.5 rounded-2xl border border-line">
                    <span className="w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0" style={{ background: PALETTE[i % PALETTE.length] }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-ink text-[13px]">{c.title}</p>
                      <p className="text-[10.5px] text-ink-4 truncate">{c.roles} · {c.cluster}</p>
                    </div>
                    <div className="w-32 shrink-0">
                      <div className="h-2.5 rounded-full bg-line-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${c.match}%`, background: VERDICT_BG[c.verdict] ?? C.skill }} />
                      </div>
                      <p className="text-[10px] font-bold text-right mt-0.5" style={{ color: VERDICT_BG[c.verdict] ?? C.skill }}>{c.match}% match</p>
                    </div>
                    <span className={`text-[9.5px] font-bold px-2 py-1 rounded-full shrink-0 ${VERDICT_STYLE[c.verdict]}`} style={{ background: VERDICT_BG[c.verdict] }}>{c.verdict}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl p-4" style={{ background: `${C.skill}12`, border: `1.5px solid ${C.skill}44` }}>
                <p className="text-[13px] font-extrabold text-ink mb-1">🌟 Your #1 match: {p.topCareers[0]?.title}</p>
                <p className="text-[12px] text-ink-2">{firstName}, your profile fits <b>{p.topCareers[0]?.title}</b> the most ({p.topCareers[0]?.match}% match){p.topCareers[1] ? `, with ${p.topCareers[1].title} and ${p.topCareers[2]?.title} as great backups.` : '.'}</p>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-6 text-[12.5px] text-ink-2 leading-relaxed">Answer the assessment to unlock your best-fit career recommendations.</div>
          )}
        </Page>

        {/* ---------- PAGE 13 · DEEP DIVE ---------- */}
        <Page n={13} name={p.name}>
          {hasRecommendations && detail && chosenCareer ? (
            <>
              <H color={C.cluster}>A closer look: {chosenTitle}</H>
              <p className="text-[12px] text-ink-3 mb-3">{chosenCareer.cluster} · {chosenCareer.education} · {chosenCareer.salary}</p>
              <p className="text-[12px] font-extrabold text-ink mb-1.5">What you would do 👩‍💻</p>
              <Bullets color={C.cluster} items={detail.workNature.slice(0, 4)} />
              <p className="text-[12px] font-extrabold text-ink mt-4 mb-2">Your road map 🗺️</p>
              <div className="grid grid-cols-2 gap-2.5">
                <RoadCard title="Graduation" items={detail.roadmap.graduation} color={C.skill} />
                <RoadCard title="Post-graduation" items={detail.roadmap.postGraduation} color={C.motivator} />
                <RoadCard title="Certifications" items={detail.roadmap.certifications} color={C.interest} />
                <RoadCard title="Jobs you can do" items={detail.roadmap.occupations} color={C.intelligence} />
              </div>
              <p className="text-[12px] font-extrabold text-ink mt-4 mb-1.5">How pay grows over time 💰</p>
              <div className="space-y-1.5">
                {salary.map((s, i) => (
                  <div key={s.level}>
                    <div className="flex justify-between text-[10.5px] text-ink-3"><span>{s.level}</span><span className="font-bold text-ink">{toLakhs(s.amount)}</span></div>
                    <div className="h-2 rounded-full bg-line-2 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.max(12, Math.round((s.amount / maxSalary) * 100))}%`, background: i === 0 ? C.skill : C.cluster }} /></div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <H color={C.cluster}>A closer look at your path</H>
              <div className="rounded-2xl border border-dashed border-line p-6 text-[12.5px] text-ink-2">Complete the assessment to unlock a detailed career deep-dive with road map and salary growth.</div>
            </>
          )}
        </Page>

        {/* ---------- PAGE 14 · NEXT STEPS + SUMMARY ---------- */}
        <Page n={14} name={p.name}>
          <H color={C.skill}>Your action plan ✅</H>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl border border-line p-4">
              <p className="text-[12px] font-extrabold text-ink mb-2 flex items-center gap-1.5"><TrendingUp className="w-4 h-4" style={{ color: C.interest }} /> Things to work on</p>
              <Bullets color={C.interest} items={p.gaps} />
            </div>
            <div className="rounded-2xl border border-line p-4">
              <p className="text-[12px] font-extrabold text-ink mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" style={{ color: C.skill }} /> Your next steps</p>
              <Bullets color={C.skill} items={p.nextSteps} />
            </div>
          </div>

          <p className="text-[12px] font-extrabold text-ink mb-2">Your report at a glance</p>
          <div className="rounded-2xl border border-line divide-y divide-line mb-4">
            <SumRow emoji="🧩" label="Personality" value={`${p.mbtiType} · ${p.mbtiAxes.map((a) => a.dominant).join(', ')}`} />
            <SumRow emoji="🎯" label="Top interests" value={p.topInterests.join(', ')} />
            <SumRow emoji="💡" label="Top intelligence" value={p.dominantIntelligence ?? '—'} />
            <SumRow emoji="🛠️" label="Skills" value={`Overall ${p.overallSkills}% · ${p.skills[0]?.label} strongest`} />
            <SumRow emoji="🧠" label="Learning style" value={p.dominantLearning} />
            <SumRow emoji="🗂️" label="Top clusters" value={p.clusters.slice(0, 3).map((c) => c.label).join(', ')} />
          </div>

          <div className="rounded-2xl p-5 text-white flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${C.personality}, ${C.motivator})` }}>
            <div>
              <p className="font-extrabold text-sm">Want a real person to guide you? 🤝</p>
              <p className="text-xs text-white/80">Talk to a OneGrasp career coach to build your plan.</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-2 rounded-lg"><Phone className="w-3.5 h-3.5" /> 8977760443</span>
              <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-2 rounded-lg"><Mail className="w-3.5 h-3.5" /> support@onegrasp.com</span>
            </div>
          </div>
          <p className="text-[10px] text-ink-4 mt-3 text-center">Generated {generated} · OneGrasp Career Counselling · Every number comes from your own answers.</p>
        </Page>

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

function StatCard({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-line p-4 text-center" style={{ background: `${color}0D` }}>
      <div className="text-2xl mb-1">{emoji}</div>
      <p className="text-[10px] uppercase tracking-wide text-ink-4">{label}</p>
      <p className="text-[16px] font-extrabold" style={{ color }}>{value}</p>
    </div>
  );
}

function RoadCard({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div className="rounded-xl border border-line overflow-hidden">
      <div className="px-3 py-1 text-[10px] font-bold text-white" style={{ background: color }}>{title}</div>
      <ul className="px-3 py-2 space-y-0.5">{items.slice(0, 4).map((t) => <li key={t} className="text-[11px] text-ink-2">• {t}</li>)}</ul>
    </div>
  );
}

function SumRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_2fr] gap-3 px-4 py-2.5 items-start">
      <p className="text-[12px] font-bold text-ink flex items-center gap-1.5"><span>{emoji}</span>{label}</p>
      <p className="text-[12px] text-ink-2">{value}</p>
    </div>
  );
}

/* personality axis → dominant letter */
function letterFor(a: { axis: string; dominant: string }) {
  switch (a.axis) {
    case 'EI': return a.dominant === 'Extrovert' ? 'E' : 'I';
    case 'SN': return a.dominant === 'Sensing' ? 'S' : 'N';
    case 'TF': return a.dominant === 'Thinking' ? 'T' : 'F';
    default: return a.dominant === 'Judging' ? 'J' : 'P';
  }
}
const DIMS = [
  { axis: 'EI', title: 'Where you get your energy' },
  { axis: 'SN', title: 'How you take in information' },
  { axis: 'TF', title: 'How you make decisions' },
  { axis: 'JP', title: 'How you plan your world' },
] as const;

/* ----------------------------- content maps ----------------------------- */

const EXTRA_PERSONALITY: Record<string, string[]> = {
  I: ['You recharge with quiet time and think before you speak.'],
  E: ['You recharge around people and think out loud.'],
  S: ['You trust facts, details and real experience.'],
  N: ['You love ideas, patterns and big-picture thinking.'],
  T: ['You decide with logic and fairness.'],
  F: ['You decide by caring about people and values.'],
  J: ['You like clear plans, lists and finishing on time.'],
  P: ['You stay flexible and enjoy keeping your options open.'],
};
const DEV_PERSONALITY: Record<string, string[]> = {
  I: ['Share one idea aloud in class daily.', 'Try a study buddy now and then.'],
  E: ['Pause and listen fully before replying.', 'Try 15 minutes of solo focus daily.'],
  S: ['Try one “what if” brainstorm weekly.', 'Link facts into the bigger picture.'],
  N: ['Write down concrete facts and steps.', 'Finish one idea before the next.'],
  T: ['Ask how a choice affects people too.', 'Praise teammates when they do well.'],
  F: ['Look at the facts before deciding.', 'Practise honest, kind feedback.'],
  J: ['Leave room in plans for surprises.', 'Try one spontaneous activity weekly.'],
  P: ['Use a simple daily to-do list.', 'Set small deadlines for yourself.'],
};

const INTEREST_DESC: Record<string, string[]> = {
  Realistic: ['You enjoy hands-on, practical work with tools, machines or the outdoors.', 'You like things you can build and touch.'],
  Investigative: ['You are curious and love research and problem-solving.', 'You enjoy ideas, data and how things work.'],
  Artistic: ['You are creative, expressive and imaginative.', 'You enjoy design, writing and original work.'],
  Social: ['You enjoy helping, teaching and working with people.', 'You value teamwork and making a difference.'],
  Enterprising: ['You like leading, persuading and getting things done.', 'You enjoy taking charge and starting things.'],
  Conventional: ['You are organised, careful and reliable.', 'You enjoy clear, structured work with data.'],
};

const LEARNING_TIPS: Record<string, string[]> = {
  'Auditory Learning': ['Study in groups and talk topics out loud.', 'Record notes and replay them.', 'Use audiobooks and recite key facts.'],
  'Visual Learning': ['Turn notes into mind-maps and flowcharts.', 'Use colour and highlighting.', 'Watch demo videos.'],
  'Read & Write Learning': ['Rewrite notes in your own words.', 'Make lists and summaries.', 'Practise with written questions.'],
  'Kinesthetic Learning': ['Learn by doing experiments and models.', 'Take movement breaks while studying.', 'Use real examples and projects.'],
};
