'use client';

import { Plane } from 'lucide-react';
import ModuleShell, { Card } from '@/components/dashboard/ModuleShell';
import { ABROAD_STEPS, ABROAD_TESTS, ABROAD_COUNTRIES } from '@/constants/catalog';

export default function Page() {
  return (
    <ModuleShell title="Abroad Applications" icon={Plane}
      description="Study-abroad profiling in 15 min with SOP, document and visa assistance. Here’s the process, the tests you’ll need and popular destinations.">

      <h3 className="font-bold text-ink mb-3">The 6-step process</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {ABROAD_STEPS.map((s) => (
          <Card key={s.step} className="p-5">
            <span className="w-8 h-8 rounded-full bg-red text-white text-sm font-bold flex items-center justify-center mb-3">{s.step}</span>
            <p className="font-bold text-ink text-sm mb-1">{s.title}</p>
            <p className="text-xs text-ink-3">{s.detail}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-ink mb-3">Tests you may need</h3>
          <Card className="divide-y divide-line">
            {ABROAD_TESTS.map((t) => (
              <div key={t.name} className="flex items-center justify-between p-4">
                <div><p className="font-bold text-ink text-sm">{t.name}</p><p className="text-xs text-ink-4">{t.purpose}</p></div>
                <span className="text-xs font-semibold text-ink-3">Valid {t.validity}</span>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <h3 className="font-bold text-ink mb-3">Popular destinations</h3>
          <Card className="divide-y divide-line">
            {ABROAD_COUNTRIES.map((c) => (
              <div key={c.country} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-ink text-sm">{c.country}</p>
                  <span className="text-xs font-semibold text-red">{c.cost}</span>
                </div>
                <p className="text-xs text-ink-4 mt-0.5">Intakes: {c.intakes} · {c.highlight}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </ModuleShell>
  );
}
