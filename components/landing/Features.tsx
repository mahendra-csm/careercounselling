'use client';

import { motion } from 'framer-motion';
import { BarChart3, Map, Briefcase, MessageSquare, TrendingUp, FileDown } from 'lucide-react';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Strength radar chart',
    body: 'A 6-dimension radar map showing exactly how you compare across subjects, habits, and confidence. No guessing — just clarity.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80',
    imageLeft: false,
  },
  {
    icon: Briefcase,
    title: 'Top 5 future pathways',
    body: 'Real streams and career directions matched to your strengths and interests. Not generic advice.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&q=80',
    imageLeft: true,
  },
  {
    icon: Map,
    title: '90-day study roadmap',
    body: 'Three phases. Clear tasks. Specific resources. Check things off as you go. It\'s a plan, not a wall of text.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80',
    imageLeft: false,
  },
];

const MINI_FEATURES = [
  { icon: MessageSquare, title: 'Guidance questions', body: '8 custom questions with student-friendly sample answers.' },
  { icon: TrendingUp, title: 'Readiness insights', body: 'Focus benchmarks and growth ranking.' },
  { icon: FileDown, title: 'PDF download', body: 'Beautiful report, ready to share or print.' },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-red uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink mb-4">
            Everything a student needs. Nothing extra.
          </h2>
        </div>

        <div className="space-y-20">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55 }}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  feat.imageLeft ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={feat.imageLeft ? 'lg:order-2' : ''}>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-soft rounded-xl mb-4">
                    <Icon className="w-6 h-6 text-red" />
                  </div>
                  <h3 className="text-2xl font-bold text-ink mb-3">{feat.title}</h3>
                  <p className="text-ink-3 text-base leading-relaxed">{feat.body}</p>
                </div>
                <div className={`rounded-2xl overflow-hidden shadow-lg ${feat.imageLeft ? 'lg:order-1' : ''}`}>
                  <img
                    src={feat.image}
                    alt={feat.title}
                    className="w-full h-72 object-cover"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-20 grid sm:grid-cols-3 gap-6">
          {MINI_FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl p-6 border border-line shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-red-soft rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-red" />
                </div>
                <h4 className="font-bold text-ink mb-1">{f.title}</h4>
                <p className="text-sm text-ink-3">{f.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
