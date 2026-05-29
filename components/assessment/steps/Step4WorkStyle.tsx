'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAssessmentStore } from '@/store/assessmentStore';
import { WORK_PACE, TEAM_SIZES, MANAGEMENT_STYLES, LEARNING_STYLES } from '@/constants/roles';
import type { StepProps } from '@/types/assessment';

const schema = z.object({
  workPace: z.string().min(1),
  teamSize: z.string().min(1),
  managementStyle: z.string().min(1),
  learningStyle: z.string().min(1),
});
type Form = z.infer<typeof schema>;

const ROW_CONFIGS = [
  { field: 'workPace' as const, label: 'Work pace', options: WORK_PACE },
  { field: 'teamSize' as const, label: 'Team size', options: TEAM_SIZES },
  { field: 'managementStyle' as const, label: 'Management style', options: MANAGEMENT_STYLES },
  { field: 'learningStyle' as const, label: 'Learning style', options: LEARNING_STYLES },
];

export default function Step4WorkStyle({ onNext, onBack }: StepProps) {
  const { answers, updateAnswers } = useAssessmentStore();
  const { handleSubmit, watch, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      workPace: answers.workPace || '',
      teamSize: answers.teamSize || '',
      managementStyle: answers.managementStyle || '',
      learningStyle: answers.learningStyle || '',
    },
  });

  const values = watch();

  const onSubmit = (data: Form) => {
    updateAnswers(data);
    onNext();
  };

  const hasError = Object.values(errors).some(Boolean);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-ink mb-2">How do you work best?</h2>
        <p className="text-ink-3">This helps us find roles that actually fit your style — not just your skills.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {ROW_CONFIGS.map(({ field, label, options }, rowIdx) => (
          <motion.div
            key={field}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIdx * 0.07 }}
          >
            <label className="text-sm font-semibold text-ink-2 block mb-2">{label}</label>
            <div className="grid grid-cols-3 gap-2">
              {options.map((opt) => (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setValue(field, opt.value)}
                  className={`flex flex-col items-start px-3 py-3 rounded-xl border text-left transition-all ${
                    values[field] === opt.value
                      ? 'border-red bg-red-soft'
                      : 'border-line bg-white hover:border-ink-4'
                  }`}
                >
                  <span className={`font-semibold text-sm ${values[field] === opt.value ? 'text-red' : 'text-ink'}`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-ink-4 mt-0.5 leading-tight">{opt.desc}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}

        {hasError && (
          <p className="text-red text-sm">Please make a selection in each row.</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border border-line text-ink-2 font-semibold py-3 rounded-xl hover:bg-line-2 transition-all"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-red text-white font-semibold py-3 rounded-xl hover:bg-red-dark transition-all shadow-glow active:scale-95"
          >
            Continue →
          </button>
        </div>
      </form>
    </div>
  );
}
