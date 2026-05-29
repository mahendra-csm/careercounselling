'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, BookOpen, Code2, Users, Send } from 'lucide-react';
import type { Report, RoadmapPhase } from '@/types/report';

interface Props {
  report: Report;
  onTaskToggle: (phaseIndex: number, taskId: string, completed: boolean) => void;
}

const CATEGORY_ICONS = {
  learn: BookOpen,
  build: Code2,
  network: Users,
  apply: Send,
};

const PRIORITY_COLORS = {
  high: 'bg-red-soft text-red border-red-line',
  medium: 'bg-yellow-50 text-warning border-yellow-200',
  low: 'bg-green-50 text-success border-green-200',
};

export default function RoadmapSection({ report, onTaskToggle }: Props) {
  if (!report.roadmap?.length) {
    return (
      <div className="bg-white rounded-2xl border border-line shadow-sm p-6">
        <p className="text-ink-3 text-sm">Roadmap not available.</p>
      </div>
    );
  }

  const allTasks = report.roadmap.flatMap((p) => p.tasks);
  const completedCount = allTasks.filter((t) => t.completed).length;
  const progressPct = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl border border-line shadow-sm p-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-red rounded-full" />
        <h2 className="text-lg font-extrabold text-ink">90-Day Action Roadmap</h2>
      </div>

      {/* Overall progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-ink-3 mb-1.5">
          <span>{completedCount}/{allTasks.length} tasks completed</span>
          <span className="font-bold text-ink">{progressPct}%</span>
        </div>
        <div className="h-2 bg-line-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            className="h-full bg-success rounded-full transition-all duration-500"
          />
        </div>
      </div>

      {/* Phase columns */}
      <div className="grid md:grid-cols-3 gap-4">
        {report.roadmap.map((phase, phaseIndex) => {
          const phaseCompleted = phase.tasks.filter((t) => t.completed).length;
          return (
            <div key={phase.phase} className="border border-line-2 rounded-xl overflow-hidden">
              <div
                className="px-4 py-3 border-b border-line-2"
                style={{ background: phaseIndex === 0 ? '#FCECED' : phaseIndex === 1 ? '#FFF8EC' : '#EDFAF4' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: phaseIndex === 0 ? '#E0242E' : phaseIndex === 1 ? '#C9820B' : '#1F9254' }}>
                      Phase {phase.phase}
                    </span>
                    <h3 className="font-bold text-ink text-sm">{phase.label}</h3>
                  </div>
                  <span className="text-xs text-ink-4">Wk {phase.weeks}</span>
                </div>
                {phase.theme && (
                  <p className="text-xs text-ink-3 mt-1 italic">{phase.theme}</p>
                )}
                <p className="text-xs text-ink-4 mt-1">{phaseCompleted}/{phase.tasks.length} done</p>
              </div>

              <div className="divide-y divide-line-2">
                {phase.tasks.map((task) => {
                  const CategoryIcon = CATEGORY_ICONS[task.category] || BookOpen;
                  return (
                    <div
                      key={task.id}
                      className={`p-3 transition-all ${task.completed ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => onTaskToggle(phaseIndex, task.id, !task.completed)}
                          className="mt-0.5 shrink-0 text-ink-4 hover:text-red transition-colors"
                        >
                          {task.completed
                            ? <CheckCircle2 className="w-4 h-4 text-success" />
                            : <Circle className="w-4 h-4" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold text-ink leading-tight ${task.completed ? 'line-through text-ink-4' : ''}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-ink-4 mt-0.5 leading-tight">{task.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${PRIORITY_COLORS[task.priority]}`}>
                              {task.priority}
                            </span>
                            <span className="flex items-center gap-0.5 text-xs text-ink-4">
                              <Clock className="w-3 h-3" />{task.estimatedHours}h
                            </span>
                            <span className="flex items-center gap-0.5 text-xs text-ink-4">
                              <CategoryIcon className="w-3 h-3" />{task.category}
                            </span>
                          </div>
                          {task.resource && (
                            <p className="text-xs text-ink-4 mt-1 italic">{task.resource}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
