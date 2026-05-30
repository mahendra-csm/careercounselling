'use client';

import { motion } from 'framer-motion';
import { Printer, Phone, Mail, ArrowRight, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import type { PsychometricProfile, Bar } from '@/lib/psychometric';

const RED = '#E0242E';

function BarRow({ label, percent, highlight }: { label: string; percent: number; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-44 shrink-0 text-sm text-ink-2">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-line-2 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: highlight ? RED : '#6C6E78' }}
          initial={{ width: 0 }} whileInView={{ width: `${percent}%` }} viewport={{ once: true }} transition={{ duration: 0.9 }} />
      </div>
      <span className="w-10 text-right text-sm font-bold text-red">{percent}%</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-line rounded-2xl shadow-sm p-6 sm:p-7 break-inside-avoid">
      <h2 className="text-lg font-extrabold text-red border-b border-red-line pb-2 mb-5">{title}</h2>
      {children}
    </section>
  );
}

const VERDICT_STYLE: Record<string, string> = {
  'Top Choice': 'text-red bg-red-soft',
  'Good Choice': 'text-success bg-green-50',
  Optional: 'text-ink-3 bg-line-2',
  Develop: 'text-warning bg-yellow-50',
  Avoid: 'text-ink-4 bg-line-2',
};

export default function PsychometricReport({ profile }: { profile: PsychometricProfile }) {
  const p = profile;
  const generated = new Date(p.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-bg">
      {/* top bar (hidden on print) */}
      <header className="bg-white border-b border-line print:hidden sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/dashboard"><Logo size={30} /></Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 border border-line text-ink-2 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-bg transition-colors">
              <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Back to Dashboard</span><span className="sm:hidden">Dashboard</span>
            </Link>
            <button onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-red text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow">
              <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Save as PDF</span><span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* 1. Cover / summary */}
        <div className="bg-ink text-white rounded-2xl overflow-hidden break-inside-avoid">
          <div className="bg-red px-6 py-3 flex items-center justify-between">
            <div className="bg-white rounded-md px-2 py-1"><Logo size={22} /></div>
            <span className="text-white/90 text-sm">onegrasp.com</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 p-7">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Report prepared for</p>
              <h1 className="text-3xl font-extrabold leading-tight mb-3">{p.name}</h1>
              <div className="inline-block bg-red px-4 py-2 rounded-lg font-bold text-sm mb-5">Career Suitability Report</div>
              <Meta label="Personality Type" value={`${p.mbtiType} — ${p.mbtiAxes.map((a) => a.dominant).join(' · ')}`} />
              <Meta label="Top Interest" value={p.topInterests.slice(0, 2).join(' & ')} />
              <Meta label="Top Motivators" value={p.motivators.slice(0, 3).map((m) => m.label).join(' · ')} />
              <Meta label="Career Focus" value={p.careerFocus} />
            </div>
            <div className="sm:border-l border-white/10 sm:pl-6">
              <p className="text-white/90 font-bold border-b border-red pb-1 mb-4">Assessment Summary</p>
              <Meta label="Report Type" value="Career Suitability Report" />
              <Meta label="Methodology" value="Personality · Interest · EQ · Skills" />
              <Meta label="Readiness" value={`${p.overallScore}/100 — ${p.matchLabel}`} />
              <Meta label="Generated" value={generated} />
              <Meta label="Contact" value="8977760443" />
              <Meta label="Email" value="support@onegrasp.com" />
            </div>
          </div>
        </div>

        {/* 2. Personality */}
        <Section title="Result of the Career Personality">
          <div className="text-center mb-5">
            <span className="inline-block text-3xl font-extrabold text-ink tracking-widest">{p.mbtiType}</span>
            <p className="text-sm text-ink-3 mt-1">{p.mbtiAxes.map((a) => a.dominant).join(' · ')}</p>
          </div>
          <div className="space-y-3 mb-5">
            {p.mbtiAxes.map((a) => (
              <div key={a.axis} className="flex items-center gap-3">
                <span className="w-24 text-right text-xs text-ink-3">{a.left}</span>
                <div className="flex-1 h-3 rounded-full bg-line-2 overflow-hidden flex">
                  <div className="h-full bg-ink-4" style={{ width: `${a.leftPct}%` }} />
                  <div className="h-full bg-red" style={{ width: `${a.rightPct}%` }} />
                </div>
                <span className="w-24 text-xs text-ink-3">{a.right}</span>
                <span className="w-16 text-right text-xs font-bold text-red">{a.dominant.slice(0, 10)}</span>
              </div>
            ))}
          </div>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {p.personalityBullets.slice(0, 8).map((b, i) => (
              <li key={i} className="text-sm text-ink-2 flex gap-2"><span className="text-red">•</span>{b}</li>
            ))}
          </ul>
        </Section>

        {/* 3. Interests */}
        <Section title="Your Career Interest Types">
          <p className="text-sm text-ink-3 mb-4">The Career Interest Assessment measures six broad interest patterns (RIASEC). Your strongest themes shape your best-fit careers.</p>
          {p.interests.map((b, i) => <BarRow key={b.key} label={b.label} percent={b.percent} highlight={i === 0} />)}
          <p className="mt-4 text-sm text-ink-2"><b>Top interests:</b> {p.topInterests.join(', ')}.</p>
        </Section>

        {/* 4. Motivators + learning */}
        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Your Career Motivators">
            {p.motivators.slice(0, 5).map((b, i) => <BarRow key={b.key} label={b.label} percent={b.percent} highlight={i === 0} />)}
          </Section>
          <Section title="Your Learning Style">
            <p className="text-sm text-ink-3 mb-3">Your dominant learning style is <b className="text-ink">{p.dominantLearning}</b>.</p>
            {p.learning.map((b, i) => <BarRow key={b.key} label={b.label} percent={b.percent} highlight={i === 0} />)}
          </Section>
        </div>

        {/* 5. EQ */}
        <Section title="Your Emotional Intelligence (EQ)">
          {p.eq.map((b) => <BarRow key={b.key} label={`${b.label} (${b.level})`} percent={b.percent} highlight={b.level === 'High'} />)}
        </Section>

        {/* 6. Skills & abilities */}
        <Section title="Your Skills & Abilities">
          <div className="inline-block bg-ink text-white text-sm font-bold px-4 py-1.5 rounded-lg mb-4">
            Overall Skills & Abilities — {p.overallSkills}% {p.overallSkills >= 67 ? 'Good' : 'Developing'}
          </div>
          {p.skills.map((b, i) => <BarRow key={b.key} label={`${b.label} (${b.rating})`} percent={b.percent} highlight={i === 0} />)}
        </Section>

        {/* 7. Clusters */}
        <Section title="Your Career Clusters">
          <p className="text-sm text-ink-3 mb-4">Career clusters group similar occupations. These are the best clusters for you to explore.</p>
          {p.clusters.map((b, i) => <BarRow key={b.key} label={b.label} percent={b.percent} highlight={i === 0} />)}
        </Section>

        {/* 8. Top careers — the key deliverable */}
        <Section title="Your Best-Fit Career Paths">
          <p className="text-sm text-ink-3 mb-4">Based on combining your personality, interests, EQ and skills, these careers fit you best.</p>
          <div className="space-y-2.5">
            {p.topCareers.map((c, i) => (
              <div key={c.title} className="flex items-center gap-4 p-3 rounded-xl border border-line">
                <span className="w-7 h-7 rounded-full bg-red text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink text-sm">{c.title}</p>
                  <p className="text-xs text-ink-4">{c.roles} · {c.cluster}</p>
                </div>
                <span className="text-sm font-bold text-ink">{c.match}%</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${VERDICT_STYLE[c.verdict]}`}>{c.verdict}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 bg-red-soft border border-red-line rounded-xl p-4">
            <p className="text-sm font-bold text-ink mb-1">Your top recommendation: {p.topCareers[0]?.title}</p>
            <p className="text-xs text-ink-2">{p.name}, your profile aligns most strongly with <b>{p.topCareers[0]?.title}</b> ({p.topCareers[0]?.match}% match) in the {p.topCareers[0]?.cluster} cluster. {p.topCareers[1] ? `${p.topCareers[1].title} and ${p.topCareers[2]?.title} are strong alternatives.` : ''}</p>
          </div>
        </Section>

        {/* 9. Gap analysis + next steps */}
        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Gap Analysis">
            <ul className="space-y-2">
              {p.gaps.map((g, i) => <li key={i} className="text-sm text-ink-2 flex gap-2"><span className="text-red">•</span>{g}</li>)}
            </ul>
          </Section>
          <Section title="Your Next Steps">
            <ul className="space-y-2">
              {p.nextSteps.map((g, i) => <li key={i} className="text-sm text-ink-2 flex gap-2"><span className="text-success">✓</span>{g}</li>)}
            </ul>
          </Section>
        </div>

        {/* counselling CTA */}
        <div className="bg-white border border-line rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div>
            <p className="font-bold text-ink">Want a human to walk you through this?</p>
            <p className="text-sm text-ink-3">Talk to a OneGrasp career counsellor and lock your execution plan.</p>
          </div>
          <div className="flex gap-3">
            <a href="tel:8977760443" className="inline-flex items-center gap-2 border border-line px-4 py-2.5 rounded-xl text-sm font-semibold text-ink-2"><Phone className="w-4 h-4" /> Call</a>
            <a href="mailto:support@onegrasp.com" className="inline-flex items-center gap-2 bg-red text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-glow"><Mail className="w-4 h-4" /> Email <ArrowRight className="w-4 h-4" /></a>
          </div>
        </div>

        {/* back to dashboard */}
        <div className="flex justify-center pt-2 print:hidden">
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-ink text-white font-semibold px-6 py-3 rounded-xl hover:bg-ink-2 transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Back to Student Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3">
      <p className="text-white/40 text-[11px] uppercase tracking-wide">{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  );
}
