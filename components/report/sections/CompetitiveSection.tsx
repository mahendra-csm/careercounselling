'use client';

import { motion } from 'framer-motion';
import { Trophy, Target, Star } from 'lucide-react';
import type { Report } from '@/types/report';

interface Props { report: Report }

export default function CompetitiveSection({ report }: Props) {
  const comp = report.competitiveAnalysis;
  if (!comp) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl border border-line shadow-sm p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-6 bg-red rounded-full" />
        <h2 className="text-lg font-extrabold text-ink">Competitive Analysis</h2>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {/* Percentile */}
        <div className="bg-bg rounded-xl p-4 text-center">
          <Trophy className="w-6 h-6 text-red mx-auto mb-2" />
          <div className="text-3xl font-extrabold text-ink mb-0.5">{comp.percentileRank}th</div>
          <div className="text-xs text-ink-3">Percentile rank vs peers targeting {report.targetRole}</div>
        </div>

        {/* Top competitor skills */}
        <div className="bg-bg rounded-xl p-4">
          <Target className="w-5 h-5 text-warning mb-2" />
          <p className="text-xs font-bold text-ink-2 mb-2">What top candidates have</p>
          <div className="flex flex-wrap gap-1">
            {comp.topCompetitorSkills?.map((s) => (
              <span key={s} className="px-2 py-0.5 bg-yellow-50 border border-yellow-200 text-warning text-xs rounded-full font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Unique advantages */}
        <div className="bg-bg rounded-xl p-4">
          <Star className="w-5 h-5 text-success mb-2" />
          <p className="text-xs font-bold text-ink-2 mb-2">Your unique advantages</p>
          <ul className="space-y-1">
            {comp.uniqueAdvantages?.map((adv, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-ink-2">
                <span className="text-success mt-0.5">✓</span>
                {adv}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {comp.differentiationStrategy && (
        <div className="bg-red-soft border border-red-line rounded-xl p-4">
          <p className="text-xs font-bold text-red uppercase tracking-wider mb-2">Differentiation Strategy</p>
          <p className="text-sm text-ink-2 leading-relaxed">{comp.differentiationStrategy}</p>
        </div>
      )}
    </motion.div>
  );
}
