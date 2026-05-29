'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, TrendingUp, Users, Award } from 'lucide-react';

const SOCIAL_PROOF = [
  { src: 'https://i.pravatar.cc/48?img=33', alt: 'User' },
  { src: 'https://i.pravatar.cc/48?img=44', alt: 'User' },
  { src: 'https://i.pravatar.cc/48?img=15', alt: 'User' },
  { src: 'https://i.pravatar.cc/48?img=7', alt: 'User' },
  { src: 'https://i.pravatar.cc/48?img=22', alt: 'User' },
];

const STATS = [
  { icon: Users, value: '14,200+', label: 'Professionals' },
  { icon: TrendingUp, value: '$138k', label: 'Avg salary lift' },
  { icon: Award, value: '847', label: 'Open roles tracked' },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-bg">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-red-soft/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-soft/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 bg-red-soft border border-red-line rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-red rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red">AI-powered career intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink leading-tight mb-6">
              Know exactly{' '}
              <span className="text-red">what's holding</span>{' '}
              your career back.
            </h1>

            <p className="text-lg text-ink-3 leading-relaxed mb-8 max-w-lg">
              Answer 5 questions. Get a 10-page AI analysis of your skill gaps, top job matches,
              and a personalized 90-day roadmap. No fluff — just the truth.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 bg-red text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-red-dark transition-all shadow-glow hover:shadow-glow-lg active:scale-95 text-base"
              >
                Let&apos;s get started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-surface text-ink-2 font-semibold px-6 py-3.5 rounded-xl border border-line hover:bg-line-2 transition-all text-base"
              >
                See how it works
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {SOCIAL_PROOF.map((av, i) => (
                  <img
                    key={i}
                    src={av.src}
                    alt={av.alt}
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-ink-3">
                  <span className="font-semibold text-ink">14,200 professionals</span> already analyzed
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=820&q=80"
                alt="Career professional"
                className="w-full h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
            </div>

            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border border-line min-w-[200px]"
            >
              <p className="text-xs text-ink-4 mb-1">Skill match score</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-extrabold text-ink">87</span>
                <span className="text-ink-3 mb-1 text-sm font-medium">/ 100</span>
              </div>
              <div className="w-full h-2 bg-line-2 rounded-full mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '87%' }}
                  transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
                  className="h-full bg-red rounded-full"
                />
              </div>
            </motion.div>

            {/* AI badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-line"
            >
              <p className="text-xs font-semibold text-ink">Powered by Claude AI</p>
              <p className="text-xs text-ink-4">Analyzed in ~45 seconds</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-20 grid grid-cols-3 gap-4 max-w-lg"
        >
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-red-soft rounded-xl mb-2">
                <Icon className="w-5 h-5 text-red" />
              </div>
              <div className="text-2xl font-extrabold text-ink">{value}</div>
              <div className="text-xs text-ink-4">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
