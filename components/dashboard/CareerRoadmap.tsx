'use client';

/**
 * Mindler-style "Your Career Roadmap" card for the dashboard.
 * A 5-stage planning stepper (Discover → Colleges → Exams → Build → Finalise)
 * that links into the dashboard modules, plus the concrete roadmap for the
 * student's #1 recommended domain — degrees, skills, starter projects and
 * future scope, pulled from DOMAIN_ROADMAP + the report's own next steps.
 */

import Link from 'next/link';
import {
  Compass, Building2, FileText, Rocket, Flag, ArrowRight, GraduationCap,
  Wrench, Lightbulb, TrendingUp, type LucideIcon,
} from 'lucide-react';
import type { PsychometricProfile } from '@/lib/psychometric';
import { roadmapFor } from '@/lib/career-roadmap';

type Stage = { label: string; icon: LucideIcon; href: string };
const STAGES: Stage[] = [
  { label: 'Discover', icon: Compass, href: '/dashboard/career-analysis' },
  { label: 'Colleges', icon: Building2, href: '/dashboard/india-colleges' },
  { label: 'Exams', icon: FileText, href: '/dashboard/exams' },
  { label: 'Build profile', icon: Rocket, href: '/dashboard/career-boosters' },
  { label: 'Finalise', icon: Flag, href: '/dashboard/career-planner' },
];

export default function CareerRoadmap({ profile, reportHref }: { profile: PsychometricProfile; reportHref: string }) {
  const top = profile.domainFitments?.[0];
  const roadmap = top ? roadmapFor(top.key) : undefined;
  const steps = (profile.nextSteps ?? []).slice(0, 3);

  // "Discover" is done once a report exists; the rest are upcoming.
  const doneIdx = 0;

  return (
    <div className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-line">
        <div>
          <p className="font-bold text-sm text-ink">Your Career Roadmap</p>
          <p className="text-xs text-ink-4">
            {top ? <>A step-by-step plan towards <span className="font-semibold text-ink-2">{top.label}</span></> : 'Your step-by-step career plan'}
          </p>
        </div>
        <Link href={reportHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red hover:underline">
          Full report <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* stage stepper */}
      <div className="px-5 pt-5">
        <div className="relative">
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-line-2" />
          <div className="absolute left-0 top-5 h-0.5 bg-red" style={{ width: `${(doneIdx / (STAGES.length - 1)) * 100}%` }} />
          <div className="relative grid grid-cols-5 gap-1">
            {STAGES.map((s, i) => {
              const Icon = s.icon; const done = i <= doneIdx;
              return (
                <Link key={s.label} href={s.href} className="group flex flex-col items-center gap-1.5 text-center">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    done ? 'border-red bg-red text-white' : 'border-line-2 bg-white text-ink-4 group-hover:border-red group-hover:text-red'
                  }`}>
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className={`text-[10.5px] font-semibold leading-tight ${done ? 'text-ink' : 'text-ink-4 group-hover:text-ink'}`}>{s.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* domain roadmap detail */}
      {roadmap && top && (
        <div className="grid sm:grid-cols-2 gap-3 p-5">
          <RoadCard icon={GraduationCap} title="Degrees to aim for" tone="#2D7FF0" items={roadmap.degrees.slice(0, 3)} />
          <RoadCard icon={Wrench} title="Skills to build" tone="#27AE60" items={roadmap.skills.slice(0, 3)} />
          <RoadCard icon={Lightbulb} title="Starter projects" tone="#F2994A" items={roadmap.projects.slice(0, 3)} />
          <div className="rounded-xl border border-line p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: '#6E5A9E18', color: '#6E5A9E' }}>
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
              <p className="text-[12px] font-bold text-ink">Future scope</p>
            </div>
            <p className="text-[11.5px] text-ink-3 leading-relaxed">{roadmap.scope}</p>
          </div>
        </div>
      )}

      {/* concrete next steps from the report */}
      {steps.length > 0 && (
        <div className="border-t border-line px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-4 mb-2.5">Your next steps</p>
          <ul className="space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-soft text-[10px] font-bold text-red">{i + 1}</span>
                <span className="text-[12.5px] text-ink-2 leading-snug">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RoadCard({ icon: Icon, title, tone, items }: { icon: LucideIcon; title: string; tone: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: `${tone}18`, color: tone }}>
          <Icon className="w-3.5 h-3.5" />
        </span>
        <p className="text-[12px] font-bold text-ink">{title}</p>
      </div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[11.5px] text-ink-3 leading-snug">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: tone }} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
