'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Brain, Compass, Heart, Wrench, Layers, Target } from 'lucide-react';
import ModuleShell, { Card } from '@/components/dashboard/ModuleShell';
import { getLastReportId, getLocalReport } from '@/lib/report-store';
import type { PsychometricProfile } from '@/lib/psychometric';

const MEASURES = [
  { icon: Brain, title: 'Personality', desc: 'Your 4-letter type (MBTI-style) and how you work best.' },
  { icon: Compass, title: 'Career Interests', desc: 'Your RIASEC profile — the work that genuinely pulls you.' },
  { icon: Heart, title: 'Emotional Intelligence', desc: 'Motivation, empathy and relationship strengths.' },
  { icon: Wrench, title: 'Skills & Abilities', desc: 'Numerical, logical, verbal, leadership and more.' },
  { icon: Layers, title: 'Career Clusters', desc: 'The industry groups that fit your profile best.' },
  { icon: Target, title: 'Best-Fit Careers', desc: 'Your top career paths with match % and verdicts.' },
];

export default function Page() {
  const [report, setReport] = useState<PsychometricProfile | null>(null);

  useEffect(() => {
    const last = getLastReportId();
    if (last) { const r = getLocalReport(last); if (r) setReport(r); }
  }, []);

  return (
    <ModuleShell title="Career Analysis" icon={Search}
      description="A 6-section, 70+ question career assessment that reveals the right career path for your next 20 years."
      action={
        <Link href="/assessment" className="inline-flex items-center gap-2 bg-white text-red font-bold px-5 py-3 rounded-xl shadow-sm shrink-0">
          {report ? 'Retake' : 'Start'} Assessment <ArrowRight className="w-4 h-4" />
        </Link>
      }>

      {report && (
        <Card className="p-5 mb-6">
          <p className="text-xs uppercase tracking-widest text-ink-4 mb-1">Assessment complete</p>
          <p className="text-sm text-ink-2">Thanks for completing your assessment. Our counsellors review each one personally and email your detailed career report to your registered email — it isn&apos;t shown here.</p>
        </Card>
      )}

      <h3 className="font-bold text-ink mb-3">What the analysis covers</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MEASURES.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="p-5">
            <div className="w-10 h-10 rounded-xl bg-red-soft flex items-center justify-center mb-3"><Icon className="w-5 h-5 text-red" /></div>
            <p className="font-bold text-ink text-sm mb-1">{title}</p>
            <p className="text-xs text-ink-3">{desc}</p>
          </Card>
        ))}
      </div>
    </ModuleShell>
  );
}
