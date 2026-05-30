'use client';

import { motion } from 'framer-motion';

const STEPS = [
  {
    number: '01',
    title: 'Answer 15 simple questions',
    body: 'Tell us what you enjoy, what feels hard, what you are good at, and what you want to become.',
    image: 'https://images.unsplash.com/photo-1553484771-047a44eee27a?w=700&q=80',
  },
  {
    number: '02',
    title: 'Experts shape your profile',
    body: 'The questions were prepared by career guidance specialists and student mentors, then mapped into strengths, weaknesses, interests, and future paths.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80',
  },
  {
    number: '03',
    title: 'See the top 3 career choices',
    body: 'Get a clear report with the best-fit career choices, improvement areas, and a simple next-step plan.',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=700&q=80',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-red uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink mb-4">
            From answers to a clear future direction
          </h2>
          <p className="text-lg text-ink-3 max-w-xl mx-auto">
            A simple assessment can reveal what a student is naturally good at, where support is needed, and which careers fit best.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group"
            >
              <div className="relative rounded-2xl overflow-hidden mb-5 shadow-md">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
                <div className="absolute top-4 left-4 w-10 h-10 bg-red rounded-xl flex items-center justify-center shadow-glow">
                  <span className="text-white font-bold text-sm">{step.number}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">{step.title}</h3>
              <p className="text-ink-3 leading-relaxed text-sm">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
