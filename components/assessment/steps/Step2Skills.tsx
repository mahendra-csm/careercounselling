'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useAssessmentStore } from '@/store/assessmentStore';
import { SKILL_CATEGORIES } from '@/constants/skills';
import type { StepProps } from '@/types/assessment';

export default function Step2Skills({ onNext, onBack }: StepProps) {
  const { answers, updateAnswers } = useAssessmentStore();
  const [selected, setSelected] = useState<Set<string>>(new Set(answers.currentSkills || []));
  const [custom, setCustom] = useState('');
  const [error, setError] = useState('');

  const toggle = (skill: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
    setError('');
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (!trimmed) return;
    setSelected((prev) => new Set(prev).add(trimmed));
    setCustom('');
  };

  const handleNext = () => {
    if (selected.size < 3) {
      setError('Select at least 3 skills to get a meaningful analysis.');
      return;
    }
    updateAnswers({ currentSkills: Array.from(selected) });
    onNext();
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-ink mb-2">Your current skills</h2>
        <p className="text-ink-3">Tap skills you already have — be honest, this powers your analysis.</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-ink-3">
          <span className="font-bold text-ink">{selected.size}</span> skills selected
        </span>
        {selected.size >= 3 && (
          <span className="text-xs text-success font-medium">Looks good!</span>
        )}
      </div>

      <div className="space-y-5 mb-5">
        {SKILL_CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <p className="text-xs font-semibold text-ink-4 uppercase tracking-wider mb-2">{cat.name}</p>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill) => (
                <motion.button
                  key={skill}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggle(skill)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    selected.has(skill)
                      ? 'bg-red text-white border-red shadow-sm'
                      : 'bg-white text-ink-2 border-line hover:border-ink-4'
                  }`}
                >
                  {skill}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom skill input */}
      <div className="flex gap-2 mb-6">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder="+ Add your own skill"
          className="flex-1 px-4 py-2.5 rounded-xl border border-line bg-white text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red transition-all"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="px-4 py-2.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink-2 transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Custom added skills */}
      {Array.from(selected).filter(s => !SKILL_CATEGORIES.flatMap(c => c.skills).includes(s)).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {Array.from(selected)
            .filter(s => !SKILL_CATEGORIES.flatMap(c => c.skills).includes(s))
            .map((skill) => (
              <span key={skill} className="flex items-center gap-1 px-3 py-1.5 bg-red text-white rounded-full text-sm font-medium">
                {skill}
                <button type="button" onClick={() => toggle(skill)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
        </div>
      )}

      {error && <p className="text-red text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-line text-ink-2 font-semibold py-3 rounded-xl hover:bg-line-2 transition-all"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 bg-red text-white font-semibold py-3 rounded-xl hover:bg-red-dark transition-all shadow-glow active:scale-95"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
