'use client';

import { useState } from 'react';
import { Building2 } from 'lucide-react';
import ModuleShell, { Card } from '@/components/dashboard/ModuleShell';
import { INDIA_COLLEGES } from '@/constants/catalog';

export default function Page() {
  const [q, setQ] = useState('');
  const rows = INDIA_COLLEGES.filter((c) =>
    (c.name + c.location + c.category).toLowerCase().includes(q.toLowerCase()));

  return (
    <ModuleShell title="India Colleges" icon={Building2}
      description="Explore 10,000+ Indian colleges. Below are top institutes with category, NIRF rank, indicative fees and popular courses.">
      <Card className="p-4 sm:p-5">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, city or stream…"
          className="w-full mb-4 px-4 py-2.5 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-4 border-b border-line">
                <th className="py-2 pr-3 font-semibold">College</th>
                <th className="py-2 pr-3 font-semibold">Category</th>
                <th className="py-2 pr-3 font-semibold">Type</th>
                <th className="py-2 pr-3 font-semibold">NIRF</th>
                <th className="py-2 pr-3 font-semibold">Fees</th>
                <th className="py-2 font-semibold">Top courses</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.name} className="border-b border-line-2 hover:bg-bg">
                  <td className="py-2.5 pr-3"><p className="font-bold text-ink">{c.name}</p><p className="text-xs text-ink-4">{c.location}</p></td>
                  <td className="py-2.5 pr-3 text-ink-2">{c.category}</td>
                  <td className="py-2.5 pr-3 text-ink-3">{c.type}</td>
                  <td className="py-2.5 pr-3 font-semibold text-red">{c.nirf}</td>
                  <td className="py-2.5 pr-3 text-ink-2">{c.fees}</td>
                  <td className="py-2.5 text-ink-3">{c.courses}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="text-sm text-ink-4 py-6 text-center">No colleges match “{q}”.</p>}
        </div>
      </Card>
    </ModuleShell>
  );
}
