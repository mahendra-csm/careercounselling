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

type Tab = { id: string; label: string; icon: LucideIcon; color: string; soft: string; blurb: string; bars: { label: string; value: number }[] };

const GRID = '#EDF1F7';
const TRACK = '#F5F8FC';

/** Label-inside bars on a Low | Medium | High gridded track (Mindler look). */
function MBars({ items, color }: { items: { label: string; value: number }[]; color: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="relative px-3 py-3">
        <div className="pointer-events-none absolute inset-0 flex px-3">
          <div className="flex-1" style={{ borderRight: `1px solid ${GRID}` }} />
          <div className="flex-1" style={{ borderRight: `1px solid ${GRID}` }} />
          <div className="flex-1" />
        </div>
        <div className="relative space-y-1.5">
          {items.map((it) => (
            <div key={it.label} className="relative h-7 overflow-hidden rounded-[5px]" style={{ background: TRACK }}>
              <div className="flex h-full items-center rounded-[5px] pl-2.5 pr-2" style={{ width: `${Math.max(26, it.value)}%`, background: color }}>
                <span className="truncate text-[11px] font-semibold text-white">{it.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex border-t border-line" style={{ background: TRACK }}>
        {['Low', 'Medium', 'High'].map((z) => (
          <div key={z} className="flex-1 py-1.5 text-center text-[9.5px] font-semibold uppercase tracking-wider text-ink-4">{z}</div>
        ))}
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
          <MBars items={tab.bars} color={tab.color} />
        </div>
      )}
    </div>
  );
}
