'use client';

import { Check } from 'lucide-react';

interface Props {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepIndicator({ currentStep, totalSteps, labels }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-0 mb-3">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const done = step < currentStep;
          const active = step === currentStep;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  done
                    ? 'bg-success text-white'
                    : active
                    ? 'bg-red text-white shadow-glow'
                    : 'bg-line text-ink-4'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : step}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 transition-all duration-500 ${
                    done ? 'bg-success' : 'bg-line'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        {labels.map((label, i) => (
          <span
            key={label}
            className={`text-xs font-medium transition-colors ${
              i + 1 === currentStep ? 'text-red' : i + 1 < currentStep ? 'text-success' : 'text-ink-4'
            }`}
            style={{ width: `${100 / labels.length}%`, textAlign: i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center' }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
