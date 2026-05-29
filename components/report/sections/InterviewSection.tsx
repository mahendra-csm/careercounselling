'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Report } from '@/types/report';

interface Props { report: Report }

const TYPE_COLORS: Record<string, string> = {
  behavioral: 'bg-blue-50 text-blue-600 border-blue-200',
  technical: 'bg-red-soft text-red border-red-line',
  situational: 'bg-yellow-50 text-warning border-yellow-200',
  cultural: 'bg-green-50 text-success border-green-200',
};

const TABS = ['All', 'Behavioral', 'Technical', 'Situational', 'Cultural'];

export default function InterviewSection({ report }: Props) {
  const [activeTab, setActiveTab] = useState('All');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const questions = (report.interviewQuestions || []).filter(
    (q) => activeTab === 'All' || q.type.toLowerCase() === activeTab.toLowerCase()
  );

  const toggleExpanded = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl border border-line shadow-sm p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-6 bg-red rounded-full" />
        <h2 className="text-lg font-extrabold text-ink">Interview Preparation</h2>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab
                ? 'bg-red text-white shadow-sm'
                : 'bg-line-2 text-ink-3 hover:bg-line hover:text-ink'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const open = expanded.has(i);
          return (
            <div key={i} className="border border-line-2 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleExpanded(i)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-bg transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${TYPE_COLORS[q.type] || 'bg-line-2 text-ink-3'}`}>
                      {q.type}
                    </span>
                    <span className="text-xs text-ink-4 bg-line-2 px-2 py-0.5 rounded-full">
                      {q.frameworkHint}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-ink leading-snug">{q.question}</p>
                </div>
                <div className="shrink-0 mt-1">
                  {open ? (
                    <ChevronDown className="w-4 h-4 text-ink-3" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-ink-3" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-line-2 pt-3 space-y-3">
                      {q.whyAsked && (
                        <div>
                          <p className="text-xs font-bold text-ink-4 uppercase tracking-wider mb-1">Why they ask this</p>
                          <p className="text-xs text-ink-3">{q.whyAsked}</p>
                        </div>
                      )}
                      {q.sampleAnswer && (
                        <div>
                          <p className="text-xs font-bold text-ink-4 uppercase tracking-wider mb-1">Sample answer</p>
                          <p className="text-xs text-ink-2 leading-relaxed italic bg-bg rounded-lg p-3">
                            {q.sampleAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {questions.length === 0 && (
          <p className="text-ink-4 text-sm text-center py-6">No questions for this type.</p>
        )}
      </div>
    </motion.div>
  );
}
