'use client';

import { useState } from 'react';
import { Library } from 'lucide-react';
import ModuleShell, { Card, Pill } from '@/components/dashboard/ModuleShell';
import { CAREER_LIBRARY } from '@/constants/catalog';

export default function Page() {
  const [q, setQ] = useState('');
  const rows = CAREER_LIBRARY.filter((c) =>
    (c.title + c.cluster + c.skills.join(' ')).toLowerCase().includes(q.toLowerCase()));

  return (
    <ModuleShell title="Career Library" icon={Library}
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
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
              <span className="text-ink-2"><b className="text-ink-4 font-semibold">Path:</b> {c.education}</span>
              <span className="text-success font-bold">{c.salary}</span>
            </div>
          </Card>
        ))}
      </div>
      {rows.length === 0 && <p className="text-sm text-ink-4 py-6 text-center">No careers match “{q}”.</p>}
    </ModuleShell>
  );
}
