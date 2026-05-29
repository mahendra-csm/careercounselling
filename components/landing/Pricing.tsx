'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';

const FREE_FEATURES = [
  '1 full career assessment',
  'Skill gap radar chart',
  '5 job match cards',
  '90-day roadmap (Phase 1)',
  'Downloadable PDF report',
];

const PRO_FEATURES = [
  'Unlimited assessments',
  'Full 3-phase roadmap',
  'Interview prep (8 questions)',
  'Competitive analysis',
  'Email PDF delivery',
  'Progress tracking',
  'Roadmap calendar export',
  'Priority AI analysis',
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-red uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink mb-4">
            Start free. Upgrade when you&apos;re ready.
          </h2>
          <p className="text-lg text-ink-3 max-w-md mx-auto">
            No credit card required. Most people get everything they need from the free tier.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-line rounded-2xl p-8"
          >
            <h3 className="text-lg font-bold text-ink mb-1">Free</h3>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-4xl font-extrabold text-ink">$0</span>
              <span className="text-ink-4 mb-1">/forever</span>
            </div>
            <p className="text-sm text-ink-3 mb-6">Everything you need to get started and see real value.</p>

            <Link
              href="/sign-up"
              className="block w-full text-center border-2 border-ink text-ink font-semibold px-5 py-3 rounded-xl hover:bg-ink hover:text-white transition-all mb-6"
            >
              Get started free
            </Link>

            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-2">
                  <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-ink rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1.5 bg-red rounded-full px-3 py-1">
                <Zap className="w-3 h-3 text-white fill-white" />
                <span className="text-white text-xs font-bold">Popular</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Pro</h3>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-4xl font-extrabold text-white">$19</span>
              <span className="text-ink-4 mb-1">/month</span>
            </div>
            <p className="text-sm text-ink-3 mb-6">The full career intelligence suite. Cancel anytime.</p>

            <Link
              href="/sign-up"
              className="block w-full text-center bg-red text-white font-semibold px-5 py-3 rounded-xl hover:bg-red-dark transition-all shadow-glow mb-6"
            >
              Start 7-day free trial →
            </Link>

            <ul className="space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-3">
                  <Check className="w-4 h-4 text-red mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
