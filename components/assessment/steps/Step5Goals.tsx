'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAssessmentStore } from '@/store/assessmentStore';
import { TIMELINES, PRIORITIES } from '@/constants/roles';
import type { StepProps } from '@/types/assessment';

export default function Step5Goals({ onBack }: StepProps) {
  const router = useRouter();
  const { answers, updateAnswers, setAnalyzing } = useAssessmentStore();
  const [timeline, setTimeline] = useState(answers.timeline || '');
  const [topPriority, setTopPriority] = useState(answers.topPriority || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!timeline) { setError('Pick your timeline.'); return; }
    if (!topPriority) { setError('Pick your top priority.'); return; }
    setError('');

    const finalAnswers = { ...answers, timeline, topPriority };
    updateAnswers({ timeline, topPriority });
    setSubmitting(true);
    setAnalyzing(true);

    // Store answers in sessionStorage for the analyzing page to pick up
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pendingAssessment', JSON.stringify(finalAnswers));
    }

    router.push('/assessment/analyzing');
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-ink mb-2">Your goals</h2>
        <p className="text-ink-3">Almost there. These two answers shape your roadmap and job matches.</p>
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <label className="text-sm font-semibold text-ink-2 block mb-2">Timeline to your target role</label>
          <div className="grid grid-cols-2 gap-2">
            {TIMELINES.map((t) => (
              <motion.button
                key={t.value}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => { setTimeline(t.value); setError(''); }}
                className={`flex flex-col items-start px-3 py-3 rounded-xl border text-left transition-all ${
                  timeline === t.value
                    ? 'border-red bg-red-soft'
                    : 'border-line bg-white hover:border-ink-4'
                }`}
              >
                <span className={`font-semibold text-sm ${timeline === t.value ? 'text-red' : 'text-ink'}`}>
                  {t.label}
                </span>
                <span className="text-xs text-ink-4 mt-0.5">{t.desc}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-ink-2 block mb-2">Top priority right now</label>
          <div className="grid grid-cols-2 gap-2">
            {PRIORITIES.map((p) => (
              <motion.button
                key={p.value}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => { setTopPriority(p.value); setError(''); }}
                className={`flex flex-col items-start px-3 py-3 rounded-xl border text-left transition-all ${
                  topPriority === p.value
                    ? 'border-red bg-red-soft'
                    : 'border-line bg-white hover:border-ink-4'
                }`}
              >
                <span className={`font-semibold text-sm ${topPriority === p.value ? 'text-red' : 'text-ink'}`}>
                  {p.label}
                </span>
                <span className="text-xs text-ink-4 mt-0.5">{p.desc}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-red text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex-1 border border-line text-ink-2 font-semibold py-3 rounded-xl hover:bg-line-2 transition-all disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-[2] bg-red text-white font-semibold py-3 rounded-xl hover:bg-red-dark transition-all shadow-glow active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing analysis...
            </>
          ) : (
            'Analyze my career →'
          )}
        </button>
      </div>
    </div>
  );
}
