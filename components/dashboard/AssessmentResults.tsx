'use client';

/**
 * Mindler-style "My Assessment Results" panel for the dashboard.
 * Head-icon tabs (Interests / Personality / Motivators / Learning /
 * Intelligences / Aptitude / EQ) → a Low-Medium-High bar chart per lens,
 * built from the student's saved psychometric profile.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Palette, Compass, Flame, BookOpen, Brain, Calculator, Heart, ArrowRight, type LucideIcon } from 'lucide-react';
import type { PsychometricProfile } from '@/lib/psychometric';

type Item = { label: string; value: number };
type Tab = { id: string; label: string; icon: LucideIcon; color: string; soft: string; blurb: string; bars: Item[] };

function zoneOf(v: number) {
  return v >= 66 ? 'High' : v >= 45 ? 'Medium' : 'Low';
}

/**
 * Ranked gauge rows. Each trait sits on a Low|Medium|High track with a position
 * marker (lollipop) at its score — strongest first, with the leader highlighted.
 */
function ScaleRows({ items, color, soft }: { items: Item[]; color: string; soft: string }) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const top = sorted[0];

  return (
    <div>
      {top && (
        <div className="mb-4 flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: soft }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-extrabold text-white" style={{ background: color }}>
            {top.value}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-4">Strongest in this area</p>
            <p className="truncate text-[14px] font-bold text-ink">{top.label}</p>
          </div>
          <span className="ml-auto rounded-full bg-white px-2.5 py-1 text-[10px] font-bold" style={{ color }}>{zoneOf(top.value)}</span>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map((it, i) => {
          const lead = i === 0;
          return (
            <div key={it.label} className="flex items-center gap-2.5">
              <span className="w-5 shrink-0 text-center text-[11px] font-bold" style={{ color: lead ? color : '#9B9DA6' }}>{i + 1}</span>
              <span className={`w-28 shrink-0 truncate text-[12px] ${lead ? 'font-bold text-ink' : 'font-medium text-ink-2'}`}>{it.label}</span>
              <div className="relative h-2 flex-1 rounded-full" style={{ background: '#F1F1F4' }}>
                {/* zone dividers at thirds */}
                <span className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-line" style={{ left: '33.33%' }} />
                <span className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-line" style={{ left: '66.66%' }} />
                {/* fill */}
                <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${it.value}%`, background: color, opacity: lead ? 1 : 0.55 }} />
                {/* marker */}
                <span className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
                  style={{ left: `calc(${it.value}% - 7px)`, background: color, opacity: lead ? 1 : 0.85 }} />
              </div>
              <span className="w-8 shrink-0 text-right text-[12px] font-bold text-ink">{it.value}</span>
            </div>
          );
        })}
      </div>

      {/* axis aligned under the tracks */}
      <div className="mt-2 flex items-center gap-2.5">
        <span className="w-5 shrink-0" />
        <span className="w-28 shrink-0" />
        <div className="flex flex-1">
          {['Low', 'Medium', 'High'].map((z) => (
            <span key={z} className="flex-1 text-center text-[9.5px] font-semibold uppercase tracking-wider text-ink-4">{z}</span>
          ))}
        </div>
        <span className="w-8 shrink-0" />
      </div>
    </div>
  );
}

export default function AssessmentResults({ profile, reportHref }: { profile: PsychometricProfile; reportHref: string }) {
  const tabs: Tab[] = [
    { id: 'interests', label: 'Interests', icon: Palette, color: '#F2994A', soft: '#FDF0E6', blurb: 'The work areas and activities that naturally excite and engage you.', bars: profile.interests.map((i) => ({ label: i.label, value: i.percent })) },
    { id: 'personality', label: 'Personality', icon: Compass, color: '#9B51E0', soft: '#F3ECFD', blurb: 'Your consistent behaviour patterns and natural decision style.', bars: profile.mbtiAxes.map((a) => ({ label: a.dominant, value: Math.max(a.leftPct, a.rightPct) })) },
    { id: 'motivators', label: 'Motivators', icon: Flame, color: '#EB5757', soft: '#FDEAEA', blurb: 'The values that keep you satisfied and energised at work.', bars: profile.motivators.map((m) => ({ label: m.label, value: m.percent })) },
    { id: 'learning', label: 'Learning', icon: BookOpen, color: '#2D9CDB', soft: '#E7F4FC', blurb: 'How you absorb and retain new information most efficiently.', bars: profile.learning.map((l) => ({ label: l.label, value: l.percent })) },
    { id: 'intelligences', label: 'Intelligences', icon: Brain, color: '#27AE60', soft: '#E6F6EC', blurb: 'Your strongest natural aptitudes across the intelligences.', bars: (profile.intelligences ?? []).map((i) => ({ label: i.label.split(' (')[0], value: i.percent })) },
    { id: 'aptitude', label: 'Aptitude', icon: Calculator, color: '#2D7FF0', soft: '#E8F1FE', blurb: 'Your measured ability across reasoning and skill areas.', bars: profile.skills.map((s) => ({ label: s.label.replace(' Ability', '').replace(' & Decision Making', ''), value: s.percent })) },
    { id: 'eq', label: 'Emotional Quotient', icon: Heart, color: '#11998E', soft: '#E3F5F2', blurb: 'How well you recognise and manage emotions and relationships.', bars: profile.eq.map((e) => ({ label: e.label, value: e.percent })) },
  ].filter((t) => t.bars.length);

  const [active, setActive] = useState(tabs[0]?.id ?? 'interests');
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-line">
        <div>
          <p className="font-bold text-sm text-ink">My Assessment Results</p>
          <p className="text-xs text-ink-4">From your latest career assessment</p>
        </div>
        <Link href={reportHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red hover:underline">
          Full report <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* head-icon tabs */}
      <div className="grid grid-cols-4 sm:grid-cols-7 border-b border-line">
        {tabs.map((t) => {
          const Icon = t.icon; const on = t.id === active;
          return (
            <button key={t.id} onClick={() => setActive(t.id)}
              className="flex flex-col items-center gap-1.5 py-3 px-1 border-b-2 transition-colors"
              style={{ borderColor: on ? t.color : 'transparent', background: on ? t.soft : 'transparent' }}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: on ? t.color : '#EEF2F8', color: on ? '#fff' : '#6F7E94' }}>
                <Icon style={{ width: 18, height: 18 }} />
              </span>
              <span className="text-[10px] font-semibold leading-tight text-center" style={{ color: on ? t.color : '#6F7E94' }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* selected lens */}
      {tab && (
        <div className="p-5">
          <p className="font-bold text-ink text-[15px] mb-1">Your {tab.label}</p>
          <p className="text-xs text-ink-3 mb-4 max-w-2xl">{tab.blurb}</p>
          <ScaleRows items={tab.bars} color={tab.color} soft={tab.soft} />
        </div>
      )}
    </div>
  );
}
