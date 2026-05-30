'use client';

import { motion } from 'framer-motion';
import type { Report } from '@/types/report';

interface Props { report: Report }

export default function ReportSummarySection({ report }: Props) {
  const paragraphs = report.executiveSummary?.split('\n\n').filter(Boolean) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl border border-line shadow-sm p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-6 bg-red rounded-full" />
        <h2 className="text-lg font-extrabold text-ink">Student Summary</h2>
      </div>

      <div className="space-y-4 mb-6">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, i) => (
            <p key={i} className="text-ink-2 leading-relaxed text-sm">{para}</p>
          ))
        ) : (
          <p className="text-ink-3 text-sm">Summary loading...</p>
        )}
      </div>

      {/* Key takeaways */}
      <div className="bg-red-soft border border-red-line rounded-xl p-4">
        <p className="text-xs font-bold text-red uppercase tracking-wider mb-3">Key Takeaways</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-ink-2">
            <span className="w-1.5 h-1.5 bg-red rounded-full mt-2 shrink-0" />
            Overall score: <span className="font-bold text-ink ml-1">{report.overallScore}/100</span> — {report.matchLabel}
          </li>
          <li className="flex items-start gap-2 text-sm text-ink-2">
            <span className="w-1.5 h-1.5 bg-red rounded-full mt-2 shrink-0" />
            Exploring <span className="font-bold text-ink mx-1">{report.targetRole}</span> with a {report.companyType} learning style
          </li>
          <li className="flex items-start gap-2 text-sm text-ink-2">
            <span className="w-1.5 h-1.5 bg-red rounded-full mt-2 shrink-0" />
            <span className="font-bold text-ink mr-1">{report.skillGapAnalysis?.filter(g => g.importance === 'critical').length || 0}</span> critical skill gaps identified
          </li>
        </ul>
      </div>

      {report.topCareerChoices?.length ? (
        <div className="mt-4 bg-white border border-line-2 rounded-xl p-4">
          <p className="text-xs font-bold text-ink-4 uppercase tracking-wider mb-3">Top 3 career choices</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {report.topCareerChoices.slice(0, 3).map((career, i) => (
              <div key={career.title} className="rounded-xl border border-line p-3">
                <p className="text-xs text-ink-4 mb-1">#{i + 1}</p>
                <h3 className="font-bold text-ink text-sm">{career.title}</h3>
                <p className="text-xs text-ink-3 mt-1">{career.reason}</p>
                <p className="text-xs font-semibold text-red mt-2">{career.matchPercent}% match</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
