'use client';

import { motion } from 'framer-motion';
import { Zap, Star, AlertTriangle, Users } from 'lucide-react';
import type { Report } from '@/types/report';

interface Props { report: Report }

const CARDS = [
  { key: 'workStyle', label: 'Work Style', icon: Zap, color: 'text-red', bg: 'bg-red-soft' },
  { key: 'strengthsNarrative', label: 'Your Strengths', icon: Star, color: 'text-success', bg: 'bg-green-50' },
  { key: 'blindSpots', label: 'Blind Spots', icon: AlertTriangle, color: 'text-warning', bg: 'bg-yellow-50' },
  { key: 'teamFitNote', label: 'Team Fit', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
] as const;

export default function PersonalitySection({ report }: Props) {
  const insights = report.personalityInsights;
  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl border border-line shadow-sm p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-6 bg-red rounded-full" />
        <h2 className="text-lg font-extrabold text-ink">Personality Insights</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="border border-line-2 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <h3 className="font-bold text-sm text-ink">{label}</h3>
            </div>
            <p className="text-sm text-ink-2 leading-relaxed">
              {insights[key as keyof typeof insights] || 'Analyzing...'}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
