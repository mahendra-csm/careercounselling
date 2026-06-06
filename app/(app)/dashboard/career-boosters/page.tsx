'use client';

import Link from 'next/link';
import { Rocket, Award, ExternalLink, ArrowRight, Briefcase } from 'lucide-react';
import ModuleShell, { Card } from '@/components/dashboard/ModuleShell';
import { LEARN_PATHS, SCHOLARSHIPS } from '@/constants/catalog';

export default function Page() {
  return (
    <ModuleShell title="Career Boosters" icon={Rocket}
      description="Free, step-by-step learning paths, scholarships and virtual internships to get ahead — every resource below is free and links to the official source.">

      {/* Learn paths */}
      <h3 className="font-bold text-ink mb-1">Free learning paths</h3>
      <p className="text-sm text-ink-3 mb-4">Pick a track and follow the steps — all resources are free.</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {LEARN_PATHS.map((p) => (
          <Card key={p.title} className="p-5 flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-bold text-ink">{p.title}</p>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-soft text-red">{p.tag}</span>
            </div>
            <p className="text-sm text-ink-3 mb-3">{p.blurb}</p>
            <ol className="space-y-1.5 mb-3 flex-1">
              {p.steps.map((s, i) => (
                <li key={s} className="flex gap-2 text-xs text-ink-2">
                  <span className="w-4 h-4 shrink-0 rounded-full bg-red text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-2 pt-3 border-t border-line">
              {p.resources.map((r) => (
                <a key={r.url} href={r.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-red bg-red-soft px-2.5 py-1 rounded-full hover:bg-red hover:text-white transition-colors">
                  {r.label} <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Virtual internships CTA */}
      <Link href="/dashboard/internships" className="block mb-8">
        <Card className="p-5 flex items-center gap-4 hover:border-red-line hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-red-soft flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6 text-red" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ink text-sm">Virtual Internships (Class 6–12)</p>
            <p className="text-xs text-ink-4">Free job simulations & programs from Forage, Google, IBM, NASA and more — filter by your class.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-ink-4 shrink-0" />
        </Card>
      </Link>

      {/* Scholarships */}
      <div className="flex items-center gap-2 mb-3"><Award className="w-4 h-4 text-red" /><h3 className="font-bold text-ink">Scholarships</h3></div>
      <Card className="divide-y divide-line">
        {SCHOLARSHIPS.map((s) => (
          <div key={s.name} className="flex items-center justify-between p-4">
            <div><p className="font-bold text-ink text-sm">{s.name}</p><p className="text-xs text-ink-4">{s.for}</p></div>
            <span className="text-xs font-bold text-success shrink-0">{s.amount}</span>
          </div>
        ))}
      </Card>
    </ModuleShell>
  );
}
