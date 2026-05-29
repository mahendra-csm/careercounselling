'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAssessmentStore } from '@/store/assessmentStore';
import { ROLES } from '@/constants/roles';
import { COMPANY_TYPES } from '@/constants/skills';
import type { StepProps } from '@/types/assessment';

const schema = z.object({
  targetRole: z.string().min(2, 'What role are you targeting?'),
  companyType: z.string().min(1, 'Pick a company type'),
  locationPreference: z.string().min(1, 'Pick a location preference'),
  salaryMin: z.number().min(0),
  salaryMax: z.number().min(0),
});
type Form = z.infer<typeof schema>;

const LOCATIONS = ['Remote', 'Hybrid', 'On-site'];

export default function Step3TargetRole({ onNext, onBack }: StepProps) {
  const { answers, updateAnswers } = useAssessmentStore();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      targetRole: answers.targetRole || '',
      companyType: answers.companyType || '',
      locationPreference: answers.locationPreference || 'Remote',
      salaryMin: answers.salaryMin ?? 80,
      salaryMax: answers.salaryMax ?? 130,
    },
  });

  const targetRole = watch('targetRole');
  const companyType = watch('companyType');
  const locationPref = watch('locationPreference');
  const salaryMin = watch('salaryMin');
  const salaryMax = watch('salaryMax');

  useEffect(() => {
    if (targetRole.length > 1) {
      const filtered = ROLES.filter((r) =>
        r.toLowerCase().includes(targetRole.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && document.activeElement === inputRef.current);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [targetRole]);

  const onSubmit = (data: Form) => {
    const min = Math.min(data.salaryMin, data.salaryMax);
    const max = Math.max(data.salaryMin, data.salaryMax);
    updateAnswers({ ...data, salaryMin: min, salaryMax: max });
    onNext();
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-ink mb-2">Where do you want to go?</h2>
        <p className="text-ink-3">Be specific — the more precise your target, the more useful your analysis.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Target role autocomplete */}
        <div className="relative">
          <label className="text-sm font-semibold text-ink-2 block mb-1.5">Target role</label>
          <input
            {...register('targetRole')}
            ref={(e) => {
              register('targetRole').ref(e);
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = e;
            }}
            placeholder="e.g. Senior Product Manager"
            autoComplete="off"
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="w-full px-4 py-3 rounded-xl border border-line bg-white text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red transition-all text-sm"
          />
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-xl shadow-md z-10 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="w-full text-left px-4 py-2.5 text-sm text-ink-2 hover:bg-red-soft hover:text-red transition-colors"
                  onMouseDown={() => {
                    setValue('targetRole', s);
                    setShowSuggestions(false);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {errors.targetRole && <p className="text-red text-xs mt-1">{errors.targetRole.message}</p>}
        </div>

        {/* Company type */}
        <div>
          <label className="text-sm font-semibold text-ink-2 block mb-2">Company type</label>
          <div className="grid grid-cols-2 gap-2">
            {COMPANY_TYPES.map((ct) => (
              <motion.button
                key={ct.value}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setValue('companyType', ct.value)}
                className={`flex flex-col items-start px-3 py-3 rounded-xl border text-sm transition-all ${
                  companyType === ct.value
                    ? 'border-red bg-red-soft'
                    : 'border-line bg-white hover:border-ink-4'
                }`}
              >
                <span className={`font-semibold ${companyType === ct.value ? 'text-red' : 'text-ink'}`}>
                  {ct.label}
                </span>
                <span className="text-xs text-ink-4 mt-0.5">{ct.desc}</span>
              </motion.button>
            ))}
          </div>
          {errors.companyType && <p className="text-red text-xs mt-1">{errors.companyType.message}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-semibold text-ink-2 block mb-2">Location preference</label>
          <div className="flex rounded-xl border border-line bg-white overflow-hidden">
            {LOCATIONS.map((loc, i) => (
              <button
                key={loc}
                type="button"
                onClick={() => setValue('locationPreference', loc)}
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                  locationPref === loc
                    ? 'bg-red text-white'
                    : 'text-ink-3 hover:bg-line-2'
                } ${i > 0 ? 'border-l border-line' : ''}`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Salary range */}
        <div>
          <label className="text-sm font-semibold text-ink-2 block mb-1.5">
            Salary target —{' '}
            <span className="text-red">
              ${salaryMin}k – ${salaryMax}k
            </span>
          </label>
          <p className="text-xs text-ink-4 mb-3">I&apos;m targeting ${salaryMin},000 – ${salaryMax},000 per year</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-4 w-6">Min</span>
              <input
                type="range"
                min={40}
                max={300}
                step={5}
                value={salaryMin}
                onChange={(e) => setValue('salaryMin', Number(e.target.value))}
                className="flex-1 h-2 bg-line rounded-full appearance-none cursor-pointer accent-red"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-4 w-6">Max</span>
              <input
                type="range"
                min={40}
                max={300}
                step={5}
                value={salaryMax}
                onChange={(e) => setValue('salaryMax', Number(e.target.value))}
                className="flex-1 h-2 bg-line rounded-full appearance-none cursor-pointer accent-red"
              />
            </div>
          </div>
        </div>

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
