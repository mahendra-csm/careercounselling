'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, TrendingUp, Users, Award, Sparkles } from 'lucide-react';

const SOCIAL_PROOF = [
  { src: 'https://i.pravatar.cc/48?img=33', alt: 'User' },
  { src: 'https://i.pravatar.cc/48?img=44', alt: 'User' },
  { src: 'https://i.pravatar.cc/48?img=15', alt: 'User' },
  { src: 'https://i.pravatar.cc/48?img=7', alt: 'User' },
  { src: 'https://i.pravatar.cc/48?img=22', alt: 'User' },
];

const STATS_UPDATED = [
  { icon: Users, value: '14,200+', label: 'Students' },
  { icon: TrendingUp, value: '12', label: 'School grades covered' },
  { icon: Award, value: '50+', label: 'Pathways explored' },
];

export default function Hero() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden pt-16">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1600&q=80&auto=format&fit=crop"
          alt="Students learning together"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/55 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-3xl text-white">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 rounded-full bg-white/12 border border-white/20 px-4 py-2 mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Questions designed by leading student-guidance scientists</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6"
          >
            Discover what your child can become — in just 15 questions.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-lg sm:text-xl text-white/85 leading-relaxed mb-8 max-w-2xl"
          >
            Clear top-3 career choices, strengths, weaknesses, and a simple, actionable plan — friendly for students (classes 6–12).
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/assessment"
              className="inline-flex items-center justify-center gap-2 bg-white text-ink font-semibold px-6 py-3.5 rounded-xl hover:bg-red-soft transition-all shadow-lg text-base"
            >
              Start Career Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/abroad-applications"
              className="inline-flex items-center justify-center gap-2 bg-red text-white font-semibold px-6 py-3.5 rounded-xl border border-white/20 hover:bg-red-dark transition-all text-base shadow-glow"
            >
              Overseas Admission
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl"
          >
            {STATS_UPDATED.map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-2xl bg-white/10 border border-white/20 p-4 backdrop-blur-md">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-white/15 rounded-xl mb-3">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-extrabold text-white">{value}</div>
                <div className="text-sm text-white/70">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
