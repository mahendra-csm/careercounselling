'use client';

import { motion } from 'framer-motion';
import type { Report } from '@/types/report';

interface Props { report: Report }

const ScoreBar = ({ label, value, color = '#E0242E' }: { label: string; value: number; color?: string }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm text-ink-2 font-medium">{label}</span>
      <span className="text-sm font-bold text-ink">{value}/100</span>
    </div>
    <div className="h-2.5 bg-line-2 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);

export default function OpportunitySection({ report }: Props) {
  const opp = report.opportunityScore;
  if (!opp) return null;

  const fmt = (n: number) =>
    n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl border border-line shadow-sm p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-6 bg-red rounded-full" />
        <h2 className="text-lg font-extrabold text-ink">Readiness Score</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        {/* Big ring */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-36 h-36">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r="58" fill="none" stroke="#F4D4D6" strokeWidth="12" />
              <motion.circle
                cx="72" cy="72" r="58" fill="none" stroke="#E0242E" strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={364}
                initial={{ strokeDashoffset: 364 }}
                whileInView={{ strokeDashoffset: 364 - (364 * opp.overall) / 100 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-ink">{opp.overall}</span>
              <span className="text-xs text-ink-4">/ 100</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-ink mt-2">Overall Readiness</p>
        </div>

        {/* Sub scores */}
        <div className="flex flex-col justify-center">
          <ScoreBar label="Academic momentum" value={opp.marketDemand} color="#E0242E" />
          <ScoreBar label="Strength match" value={opp.skillFit} color="#C9820B" />
          <ScoreBar label="Future growth" value={opp.growthPotential} color="#1F9254" />
        </div>
      </div>

      {opp.marketInsight && (
        <p className="text-sm text-ink-2 leading-relaxed bg-bg rounded-xl p-4 mb-5">
          {opp.marketInsight}
        </p>
      )}

      {/* Focus benchmark */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center bg-line-2 rounded-xl p-3">
          <p className="text-xs text-ink-4 mb-1">Study min</p>
          <p className="text-lg font-extrabold text-ink">{fmt(opp.salaryBenchmark.min)}</p>
        </div>
        <div className="text-center bg-red-soft border border-red-line rounded-xl p-3">
          <p className="text-xs text-red mb-1">Ideal focus</p>
          <p className="text-lg font-extrabold text-red">{fmt(opp.salaryBenchmark.median)}</p>
        </div>
        <div className="text-center bg-line-2 rounded-xl p-3">
          <p className="text-xs text-ink-4 mb-1">Study max</p>
          <p className="text-lg font-extrabold text-ink">{fmt(opp.salaryBenchmark.max)}</p>
        </div>
      </div>
    </motion.div>
  );
}
