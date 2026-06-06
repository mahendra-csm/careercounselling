'use client';

import { useState } from 'react';
import { Library, ExternalLink } from 'lucide-react';
import ModuleShell, { Card, Pill } from '@/components/dashboard/ModuleShell';
import { CAREER_LIBRARY } from '@/constants/catalog';

export default function Page() {
  const [q, setQ] = useState('');
  const rows = CAREER_LIBRARY.filter((c) =>
    (c.title + c.cluster + c.skills.join(' ')).toLowerCase().includes(q.toLowerCase()));

  return (
    <ModuleShell title="Career Library" icon={Library} accent="violet"
      description="Explore 3,000+ careers. Below is a curated set with what the work involves, key skills, the education path and indicative salary.">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search careers (e.g. doctor, designer, finance)…"
        className="w-full mb-4 px-4 py-2.5 rounded-xl border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
      <div className="grid sm:grid-cols-2 gap-4">
        {rows.map((c) => (
          <Card key={c.title} className="p-5">
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-bold text-ink">{c.title}</p>
              <Pill>{c.cluster}</Pill>
            </div>
            <p className="text-sm text-ink-3 mb-3">{c.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {c.skills.map((s) => <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-line-2 text-ink-2">{s}</span>)}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs mb-3">
              <span className="text-ink-2"><b className="text-ink-4 font-semibold">Path:</b> {c.education}</span>
              <span className="text-success font-bold">{c.salary}</span>
            </div>

            <div className="rounded-xl bg-bg border border-line p-3 mb-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-4 mb-2">How to get started</p>
              <ol className="space-y-1.5">
                {c.steps.map((s, i) => (
                  <li key={s} className="flex gap-2 text-xs text-ink-2">
                    <span className="w-4 h-4 shrink-0 rounded-full bg-red text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-wrap gap-2">
              {c.resources.map((r) => (
                <a key={r.url} href={r.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-red bg-red-soft px-2.5 py-1 rounded-full hover:bg-red hover:text-white transition-colors">
                  {r.label} <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </Card>
        ))}
      </div>
      {rows.length === 0 && <p className="text-sm text-ink-4 py-6 text-center">No careers match “{q}”.</p>}
    </ModuleShell>
  );
}
