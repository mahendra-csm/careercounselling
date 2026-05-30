'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import ModuleShell, { Card } from '@/components/dashboard/ModuleShell';
import { EXAMS } from '@/constants/catalog';

export default function Page() {
  const [q, setQ] = useState('');
  const rows = EXAMS.filter((e) => (e.name + e.full + e.field).toLowerCase().includes(q.toLowerCase()));

  return (
    <ModuleShell title="Exams" icon={FileText}
      description="1,400+ entrance exams for UG, PG and professional courses. Below are the major exams with conducting body, mode and schedule.">
      <Card className="p-4 sm:p-5">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search exams (e.g. JEE, NEET, CAT)…"
          className="w-full mb-4 px-4 py-2.5 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-4 border-b border-line">
                <th className="py-2 pr-3 font-semibold">Exam</th>
                <th className="py-2 pr-3 font-semibold">Level</th>
                <th className="py-2 pr-3 font-semibold">Field</th>
                <th className="py-2 pr-3 font-semibold">Body</th>
                <th className="py-2 pr-3 font-semibold">Mode</th>
                <th className="py-2 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.name} className="border-b border-line-2 hover:bg-bg">
                  <td className="py-2.5 pr-3"><p className="font-bold text-ink">{e.name}</p><p className="text-xs text-ink-4">{e.full}</p></td>
                  <td className="py-2.5 pr-3 text-ink-2">{e.level}</td>
                  <td className="py-2.5 pr-3 text-ink-2">{e.field}</td>
                  <td className="py-2.5 pr-3 text-ink-3">{e.body}</td>
                  <td className="py-2.5 pr-3 text-ink-3">{e.mode}</td>
                  <td className="py-2.5 font-semibold text-red">{e.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="text-sm text-ink-4 py-6 text-center">No exams match “{q}”.</p>}
        </div>
      </Card>
    </ModuleShell>
  );
}
