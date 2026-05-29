'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAssessmentStore } from '@/store/assessmentStore';
import { INDUSTRIES } from '@/constants/skills';
import type { StepProps } from '@/types/assessment';

const schema = z.object({
  name: z.string().min(2, 'Tell us your name'),
  currentRole: z.string().min(2, 'What do you do right now?'),
  yearsExperience: z.number().min(0).max(40),
  industry: z.string().min(1, 'Pick your industry'),
});
type Form = z.infer<typeof schema>;

export default function Step1Profile({ onNext }: StepProps) {
  const { answers, updateAnswers } = useAssessmentStore();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: answers.name || '',
      currentRole: answers.currentRole || '',
      yearsExperience: answers.yearsExperience ?? 3,
      industry: answers.industry || '',
    },
  });

  const yearsValue = watch('yearsExperience');
  const selectedIndustry = watch('industry');

  const onSubmit = (data: Form) => {
    updateAnswers(data);
    onNext();
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-ink mb-2">Tell us about yourself</h2>
        <p className="text-ink-3">This shapes everything — be honest, it powers your entire analysis.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="text-sm font-semibold text-ink-2 block mb-1.5">Full name</label>
          <input
            {...register('name')}
            placeholder="Alex Johnson"
            className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red transition-all text-sm"
          />
          {errors.name && <p className="text-red text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-sm font-semibold text-ink-2 block mb-1.5">Current role</label>
          <input
            {...register('currentRole')}
            placeholder="e.g. Software Engineer, Marketing Manager"
            className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red transition-all text-sm"
          />
          {errors.currentRole && <p className="text-red text-xs mt-1">{errors.currentRole.message}</p>}
        </div>

        <div>
          <label className="text-sm font-semibold text-ink-2 block mb-2">
            Years of experience — <span className="text-red">{yearsValue} {yearsValue === 1 ? 'year' : 'years'}</span>
          </label>
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={yearsValue}
            onChange={(e) => setValue('yearsExperience', Number(e.target.value))}
            className="w-full h-2 bg-line rounded-full appearance-none cursor-pointer accent-red"
          />
          <div className="flex justify-between text-xs text-ink-4 mt-1">
            <span>0</span>
            <span>20+</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-ink-2 block mb-2">Industry</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {INDUSTRIES.map((ind) => (
              <motion.button
                key={ind.value}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setValue('industry', ind.value)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedIndustry === ind.value
                    ? 'border-red bg-red-soft text-red'
                    : 'border-line bg-white text-ink-2 hover:border-ink-4'
                }`}
              >
                <span className="text-base">{ind.icon}</span>
                {ind.label}
                {selectedIndustry === ind.value && (
                  <span className="ml-auto w-4 h-4 bg-red rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-white">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </motion.button>
            ))}
          </div>
          {errors.industry && <p className="text-red text-xs mt-1">{errors.industry.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-red text-white font-semibold py-3.5 rounded-xl hover:bg-red-dark transition-all shadow-glow active:scale-95 mt-2"
        >
          Continue →
        </button>
      </form>
    </div>
  );
}
