'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useAssessmentStore } from '@/store/assessmentStore';

interface StatusLine {
  id: string;
  label: string;
  done: boolean;
  active: boolean;
}

const INITIAL_LINES: StatusLine[] = [
  { id: 'profile', label: 'Profile analyzed', done: false, active: false },
  { id: 'skills', label: 'Mapped against 847 relevant roles', done: false, active: false },
  { id: 'market', label: 'Identified high-impact skill gaps', done: false, active: false },
  { id: 'roadmap', label: 'Generated personalized 90-day roadmap', done: false, active: false },
  { id: 'complete', label: 'Interview prep questions ready', done: false, active: false },
];

export default function AnalyzingPage() {
  const router = useRouter();
  const { answers, setReportId, setProgress } = useAssessmentStore();
  const [lines, setLines] = useState<StatusLine[]>(INITIAL_LINES);
  const [progress, setLocalProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing your analysis...');
  const [name, setName] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const storedAnswers =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('pendingAssessment')
        : null;

    const finalAnswers = storedAnswers ? JSON.parse(storedAnswers) : answers;
    setName(finalAnswers?.name || 'you');

    if (!finalAnswers?.name) {
      router.push('/assessment');
      return;
    }

    startAnalysis(finalAnswers);
  }, []);

  const startAnalysis = async (assessmentAnswers: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentAnswers),
      });

      if (!response.body) {
        router.push('/dashboard');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const events = chunk.split('\n\n').filter(Boolean);

        for (const event of events) {
          const dataLine = event.replace('data: ', '').trim();
          if (!dataLine) continue;

          try {
            const data = JSON.parse(dataLine);

            if (data.step === 'error') {
              setStatusMessage('Something went wrong. Redirecting...');
              setTimeout(() => router.push('/assessment'), 2000);
              return;
            }

            setLocalProgress(data.progress || 0);
            setProgress(data.progress || 0, data.message || '');
            setStatusMessage(data.message || '');

            const stepOrder = ['profile', 'skills', 'market', 'roadmap', 'complete'];
            const stepIdx = stepOrder.indexOf(data.step);

            setLines((prev) =>
              prev.map((line, i) => ({
                ...line,
                done: i < stepIdx,
                active: i === stepIdx,
              }))
            );

            if (data.step === 'complete' && data.reportId) {
              setReportId(data.reportId);
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('pendingAssessment');
              }
              setLines((prev) => prev.map((l) => ({ ...l, done: true, active: false })));
              setTimeout(() => router.push(`/report?id=${data.reportId}`), 1500);
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch {
      setStatusMessage('Connection lost. Please try again.');
      setTimeout(() => router.push('/assessment'), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Spinning ring */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="#F4D4D6"
              strokeWidth="8"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="#E0242E"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={251}
              strokeDashoffset={251 - (251 * progress) / 100}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-extrabold text-red">{progress}%</span>
          </div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-extrabold text-ink mb-2"
        >
          Building your Career Intelligence Report{name ? `, ${name.split(' ')[0]}` : ''}
        </motion.h2>
        <p className="text-ink-3 text-sm mb-8">{statusMessage}</p>

        {/* Status lines */}
        <div className="bg-white rounded-2xl border border-line p-5 text-left space-y-3">
          {lines.map((line, i) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: line.done || line.active ? 1 : 0.4, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                line.done
                  ? 'bg-success text-white'
                  : line.active
                  ? 'bg-red-soft'
                  : 'bg-line-2'
              }`}>
                {line.done ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : line.active ? (
                  <Loader2 className="w-3.5 h-3.5 text-red animate-spin" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-ink-4" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                line.done ? 'text-success' : line.active ? 'text-ink' : 'text-ink-4'
              }`}>
                {line.label}
              </span>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-ink-4 mt-6">This usually takes about 45 seconds. Please stay on this page.</p>
      </div>
    </div>
  );
}
