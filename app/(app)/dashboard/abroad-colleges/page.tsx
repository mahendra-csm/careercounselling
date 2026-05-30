'use client';

import { Globe2 } from 'lucide-react';
import ModuleShell, { Card } from '@/components/dashboard/ModuleShell';
import { ABROAD_COLLEGES } from '@/constants/catalog';

export default function Page() {
  return (
    <ModuleShell title="Abroad Colleges" icon={Globe2}
      description="8,000+ universities across 22+ countries. Below are top global universities with QS rank, indicative tuition and popular courses.">
      <div className="grid sm:grid-cols-2 gap-4">
        {ABROAD_COLLEGES.map((c) => (
          <Card key={c.name} className="p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="font-bold text-ink">{c.name}</p>
                <p className="text-xs text-ink-4">{c.country}</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-soft text-red shrink-0">QS {c.qs}</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span className="text-ink-2"><b className="text-ink-3 font-semibold">Tuition:</b> {c.tuition}</span>
              <span className="text-ink-2"><b className="text-ink-3 font-semibold">Courses:</b> {c.courses}</span>
            </div>
          </Card>
        ))}
      </div>
    </ModuleShell>
  );
}
