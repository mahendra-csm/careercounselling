'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

/** Per-module accent gradient (from → to). */
export const ACCENTS = {
  red: ['#E0242E', '#9B1B22'],
  blue: ['#2D7FF0', '#16356B'],
  indigo: ['#6366F1', '#3B2E8F'],
  teal: ['#11998E', '#0A5E58'],
  amber: ['#F59E0B', '#B45309'],
  green: ['#27AE60', '#176B3A'],
  violet: ['#9B51E0', '#5B2E94'],
} as const;
export type AccentKey = keyof typeof ACCENTS;

export default function ModuleShell({
  title, description, icon: Icon, children, action, accent = 'red',
}: {
  title: string; description: string; icon: LucideIcon; children: React.ReactNode;
  action?: React.ReactNode; accent?: AccentKey;
}) {
  const [from, to] = ACCENTS[accent];
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-red mb-5">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-7 text-white mb-7 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: `linear-gradient(130deg, ${from}, ${to})` }}>
        {/* decorative pattern */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden>
          <defs><pattern id="ms-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#fff" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#ms-dots)" />
        </svg>
        <div className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-16 -bottom-16 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0 shadow-lg">
          <Icon className="w-8 h-8" />
        </div>
        <div className="relative flex-1">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          <p className="text-white/85 text-sm max-w-2xl mt-0.5">{description}</p>
        </div>
        {action && <div className="relative">{action}</div>}
      </motion.div>

      {children}
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-line rounded-2xl shadow-sm ${className}`}>{children}</div>;
}

export function Pill({ children }: { children: React.ReactNode }) {
  return <span className="inline-block px-2 py-0.5 rounded-full bg-red-soft text-red text-xs font-semibold">{children}</span>;
}
