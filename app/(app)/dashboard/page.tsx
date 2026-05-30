'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Loader2, MessageCircle, Phone, Mail, Sparkles,
  Building2, Globe2, Plane, FileText, Library, Rocket,
  GraduationCap, Award, Briefcase, BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { getSession } from '@/lib/firebase';
import { getLastReportId, getLocalReport } from '@/lib/report-store';
import type { PsychometricProfile } from '@/lib/psychometric';

const MODULES: { title: string; desc: string; icon: LucideIcon; href: string }[] = [
  { title: 'India Colleges', desc: 'Access 10,000+ Indian colleges and 1.5 Lac+ courses with admission predictions.', icon: Building2, href: '/dashboard/india-colleges' },
  { title: 'Online India Admissions', desc: 'Your trusted gateway to India’s top colleges — explore, compare and secure admissions.', icon: GraduationCap, href: '/dashboard/india-colleges' },
  { title: 'Abroad Colleges', desc: '8,000+ international universities across 22+ countries with full details.', icon: Globe2, href: '/dashboard/abroad-colleges' },
  { title: 'Abroad Applications', desc: 'Study-abroad profiling in 15 min with SOP and visa assistance.', icon: Plane, href: '/dashboard/abroad-applications' },
  { title: 'Exams', desc: '1,400+ entrance test details for UG, PG and professional courses.', icon: FileText, href: '/dashboard/exams' },
  { title: 'Career Library', desc: '3,000+ career options with guidance and education plans.', icon: Library, href: '/dashboard/career-library' },
  { title: 'Career Boosters', desc: 'Best programs picked from industry — all in your Career Lab.', icon: Rocket, href: '/dashboard/career-boosters' },
  { title: 'Online Courses', desc: 'Unlimited access to online courses, skills and personal development.', icon: BookOpen, href: '/dashboard/career-boosters' },
  { title: 'Scholarships', desc: 'Up to 100% scholarships for deserving school and college students.', icon: Award, href: '/dashboard/career-boosters' },
  { title: 'Virtual Internships', desc: '150+ virtual internships with Fortune 500 brands — totally free.', icon: Briefcase, href: '/dashboard/career-boosters' },
];

export default function DashboardPage() {
  const [name, setName] = useState<string>('');
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
  const profilingPercent = report ? Math.min(100, report.overallScore) : 0;
  const reportHref = reportId ? `/report/view?id=${reportId}` : '/assessment';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-7 h-7 text-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink mb-1">Hi {firstName} 👋</h1>
        <p className="text-ink-3 text-sm">Your career command center — assessments, colleges, exams and boosters in one place.</p>
      </motion.div>

      {/* Career profiling + counselling */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="lg:col-span-2 bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-red text-white px-5 py-3 font-bold text-sm">Career Profiling</div>
          <div className="p-5">
            <p className="text-sm font-semibold text-ink-2 mb-2">
              {hasReport ? `Career profile ready — ${report?.matchLabel}` : 'Career planning assessment'}
            </p>
            <div className="h-2.5 bg-line-2 rounded-full overflow-hidden mb-1">
              <motion.div className="h-full bg-success rounded-full"
                initial={{ width: 0 }} animate={{ width: `${hasReport ? profilingPercent : 0}%` }}
                transition={{ duration: 1, ease: 'easeOut' }} />
            </div>
            <p className="text-xs text-ink-4 mb-4">{hasReport ? `${profilingPercent}% complete` : 'Not started yet'}</p>

            {hasReport ? (
              <div className="flex flex-wrap gap-3">
                <Link href={reportHref} className="inline-flex items-center gap-2 bg-red text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow">
                  View career report <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/assessment" className="inline-flex items-center gap-2 border border-line text-ink-2 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-bg">
                  Retake assessment
                </Link>
              </div>
            ) : (
              <Link href="/assessment" className="inline-flex items-center gap-2 bg-red text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow">
                Start career assessment <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-ink text-white px-5 py-3">
            <p className="font-bold text-sm">Career Counselling Center</p>
            <p className="text-xs text-white/60">Connect with a counsellor</p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-line">
            <a href="https://wa.me/918977760443" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 py-4 hover:bg-bg transition-colors">
              <MessageCircle className="w-5 h-5 text-success" />
              <span className="text-xs font-semibold text-ink-2">WhatsApp</span>
            </a>
            <a href="tel:8977760443" className="flex flex-col items-center gap-1.5 py-4 hover:bg-bg transition-colors">
              <Phone className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-semibold text-ink-2">Call us</span>
            </a>
            <a href="mailto:support@onegrasp.com" className="flex flex-col items-center gap-1.5 py-4 hover:bg-bg transition-colors">
              <Mail className="w-5 h-5 text-red" />
              <span className="text-xs font-semibold text-ink-2">Mail us</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Ask anything banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl p-6 mb-8 text-center text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(120deg, #3b0764, #7e22ce, #E0242E)' }}>
        <h2 className="text-2xl font-extrabold mb-3">Have a question about your future?</h2>
        <Link href="/assessment" className="inline-flex items-center gap-2 bg-white text-red font-bold px-6 py-3 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4" /> Ask anything
        </Link>
      </motion.div>

      {/* Module grid */}
      <h3 className="font-bold text-ink mb-4">Explore your Career Lab</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {MODULES.map(({ title, desc, icon: Icon, href }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
            <Link href={href} className="flex items-start gap-4 bg-white border border-line rounded-2xl p-5 shadow-sm hover:border-red-line hover:shadow-md transition-all group h-full">
              <div className="w-11 h-11 rounded-xl bg-red-soft flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-red" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink text-sm mb-0.5">{title}</p>
                <p className="text-xs text-ink-4 leading-relaxed">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-4 group-hover:text-red transition-colors shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
