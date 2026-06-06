'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Loader2, MessageCircle, Phone, Mail, Sparkles,
  Building2, Globe2, Plane, FileText, Library, Rocket, Search,
  Briefcase, GraduationCap, TrendingUp, type LucideIcon,
} from 'lucide-react';
import { getSession } from '@/lib/firebase';
import { getLastReportId, getLocalReport } from '@/lib/report-store';
import type { PsychometricProfile } from '@/lib/psychometric';
import AssessmentResults from '@/components/dashboard/AssessmentResults';

type Module = { title: string; desc: string; icon: LucideIcon; href: string; from: string; to: string };

const MODULES: Module[] = [
  { title: 'Virtual Internships', desc: 'Free internships & job simulations for Class 6–12.', icon: Briefcase, href: '/dashboard/internships', from: '#2D7FF0', to: '#1B4F9B' },
  { title: 'Career Library', desc: '3,000+ careers with steps & free resources.', icon: Library, href: '/dashboard/career-library', from: '#9B51E0', to: '#5B2E94' },
  { title: 'Career Boosters', desc: 'Free learn paths, scholarships & courses.', icon: Rocket, href: '/dashboard/career-boosters', from: '#F59E0B', to: '#B45309' },
  { title: 'India Colleges', desc: '10,000+ colleges with admission insights.', icon: Building2, href: '/dashboard/india-colleges', from: '#27AE60', to: '#176B3A' },
  { title: 'Abroad Colleges', desc: '8,000+ universities across 22+ countries.', icon: Globe2, href: '/dashboard/abroad-colleges', from: '#11998E', to: '#0A5E58' },
  { title: 'Abroad Applications', desc: 'Study-abroad profiling, SOP & visa help.', icon: Plane, href: '/dashboard/abroad-applications', from: '#6366F1', to: '#3B2E8F' },
  { title: 'Entrance Exams', desc: '1,400+ entrance test details & dates.', icon: FileText, href: '/dashboard/exams', from: '#EB5757', to: '#9B1B22' },
  { title: 'Career Analysis', desc: 'Revisit your psychometric profile.', icon: Search, href: '/dashboard/career-analysis', from: '#2D9CDB', to: '#1B6491' },
];

function Ring({ value }: { value: number }) {
  const r = 34, c = 2 * Math.PI * r, off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <svg width={88} height={88} viewBox="0 0 84 84" className="shrink-0">
      <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="8" />
      <circle cx="42" cy="42" r={r} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 42 42)" />
      <text x="42" y="40" textAnchor="middle" dominantBaseline="central" fill="#fff" style={{ fontSize: 20, fontWeight: 800 }}>{value}</text>
      <text x="42" y="56" textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.8)" style={{ fontSize: 8, letterSpacing: '0.1em' }}>FIT</text>
    </svg>
  );
}

export default function DashboardPage() {
  const [name, setName] = useState('');
  const [report, setReport] = useState<PsychometricProfile | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session?.name) setName(session.name);
    const lastId = getLastReportId();
    if (lastId) {
      const local = getLocalReport(lastId);
      if (local) { setReport(local); setReportId(lastId); }
    }
    setLoading(false);
  }, []);

  const firstName = (name || report?.name || 'there').split(' ')[0];
  const hasReport = Boolean(report);
  const fit = report ? Math.min(100, report.overallScore) : 0;
  const reportHref = reportId ? `/report/view?id=${reportId}` : '/assessment';

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-7 h-7 text-red animate-spin" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* ---- Hero ---- */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white mb-6"
        style={{ background: 'linear-gradient(125deg, #E0242E 0%, #7e22ce 60%, #3b0764 100%)' }}>
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden>
          <defs><pattern id="hero-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#fff" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
        <div className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium">Welcome back</p>
            <h1 className="text-3xl font-extrabold mt-0.5">Hi {firstName} 👋</h1>
            <p className="text-white/85 text-sm mt-1.5 max-w-lg">
              {hasReport
                ? 'Your career command centre — your report, colleges, exams, internships and boosters in one place.'
                : 'Discover careers that fit you. Take the assessment to unlock your personalised report and roadmap.'}
            </p>
            <div className="flex flex-wrap gap-2.5 mt-4">
              {hasReport ? (
                <>
                  <Link href={reportHref} className="inline-flex items-center gap-2 bg-white text-red text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg hover:bg-white/90">
                    View career report <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a href="https://wa.me/918977760443" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-semibold px-4 py-2.5 rounded-xl backdrop-blur hover:bg-white/25">
                    <MessageCircle className="w-4 h-4" /> Talk to a counsellor
                  </a>
                </>
              ) : (
                <Link href="/assessment" className="inline-flex items-center gap-2 bg-white text-red text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg hover:bg-white/90">
                  Start career assessment <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
          {hasReport && (
            <div className="flex items-center gap-4 sm:border-l sm:border-white/20 sm:pl-6">
              <Ring value={fit} />
              <div className="text-sm">
                <p className="font-bold leading-tight">{report?.matchLabel ?? 'Career fit'}</p>
                <p className="text-white/75 text-xs mt-0.5">Top domain</p>
                <p className="font-semibold text-[13px] leading-tight">{report?.topCareers?.[0]?.cluster ?? report?.matchLabel ?? '—'}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ---- Assessment results (when a report exists) ---- */}
      {hasReport && report && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-8">
          <AssessmentResults profile={report} reportHref={reportHref} />
        </motion.div>
      )}

      {/* ---- Career Lab grid ---- */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-ink text-lg">Explore your Career Lab</h2>
        <span className="text-xs font-semibold text-ink-4 hidden sm:flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Updated for 2026</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {MODULES.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
              <Link href={m.href}
                className="group flex items-start gap-4 bg-white border border-line rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all h-full">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: `linear-gradient(135deg, ${m.from}, ${m.to})` }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink text-[15px] leading-tight">{m.title}</p>
                  <p className="text-xs text-ink-4 leading-relaxed mt-1">{m.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-4 group-hover:text-red group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* ---- Counselling ---- */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-line bg-white shadow-sm overflow-hidden">
        <div className="grid sm:grid-cols-[1.3fr_1fr]">
          <div className="p-6 sm:p-7">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red bg-red-soft px-3 py-1 rounded-full mb-3">
              <GraduationCap className="w-3.5 h-3.5" /> Career Counselling Centre
            </div>
            <h3 className="text-xl font-extrabold text-ink mb-1.5">Have a question about your future?</h3>
            <p className="text-sm text-ink-3 mb-4 max-w-md">Talk to a OneGrasp counsellor — we&apos;ll help you read your report, pick subjects, and plan your next steps.</p>
            <a href="https://wa.me/918977760443" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-red text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-glow">
              <Sparkles className="w-4 h-4" /> Ask a counsellor
            </a>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-1 border-t sm:border-t-0 sm:border-l border-line divide-x sm:divide-x-0 sm:divide-y divide-line">
            <a href="https://wa.me/918977760443" target="_blank" rel="noreferrer" className="flex items-center justify-center sm:justify-start gap-2.5 p-4 hover:bg-bg transition-colors">
              <MessageCircle className="w-5 h-5 text-success shrink-0" /><span className="text-xs sm:text-sm font-semibold text-ink-2 hidden sm:inline">WhatsApp</span>
            </a>
            <a href="tel:8977760443" className="flex items-center justify-center sm:justify-start gap-2.5 p-4 hover:bg-bg transition-colors">
              <Phone className="w-5 h-5 text-blue-500 shrink-0" /><span className="text-xs sm:text-sm font-semibold text-ink-2 hidden sm:inline">8977760443</span>
            </a>
            <a href="mailto:support@onegrasp.com" className="flex items-center justify-center sm:justify-start gap-2.5 p-4 hover:bg-bg transition-colors">
              <Mail className="w-5 h-5 text-red shrink-0" /><span className="text-xs sm:text-sm font-semibold text-ink-2 hidden sm:inline">support@onegrasp.com</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
