'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Loader2, MessageCircle, Phone, Mail, Sparkles, CheckCircle2,
  Building2, Globe2, Plane, FileText, Library, Rocket, Search,
  Briefcase, GraduationCap, TrendingUp, type LucideIcon,
} from 'lucide-react';
import { getSession } from '@/lib/firebase';
import { getLastReportId, getLocalReport } from '@/lib/report-store';
import type { PsychometricProfile } from '@/lib/psychometric';

type Module = { title: string; desc: string; icon: LucideIcon; href: string; from: string; to: string };

const MODULES: Module[] = [
  { title: 'Virtual Internships', desc: 'Free internships & job simulations for Class 6–12.', icon: Briefcase, href: '/dashboard/internships', from: '#2D7FF0', to: '#1B4F9B' },
  { title: 'Career Library', desc: '3,000+ careers with steps & free resources.', icon: Library, href: '/dashboard/career-library', from: '#9B51E0', to: '#5B2E94' },
  { title: 'Career Boosters', desc: 'Free learn paths, scholarships & courses.', icon: Rocket, href: '/dashboard/career-boosters', from: '#F59E0B', to: '#B45309' },
  { title: 'India Colleges', desc: '10,000+ colleges with admission insights.', icon: Building2, href: '/dashboard/india-colleges', from: '#27AE60', to: '#176B3A' },
  { title: 'Abroad Colleges', desc: '8,000+ universities across 22+ countries.', icon: Globe2, href: '/dashboard/abroad-colleges', from: '#11998E', to: '#0A5E58' },
  { title: 'Abroad Applications', desc: 'Study-abroad profiling, SOP & visa help.', icon: Plane, href: '/dashboard/abroad-applications', from: '#6366F1', to: '#3B2E8F' },
  { title: 'Entrance Exams', desc: '1,400+ entrance test details & dates.', icon: FileText, href: '/dashboard/exams', from: '#EB5757', to: '#9B1B22' },
  { title: 'Career Analysis', desc: 'Take or retake your career assessment.', icon: Search, href: '/dashboard/career-analysis', from: '#2D9CDB', to: '#1B6491' },
];

export default function DashboardPage() {
  const [name, setName] = useState('');
  const [report, setReport] = useState<PsychometricProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session?.name) setName(session.name);
    const lastId = getLastReportId();
    if (lastId) {
      const local = getLocalReport(lastId);
      if (local) setReport(local);
    }
    setLoading(false);
  }, []);

  const firstName = (name || report?.name || 'there').split(' ')[0];
  const hasReport = Boolean(report);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-7 h-7 text-red animate-spin" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* ---- Hero ---- */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-6 bg-white border border-line shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-red-soft" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1">
            <p className="text-ink-4 text-sm font-medium">Welcome back</p>
            <h1 className="text-3xl font-extrabold mt-0.5 text-ink">Hi {firstName} 👋</h1>
            <p className="text-ink-3 text-sm mt-1.5 max-w-lg">
              {hasReport
                ? 'Your assessment is complete. Our team will review it and email your detailed career report to you shortly.'
                : 'Discover careers that fit you. Take the assessment and our counsellors will prepare and email your personalised report.'}
            </p>
            <div className="flex flex-wrap gap-2.5 mt-4">
              {hasReport ? (
                <a href="https://wa.me/918977760443" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-red text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-glow hover:bg-red-dark">
                  <MessageCircle className="w-4 h-4" /> Talk to a counsellor
                </a>
              ) : (
                <Link href="/assessment" className="inline-flex items-center gap-2 bg-red text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-glow hover:bg-red-dark">
                  Start career assessment <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
          {hasReport && (
            <div className="flex items-center gap-3 sm:border-l sm:border-line sm:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div className="text-sm">
                <p className="font-bold leading-tight text-ink">Assessment complete</p>
                <p className="text-ink-4 text-xs mt-0.5 max-w-[180px]">Your report will be sent to your email.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ---- Report delivery notice (report is emailed, not shown here) ---- */}
      {hasReport && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="mb-8 flex items-start gap-3.5 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="font-bold text-ink text-[15px]">Your career report is on its way</p>
            <p className="text-sm text-ink-3 mt-1 max-w-xl">
              Our counsellors prepare each report personally and send it to your registered email. You don&apos;t need to do anything — if you have questions in the meantime, talk to a counsellor below.
            </p>
          </div>
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
                className="group flex items-start gap-4 bg-white border border-line rounded-2xl p-5 shadow-sm hover:border-ink-4/30 hover:-translate-y-0.5 transition-all h-full">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${m.from}14` }}>
                  <Icon className="w-[22px] h-[22px]" style={{ color: m.from }} />
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
