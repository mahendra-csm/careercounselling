'use client';

import { BarChart3, Briefcase, Map, MessageSquare, Users, Brain, TrendingUp } from 'lucide-react';

const SECTIONS = [
  { id: 'summary', label: 'Summary', icon: BarChart3 },
  { id: 'skills', label: 'Skill Snapshot', icon: BarChart3 },
  { id: 'opportunity', label: 'Opportunity', icon: TrendingUp },
  { id: 'jobs', label: 'Job Matches', icon: Briefcase },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'competitive', label: 'Competitive', icon: Users },
  { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
  { id: 'personality', label: 'Insights', icon: Brain },
];

interface Props {
  activeSection: string;
}

export default function ReportSidebar({ activeSection }: Props) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="hidden lg:flex flex-col w-[240px] fixed left-[260px] top-0 bottom-0 border-r border-line bg-surface/80 backdrop-blur-sm py-8 px-3 z-10">
      <p className="text-xs font-semibold text-ink-4 uppercase tracking-widest px-3 mb-3">Report sections</p>
      <nav className="space-y-0.5">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const active = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                active
                  ? 'bg-red-soft text-red'
                  : 'text-ink-3 hover:bg-line-2 hover:text-ink'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-red' : ''}`} />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
