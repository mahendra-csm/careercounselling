'use client';

import { useMemo, useState } from 'react';
import { Briefcase, ExternalLink, BookOpen, FlaskConical, Trophy, Wrench, Building2, type LucideIcon } from 'lucide-react';
import ModuleShell, { Card } from '@/components/dashboard/ModuleShell';
import { VIRTUAL_INTERNSHIPS, type ProgramType } from '@/constants/catalog';

const CLASSES = [6, 7, 8, 9, 10, 11, 12];

const TYPE_STYLE: Record<ProgramType, string> = {
  'Job Simulation': 'bg-red-soft text-red',
  Course: 'bg-blue-50 text-blue-600',
  Research: 'bg-purple-50 text-purple-600',
  Competition: 'bg-amber-50 text-amber-600',
  'Hands-on': 'bg-green-50 text-green-600',
  Internship: 'bg-teal-50 text-teal-600',
};

const TYPE_ICON: Record<ProgramType, LucideIcon> = {
  'Job Simulation': Briefcase, Course: BookOpen, Research: FlaskConical,
  Competition: Trophy, 'Hands-on': Wrench, Internship: Building2,
};
const TYPE_GRAD: Record<ProgramType, string> = {
  'Job Simulation': 'linear-gradient(135deg,#E0242E,#9B1B22)',
  Course: 'linear-gradient(135deg,#2D7FF0,#1B4F9B)',
  Research: 'linear-gradient(135deg,#9B51E0,#5B2E94)',
  Competition: 'linear-gradient(135deg,#F59E0B,#B45309)',
  'Hands-on': 'linear-gradient(135deg,#27AE60,#176B3A)',
  Internship: 'linear-gradient(135deg,#11998E,#0A5E58)',
};

export default function Page() {
  const [cls, setCls] = useState<number | 'all'>('all');

  const rows = useMemo(
    () => VIRTUAL_INTERNSHIPS.filter((p) => cls === 'all' || (cls >= p.minGrade && cls <= p.maxGrade)),
    [cls]
  );

  return (
    <ModuleShell title="Virtual Internships" icon={Briefcase} accent="blue"
      description="Free virtual internships, job simulations and skill programs you can do online — picked for Class 6 to 12. Filter by your class and open the official page to start.">

      {/* class filter */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-sm font-semibold text-ink-2 mr-1">Your class:</span>
        <button onClick={() => setCls('all')}
          className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${cls === 'all' ? 'bg-red text-white border-red' : 'bg-white text-ink-2 border-line hover:border-red-line'}`}>
          All
        </button>
        {CLASSES.map((c) => (
          <button key={c} onClick={() => setCls(c)}
            className={`w-10 py-1.5 rounded-full text-sm font-semibold border transition-colors ${cls === c ? 'bg-red text-white border-red' : 'bg-white text-ink-2 border-line hover:border-red-line'}`}>
            {c}
          </button>
        ))}
      </div>

      <p className="text-xs text-ink-4 mb-4">{rows.length} program{rows.length === 1 ? '' : 's'}{cls !== 'all' ? ` for Class ${cls}` : ''} · all free</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((p) => {
          const Icon = TYPE_ICON[p.type];
          return (
          <a key={p.title + p.provider} href={p.url} target="_blank" rel="noreferrer" className="group">
            <Card className="p-5 h-full flex flex-col hover:border-red-line hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm shrink-0" style={{ background: TYPE_GRAD[p.type] }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ExternalLink className="w-4 h-4 text-ink-4 group-hover:text-red transition-colors shrink-0" />
              </div>
              <span className={`self-start text-[11px] font-semibold px-2 py-0.5 rounded-full mb-1.5 ${TYPE_STYLE[p.type]}`}>{p.type}</span>
              <p className="font-bold text-ink text-sm leading-snug">{p.title}</p>
              <p className="text-xs text-ink-4 mt-0.5">{p.provider} · {p.domain}</p>
              <div className="flex-1" />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                <span className="text-[11px] font-semibold text-ink-2 bg-line-2 px-2 py-0.5 rounded-full">Class {p.minGrade}–{p.maxGrade}</span>
                <span className="text-[11px] text-ink-4">{p.effort}</span>
              </div>
            </Card>
          </a>
          );
        })}
      </div>

      {rows.length === 0 && <p className="text-sm text-ink-4 py-8 text-center">No programs for this class yet — try “All”.</p>}

      <p className="text-[11px] text-ink-4 mt-6 leading-relaxed">
        All links go to the official program pages. Programs are free; some (e.g. NASA, Smithsonian) are application-based and may have age/region eligibility — always check the official page. Younger students should do guided programs with a parent or teacher.
      </p>
    </ModuleShell>
  );
}
