'use client';

/**
 * Mindler-style "Best-Fit Career Matches" panel for the dashboard.
 * A selectable row of the student's top career cards → a short blurb plus a
 * "Your Career Fit" panel that breaks the match into Interest / Personality /
 * Aptitude / Emotional Quotient / Learning bars, all derived from the saved
 * psychometric profile (no invented numbers).
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, MessageCircle, Cpu, HeartPulse, Landmark, Palette,
  Briefcase, Wrench, GraduationCap, Megaphone, Calculator, Users, Plane,
  Sparkles, type LucideIcon,
} from 'lucide-react';
import { CAREERS, clamp, type PsychometricProfile } from '@/lib/psychometric';

/** Pick an icon + gradient for a career by its cluster keyword. */
function clusterVisual(cluster: string, title: string): { icon: LucideIcon; from: string; to: string } {
  const s = `${cluster} ${title}`.toLowerCase();
  const has = (...k: string[]) => k.some((x) => s.includes(x));
  if (has('information', 'it', 'software', 'data', 'ai', 'tech')) return { icon: Cpu, from: '#2D7FF0', to: '#1B4F9B' };
  if (has('health', 'medic', 'doctor', 'care', 'nurse')) return { icon: HeartPulse, from: '#EB5757', to: '#9B1B22' };
  if (has('govern', 'legal', 'law', 'civil', 'admin')) return { icon: Landmark, from: '#1B3148', to: '#0B1A29' };
  if (has('art', 'media', 'design', 'communication', 'film')) return { icon: Palette, from: '#9B51E0', to: '#5B2E94' };
  if (has('business', 'management', 'entrepreneur', 'product')) return { icon: Briefcase, from: '#11998E', to: '#0A5E58' };
  if (has('engineer', 'mechanic', 'manufactur', 'logistic')) return { icon: Wrench, from: '#F2994A', to: '#B45309' };
  if (has('education', 'teach', 'train')) return { icon: GraduationCap, from: '#2D9CDB', to: '#1B6491' };
  if (has('marketing', 'advertis', 'sales')) return { icon: Megaphone, from: '#E0242E', to: '#7E1218' };
  if (has('account', 'finance', 'bank', 'invest')) return { icon: Calculator, from: '#27AE60', to: '#176B3A' };
  if (has('human', 'service', 'counsel', 'social', 'hr')) return { icon: Users, from: '#6E5A9E', to: '#3F3168' };
  if (has('hospital', 'tourism', 'aviation', 'travel')) return { icon: Plane, from: '#0EA5A0', to: '#0A6E6A' };
  return { icon: Sparkles, from: '#3F6CA0', to: '#1B3148' };
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

type FitBar = { label: string; value: number };

/** Per-dimension fit for one career, grounded in the real profile. */
function fitFor(profile: PsychometricProfile, careerTitle: string, cluster: string, match: number): FitBar[] {
  const def = CAREERS.find((c) => c.title === careerTitle);

  // Interest — how strongly the matching cluster scored for this student.
  const clusterPct = profile.clusters?.find(
    (c) => c.label.toLowerCase() === cluster.toLowerCase(),
  )?.percent;
  const interest = clamp(clusterPct ?? match);

  // Aptitude — average of this career's key skills (fallback: overall skills).
  const skillPct = def
    ? avg(def.skills.map((sk) => profile.skills.find((s) => s.key === sk)?.percent ?? 0))
    : profile.overallSkills;
  const aptitude = clamp(skillPct || profile.overallSkills);

  // Personality / EQ / Learning — descriptive, profile-wide.
  const personality = clamp(avg(profile.mbtiAxes.map((a) => Math.max(a.leftPct, a.rightPct))));
  const eq = clamp(avg((profile.eq ?? []).map((e) => e.percent)) || match);
  const learning = clamp(Math.max(0, ...((profile.learning ?? []).map((l) => l.percent))) || match);

  return [
    { label: 'Interest', value: interest },
    { label: 'Personality', value: personality },
    { label: 'Aptitude', value: aptitude },
    { label: 'Emotional Quotient', value: eq },
    { label: 'Learning Style', value: learning },
  ];
}

function zone(v: number) {
  return v >= 66 ? { t: 'High', c: '#27AE60' } : v >= 45 ? { t: 'Medium', c: '#F2994A' } : { t: 'Low', c: '#EB5757' };
}

export default function BestFitMatches({ profile, reportHref }: { profile: PsychometricProfile; reportHref: string }) {
  const careers = (profile.topCareers ?? []).slice(0, 5);
  const [active, setActive] = useState(0);

  const current = careers[active];
  const bars = useMemo(
    () => (current ? fitFor(profile, current.title, current.cluster, current.match) : []),
    [profile, current],
  );

  if (!careers.length) return null;

  const cv = current ? clusterVisual(current.cluster, current.title) : clusterVisual('', '');

  return (
    <div className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-line">
        <div>
          <p className="font-bold text-sm text-ink">Your Best-Fit Career Matches</p>
          <p className="text-xs text-ink-4">Top {careers.length} careers ranked from your assessment</p>
        </div>
        <Link href={reportHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red hover:underline">
          Full report <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* career tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-4">
        {careers.map((c, i) => {
          const v = clusterVisual(c.cluster, c.title);
          const Icon = v.icon; const on = i === active;
          return (
            <button key={c.title + i} onClick={() => setActive(i)}
              className={`group rounded-xl border p-3 text-left transition-all ${
                on ? 'border-red bg-red-soft' : 'border-line bg-white hover:border-ink-4/30'
              }`}>
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${v.from}14`, color: v.from }}>
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                <span className={`text-[10px] font-bold ${on ? 'text-red' : 'text-ink-3'}`}>{c.match}%</span>
              </div>
              <p className="mt-2 text-[12px] font-bold leading-tight line-clamp-2 text-ink">{c.title}</p>
              <p className="mt-0.5 text-[10px] text-ink-4 leading-tight">{c.verdict}</p>
            </button>
          );
        })}
      </div>

      {/* selected career detail */}
      {current && (
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5 px-5 pb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                style={{ background: `${cv.from}14`, color: cv.from }}>
                <cv.icon className="w-[18px] h-[18px]" />
              </span>
              <div>
                <p className="font-bold text-ink text-[15px] leading-tight">{current.title}</p>
                <p className="text-[11px] text-ink-4">{current.cluster}</p>
              </div>
            </div>
            <p className="text-xs text-ink-3 leading-relaxed mb-3">
              Roles like <span className="font-semibold text-ink-2">{current.roles}</span>. This came out as a
              {' '}<span className="font-semibold">{current.verdict.toLowerCase()}</span> for you, with an overall
              {' '}<span className="font-semibold text-ink">{current.match}%</span> fit across your interests, skills and personality.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={reportHref} className="inline-flex items-center gap-1.5 bg-red text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-glow">
                Explore this career <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a href="https://wa.me/918977760443" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-bg text-ink-2 text-xs font-semibold px-3.5 py-2 rounded-lg border border-line hover:bg-line-2">
                <MessageCircle className="w-3.5 h-3.5" /> Book a session
              </a>
            </div>
          </div>

          {/* Your Career Fit bars */}
          <div className="rounded-xl border border-line p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-4 mb-3">Your Career Fit</p>
            <div className="space-y-2.5">
              {bars.map((b) => {
                const z = zone(b.value);
                return (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-[11px] font-medium text-ink-2 truncate">{b.label}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-line-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${b.value}%`, background: z.c }} />
                    </div>
                    <span className="w-8 shrink-0 text-right text-[11px] font-bold text-ink">{b.value}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-4 border-t border-line pt-2.5">
              {[['Low', '#EB5757'], ['Medium', '#F2994A'], ['High', '#27AE60']].map(([t, c]) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-ink-4">
                  <span className="h-2 w-2 rounded-full" style={{ background: c as string }} /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
