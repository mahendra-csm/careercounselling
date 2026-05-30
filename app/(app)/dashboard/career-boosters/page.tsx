'use client';

import { Rocket, BookOpen, Award, Briefcase } from 'lucide-react';
import ModuleShell, { Card } from '@/components/dashboard/ModuleShell';
import { BOOSTER_COURSES, SCHOLARSHIPS, INTERNSHIPS } from '@/constants/catalog';

export default function Page() {
  return (
    <ModuleShell title="Career Boosters" icon={Rocket}
      description="Online courses, scholarships and virtual internships to get ahead — all in your Career Lab.">

      <div className="flex items-center gap-2 mb-3"><BookOpen className="w-4 h-4 text-red" /><h3 className="font-bold text-ink">Online Courses</h3></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {BOOSTER_COURSES.map((c) => (
          <Card key={c.title} className="p-5">
            <p className="font-bold text-ink text-sm mb-1">{c.title}</p>
            <p className="text-xs text-ink-4 mb-2">{c.provider}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-full bg-red-soft text-red font-semibold">{c.level}</span>
              <span className="text-ink-3">{c.duration}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3"><Award className="w-4 h-4 text-red" /><h3 className="font-bold text-ink">Scholarships</h3></div>
          <Card className="divide-y divide-line">
            {SCHOLARSHIPS.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-4">
                <div><p className="font-bold text-ink text-sm">{s.name}</p><p className="text-xs text-ink-4">{s.for}</p></div>
                <span className="text-xs font-bold text-success shrink-0">{s.amount}</span>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3"><Briefcase className="w-4 h-4 text-red" /><h3 className="font-bold text-ink">Virtual Internships</h3></div>
          <Card className="divide-y divide-line">
            {INTERNSHIPS.map((i) => (
              <div key={i.brand} className="flex items-center justify-between p-4">
                <div><p className="font-bold text-ink text-sm">{i.brand}</p><p className="text-xs text-ink-4">{i.domain}</p></div>
                <span className="text-xs font-semibold text-ink-3 shrink-0">{i.duration}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </ModuleShell>
  );
}
