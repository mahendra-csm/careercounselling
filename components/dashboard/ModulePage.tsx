'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, type LucideIcon } from 'lucide-react';

interface ModulePageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  bullets?: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * Styled "module" landing used by the dashboard sub-sections (India Colleges,
 * Abroad Applications, Exams, etc.). These mirror the OneGrasp product modules;
 * the data integrations are placeholders.
 */
export default function ModulePage({
  title, description, icon: Icon, bullets = [], ctaLabel = 'Coming soon', ctaHref,
}: ModulePageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-red mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
        <div className="gradient-brand p-8 text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-4 backdrop-blur-sm">
            <Icon className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">{title}</h1>
          <p className="text-white/85 text-sm max-w-xl">{description}</p>
        </div>

        <div className="p-8">
          {bullets.length > 0 && (
            <ul className="grid sm:grid-cols-2 gap-3 mb-8">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-ink-2">
                  <Sparkles className="w-4 h-4 text-red shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
          )}

          {ctaHref ? (
            <Link href={ctaHref} className="inline-flex items-center gap-2 bg-red text-white font-semibold px-5 py-3 rounded-xl shadow-glow">
              {ctaLabel}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 bg-red-soft text-red font-semibold px-5 py-3 rounded-xl border border-red-line">
              {ctaLabel}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
