'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Ananya',
    title: 'Class 10 student',
    prev: 'was unsure about her stream',
    avatar: 'https://i.pravatar.cc/56?img=47',
    text: 'OneGrasp helped me understand my strengths and made choosing my next stream feel much less confusing.',
    score: 94,
  },
  {
    name: 'Rahul',
    title: 'Class 8 student',
    prev: 'was unsure about career options',
    avatar: 'https://i.pravatar.cc/56?img=12',
    text: 'It showed me what I am good at and what I should work on this year. The study plan is actually easy to follow.',
    score: 88,
  },
  {
    name: 'Meera',
    title: 'Class 12 student',
    prev: 'was preparing for board exams',
    avatar: 'https://i.pravatar.cc/56?img=25',
    text: 'The report gave me a clear picture of where I stand and helped me focus on the subjects that matter most.',
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
            Real students. Real growth.
          </h2>
          <p className="text-lg text-ink-3 max-w-lg mx-auto">
            This takes 5 minutes. Most students find it surprisingly honest.
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
