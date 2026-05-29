'use client';

import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip
} from 'recharts';
import type { Report } from '@/types/report';

interface Props { report: Report }

const PRIORITY_COLORS = {
  high: '#E0242E',
  medium: '#C9820B',
  low: '#1F9254',
};

export default function SkillSnapshotSection({ report }: Props) {
  const radarData = (report.skillScores || []).map((s) => ({
    subject: s.dimension.replace(' & ', '\n& '),
    You: s.userScore,
    Target: s.targetScore,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl border border-line shadow-sm p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-6 bg-red rounded-full" />
        <h2 className="text-lg font-extrabold text-ink">Skill Snapshot</h2>
      </div>

      {radarData.length > 0 ? (
        <div className="h-72 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E9E9ED" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: '#6C6E78', fontFamily: 'var(--font-poppins)' }}
              />
              <Radar
                name="Target"
                dataKey="Target"
                stroke="#9B9DA6"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="4 2"
              />
              <Radar
                name="You"
                dataKey="You"
                stroke="#E0242E"
                fill="#E0242E"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  fontFamily: 'var(--font-poppins)',
                  fontSize: 12,
                  border: '1px solid #E9E9ED',
                  borderRadius: 8,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-red" />
              <span className="text-xs text-ink-3">You</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-ink-4 border-dashed" style={{ borderTop: '2px dashed #9B9DA6', height: 0 }} />
              <span className="text-xs text-ink-3">Target role</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-ink-4 text-sm">Skill data not available</div>
      )}

      {/* Skill gap table */}
      <div className="space-y-3">
        {(report.skillScores || []).map((skill) => (
          <div key={skill.dimension} className="rounded-xl border border-line-2 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-ink">{skill.dimension}</span>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    color: PRIORITY_COLORS[skill.priority],
                    background: skill.priority === 'high' ? '#FCECED' : skill.priority === 'medium' ? '#FFF8EC' : '#EDFAF4',
                  }}
                >
                  {skill.priority} priority
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <p className="text-xs text-ink-4 mb-1">Your score</p>
                <div className="h-2 bg-line-2 rounded-full">
                  <div
                    className="h-full bg-red rounded-full transition-all"
                    style={{ width: `${skill.userScore}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-ink mt-1">{skill.userScore}/100</p>
              </div>
              <div>
                <p className="text-xs text-ink-4 mb-1">Target score</p>
                <div className="h-2 bg-line-2 rounded-full">
                  <div
                    className="h-full bg-ink-3 rounded-full"
                    style={{ width: `${skill.targetScore}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-ink mt-1">{skill.targetScore}/100</p>
              </div>
            </div>
            {skill.improvementAdvice && (
              <p className="text-xs text-ink-3 italic">{skill.improvementAdvice}</p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
