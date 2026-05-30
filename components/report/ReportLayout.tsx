'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, Share2, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Report } from '@/types/report';
import ReportSummarySection from './sections/ReportSummarySection';
import SkillSnapshotSection from './sections/SkillSnapshotSection';
import OpportunitySection from './sections/OpportunitySection';
import JobMatchesSection from './sections/JobMatchesSection';
import RoadmapSection from './sections/RoadmapSection';
import CompetitiveSection from './sections/CompetitiveSection';
import InterviewSection from './sections/InterviewSection';
import PersonalitySection from './sections/PersonalitySection';
import ReportSidebar from './ReportSidebar';

interface Props {
  reportId?: string;
  shareToken?: string;
}

export default function ReportLayout({ reportId, shareToken }: Props) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('summary');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const fetchReport = useCallback(async () => {
    try {
      const url = reportId
        ? `/api/report/${reportId}`
        : shareToken
        ? `/api/report/${shareToken}?token=${shareToken}`
        : null;

      if (!url) {
        // Try to load from Supabase directly using last report
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError('Sign in to view your report.'); setLoading(false); return; }

        const { data: profile } = await supabase
          .from('profiles')
          .select('last_report_id')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile?.last_report_id) {
          setError('No report found. Complete an assessment first.');
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/report/${profile.last_report_id}`);
        if (!res.ok) throw new Error('Failed to load report');
        const data = await res.json();
        setReport(data);
        setLoading(false);
        return;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Report not found');
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportId, shareToken]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [report]);

  const registerSection = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  const handleDownloadPDF = async () => {
    if (!report) return;
    setPdfGenerating(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { ReportPDFDocument } = await import('@/components/report/ReportPDFDocument');
      const { createElement } = await import('react');
      const blob = await pdf(createElement(ReportPDFDocument, { report })).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onegrasp-report-${report.userName.toLowerCase().replace(' ', '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleShare = () => {
    if (!report) return;
    const url = `${window.location.origin}/report/${report.shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Share link copied to clipboard!');
    });
  };

  const updateTask = async (phaseIndex: number, taskId: string, completed: boolean) => {
    if (!report) return;
    await fetch(`/api/report/${report.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, completed, phaseIndex }),
    });
    setReport((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.roadmap = prev.roadmap.map((phase, i) =>
        i === phaseIndex
          ? { ...phase, tasks: phase.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t)) }
          : phase
      );
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-red animate-spin mx-auto mb-3" />
          <p className="text-ink-3 text-sm">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red mx-auto mb-3" />
          <h3 className="font-bold text-ink mb-2">Report not found</h3>
          <p className="text-ink-3 text-sm mb-4">{error || 'Something went wrong.'}</p>
          <a href="/assessment" className="text-sm text-red font-semibold hover:underline">
            Take an assessment →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sticky sidebar */}
      <ReportSidebar activeSection={activeSection} />

      {/* Main content */}
      <div className="flex-1 min-w-0 max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:ml-[240px]">
        {/* Report header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-line shadow-sm p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-xl bg-red text-white flex items-center justify-center text-xl font-bold shadow-glow">
                  {report.userName[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 className="font-extrabold text-xl text-ink">{report.userName}</h1>
                  <p className="text-sm text-ink-3">Student Growth Report</p>
                </div>
              </div>
              <p className="text-xs text-ink-4 mt-2">
                Generated {new Date(report.generatedAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#F4D4D6" strokeWidth="7" />
                    <motion.circle
                      cx="40" cy="40" r="32" fill="none" stroke="#E0242E" strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={201}
                      initial={{ strokeDashoffset: 201 }}
                      animate={{ strokeDashoffset: 201 - (201 * report.overallScore) / 100 }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold text-ink">{report.overallScore}</span>
                    <span className="text-xs text-ink-4">/100</span>
                  </div>
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 bg-red-soft text-red text-xs font-semibold rounded-full">
                  {report.matchLabel}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfGenerating}
                  className="flex items-center gap-2 bg-red text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-red-dark transition-all shadow-glow disabled:opacity-60"
                >
                  {pdfGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {pdfGenerating ? 'Generating...' : 'Download PDF'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 border border-line text-ink-2 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-line-2 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Report sections */}
        <div className="space-y-8">
          <div id="summary" ref={registerSection('summary')}>
            <ReportSummarySection report={report} />
          </div>
          <div id="skills" ref={registerSection('skills')}>
            <SkillSnapshotSection report={report} />
          </div>
          <div id="opportunity" ref={registerSection('opportunity')}>
            <OpportunitySection report={report} />
          </div>
          <div id="jobs" ref={registerSection('jobs')}>
            <JobMatchesSection report={report} />
          </div>
          <div id="roadmap" ref={registerSection('roadmap')}>
            <RoadmapSection report={report} onTaskToggle={updateTask} />
          </div>
          <div id="competitive" ref={registerSection('competitive')}>
            <CompetitiveSection report={report} />
          </div>
          <div id="interview" ref={registerSection('interview')}>
            <InterviewSection report={report} />
          </div>
          <div id="personality" ref={registerSection('personality')}>
            <PersonalitySection report={report} />
          </div>
        </div>
      </div>
    </div>
  );
}
