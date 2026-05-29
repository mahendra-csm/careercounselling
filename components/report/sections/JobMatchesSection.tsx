'use client';

import { motion } from 'framer-motion';
import { MapPin, DollarSign, ExternalLink } from 'lucide-react';
import type { Report } from '@/types/report';

interface Props { report: Report }

function MatchBadge({ pct }: { pct: number }) {
  const color = pct >= 85 ? 'bg-green-50 text-success border-green-200' : pct >= 70 ? 'bg-yellow-50 text-warning border-yellow-200' : 'bg-red-soft text-red border-red-line';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {pct}% match
    </span>
  );
}

export default function JobMatchesSection({ report }: Props) {
  if (!report.jobMatches?.length) {
    return (
      <div className="bg-white rounded-2xl border border-line shadow-sm p-6">
        <p className="text-ink-3 text-sm">Job matches not available.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl border border-line shadow-sm p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-6 bg-red rounded-full" />
        <h2 className="text-lg font-extrabold text-ink">Top Job Matches</h2>
      </div>

      <div className="space-y-4">
        {report.jobMatches.map((job, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="border border-line rounded-xl p-4 hover:border-red-line hover:bg-red-soft/20 transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: `hsl(${(i * 60) % 360}, 60%, 45%)` }}>
                {job.company[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-ink text-sm">{job.title}</h3>
                  <MatchBadge pct={job.matchPercent} />
                </div>
                <p className="text-ink-3 text-xs">{job.company} · {job.companyType}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-ink-4">
                    <MapPin className="w-3 h-3" />{job.location}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-ink-4">
                    <DollarSign className="w-3 h-3" />
                    ${Math.round(job.salaryMin / 1000)}k – ${Math.round(job.salaryMax / 1000)}k
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {job.matchedSkills?.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-green-50 text-success border border-green-200 rounded-full text-xs font-medium">
                  {s}
                </span>
              ))}
              {job.gapSkills?.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-red-soft text-red border border-red-line rounded-full text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>

            {job.whyGoodFit && (
              <p className="text-xs text-ink-3 leading-relaxed mb-3">{job.whyGoodFit}</p>
            )}

            <div className="flex gap-2">
              {job.applyUrl ? (
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-white bg-red px-3 py-1.5 rounded-lg hover:bg-red-dark transition-colors"
                >
                  Apply now <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button className="flex items-center gap-1 text-xs font-semibold text-white bg-red px-3 py-1.5 rounded-lg hover:bg-red-dark transition-colors">
                  Apply now
                </button>
              )}
              <button className="text-xs font-medium text-ink-2 border border-line px-3 py-1.5 rounded-lg hover:bg-line-2 transition-colors">
                Save for later
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
