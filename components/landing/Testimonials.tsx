'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    title: 'Senior PM at Stripe',
    prev: 'was an Engineering Manager',
    avatar: 'https://i.pravatar.cc/56?img=47',
    text: "OneGrasp told me exactly what PM skills I was missing after 6 years in engineering. The 90-day roadmap was so specific I almost thought they'd interviewed my hiring manager.",
    score: 94,
  },
  {
    name: 'Marcus Williams',
    title: 'Data Scientist at Spotify',
    prev: 'was a Business Analyst',
    avatar: 'https://i.pravatar.cc/56?img=12',
    text: "I'd been applying to data science roles for 4 months with zero callbacks. OneGrasp showed me I was missing 3 critical skills. I learned them, updated my resume, and landed 2 offers in 6 weeks.",
    score: 88,
  },
  {
    name: 'Priya Nair',
    title: 'Head of Design at Notion',
    prev: 'was a UX Designer',
    avatar: 'https://i.pravatar.cc/56?img=25',
    text: "The competitive analysis section was a wake-up call. I thought I was ready for leadership. Turns out I had real blind spots. Fixing them changed how I showed up in interviews entirely.",
    score: 91,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-red uppercase tracking-widest mb-3">Results</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink mb-4">
            Real people. Real career moves.
          </h2>
          <p className="text-lg text-ink-3 max-w-lg mx-auto">
            This takes 5 minutes. Most people find it surprisingly honest.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-bg border border-line rounded-2xl p-6 hover:shadow-md transition-shadow relative"
            >
              <Quote className="w-8 h-8 text-red-line absolute top-5 right-5" />

              <div className="flex items-center gap-3 mb-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-bold text-ink text-sm">{t.name}</p>
                  <p className="text-xs text-ink-4">{t.title}</p>
                </div>
              </div>

              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-sm text-ink-2 leading-relaxed mb-4 italic">&ldquo;{t.text}&rdquo;</p>

              <div className="flex items-center justify-between pt-3 border-t border-line-2">
                <span className="text-xs text-ink-4">Match score</span>
                <span className="font-extrabold text-red">{t.score}/100</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
