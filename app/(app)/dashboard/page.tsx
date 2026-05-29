'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3, Briefcase, ClipboardList, TrendingUp,
  ArrowRight, Clock, CheckCircle2, Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface Profile {
  name: string;
  job_title?: string;
  industry?: string;
  assessments_completed: number;
  last_report_id?: string;
}

interface ReportSnippet {
  overallScore: number;
  matchLabel: string;
  targetRole: string;
  jobMatches?: Array<{ title: string; company: string; matchPercent: number }>;
  roadmap?: Array<{ tasks: Array<{ completed: boolean; title: string }> }>;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [report, setReport] = useState<ReportSnippet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      setProfile(profileData);

      if (profileData?.last_report_id) {
        try {
          const res = await fetch(`/api/report/${profileData.last_report_id}`);
          if (res.ok) setReport(await res.json());
        } catch { /* ignore */ }
      }

      setLoading(false);
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.name?.split(' ')[0] || 'there';

  const completedTasks = report?.roadmap?.flatMap(p => p.tasks).filter(t => t.completed).length || 0;
  const totalTasks = report?.roadmap?.flatMap(p => p.tasks).length || 0;

  const STATS = [
    { label: 'Profile strength', value: report ? `${report.overallScore}%` : '—', icon: BarChart3, color: 'text-red', bg: 'bg-red-soft' },
    { label: 'Career score', value: report?.overallScore ? `${report.overallScore}/100` : '—', icon: TrendingUp, color: 'text-success', bg: 'bg-green-50' },
    { label: 'Tasks completed', value: totalTasks > 0 ? `${completedTasks}/${totalTasks}` : '—', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Assessments', value: profile?.assessments_completed || 0, icon: ClipboardList, color: 'text-warning', bg: 'bg-yellow-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-7 h-7 text-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-extrabold text-ink mb-1">
          {greeting}, {firstName}
        </h1>
        <p className="text-ink-3 text-sm">
          {report
            ? `Your career score is ${report.overallScore}/100. Keep executing the roadmap.`
            : "Nothing here yet — let's fix that. Take your first assessment."}
        </p>
      </motion.div>

      {/* CTA if no report */}
      {!report && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red gradient-brand rounded-2xl p-6 mb-6 text-white"
        >
          <h2 className="font-extrabold text-xl mb-2">Get your career intelligence report</h2>
          <p className="text-red-soft text-sm mb-4">5 questions. 45 seconds. A 10-page personalized analysis.</p>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 bg-white text-red font-bold px-5 py-2.5 rounded-xl hover:bg-red-soft transition-all text-sm"
          >
            Start assessment <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="bg-white border border-line rounded-2xl p-4 shadow-sm"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-extrabold text-ink">{String(value)}</div>
            <div className="text-xs text-ink-4 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 bg-white border border-line rounded-2xl p-5 shadow-sm"
        >
          <h3 className="font-bold text-ink mb-4 text-sm">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/assessment" className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg transition-colors group">
              <div className="w-8 h-8 bg-red-soft rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-red" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Update skills</p>
                <p className="text-xs text-ink-4">Re-take assessment</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-4 group-hover:text-ink transition-colors" />
            </Link>

            <Link href="/report" className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg transition-colors group">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">View roadmap</p>
                <p className="text-xs text-ink-4">Track your progress</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-4 group-hover:text-ink transition-colors" />
            </Link>

            <Link href="/report" className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg transition-colors group">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Practice interview</p>
                <p className="text-xs text-ink-4">8 custom questions</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-4 group-hover:text-ink transition-colors" />
            </Link>
          </div>
        </motion.div>

        {/* Recommended jobs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-white border border-line rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink text-sm">Recommended Jobs</h3>
            {report && (
              <Link href="/report#jobs" className="text-xs text-red font-semibold hover:underline">
                View all →
              </Link>
            )}
          </div>

          {report?.jobMatches?.length ? (
            <div className="space-y-3">
              {report.jobMatches.slice(0, 3).map((job, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-line-2 hover:border-red-line hover:bg-red-soft/20 transition-all">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: `hsl(${i * 80 + 180}, 55%, 45%)` }}
                  >
                    {job.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{job.title}</p>
                    <p className="text-xs text-ink-4">{job.company}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    job.matchPercent >= 85 ? 'bg-green-50 text-success' : 'bg-red-soft text-red'
                  }`}>
                    {job.matchPercent}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Briefcase className="w-8 h-8 text-ink-4 mb-2" />
              <p className="text-sm text-ink-3">Complete an assessment to see your job matches.</p>
              <Link href="/assessment" className="text-red text-sm font-semibold mt-2 hover:underline">
                Take assessment →
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
