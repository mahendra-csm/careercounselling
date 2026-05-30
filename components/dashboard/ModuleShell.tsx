'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, type LucideIcon } from 'lucide-react';

export default function ModuleShell({
  title, description, icon: Icon, children, action,
}: {
  title: string; description: string; icon: LucideIcon; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-red mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="gradient-brand rounded-2xl p-7 text-white mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm shrink-0">
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          <p className="text-white/85 text-sm max-w-2xl">{description}</p>
        </div>
        {action}
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
