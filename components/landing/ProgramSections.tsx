'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Rocket, ClipboardCheck,
  School, BookOpen, Compass, GraduationCap, Briefcase,
  ArrowRight,
} from 'lucide-react';

const UNLOCK = [
  { icon: LayoutDashboard, title: 'Student Dashboard', body: 'Track your profiling, colleges, exams and boosters from one personalized dashboard.', href: '/dashboard' },
  { icon: Rocket, title: 'Career Boosters', body: 'Online courses, scholarships and virtual internships to get ahead of the curve.', href: '/dashboard/career-boosters' },
  { icon: ClipboardCheck, title: 'Career Suitability', body: 'Psychometric analysis that reveals the careers you are naturally suited for.', href: '/assessment' },
];

const ASSESSMENTS = [
  { icon: School, title: 'Career Analysis for 2nd to 7th class', body: 'Helps find the multiple intelligences of the student.', color: 'from-blue-500 to-blue-600' },
  { icon: BookOpen, title: 'Career Analysis for 8th, 9th & 10th Class', body: 'Find the most suitable career path and subjects.', color: 'from-emerald-500 to-emerald-600' },
  { icon: Compass, title: 'Career Analysis for 11th & 12th Class', body: 'Career path and road map with a detailed execution plan.', color: 'from-orange-500 to-orange-600' },
  { icon: GraduationCap, title: 'Career Analysis for Graduates', body: 'Most suitable career path and detailed career road map.', color: 'from-purple-500 to-purple-600' },
  { icon: Briefcase, title: 'Career Analysis for Professionals', body: 'Early and mid career counselling with a detailed plan.', color: 'from-red to-red-dark' },
];

export default function ProgramSections() {
  return (
    <>
      {/* Unlock your next 20 years */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-bg border border-line rounded-3xl p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink text-center mb-8">
              Unlock your next 20 years career plan today
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {UNLOCK.map(({ icon: Icon, title, body, href }, i) => (
                <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <Link href={href} className="block h-full bg-white border border-line rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-red-line transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-red-soft flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-red" />
                    </div>
                    <h3 className="font-bold text-ink mb-1">{title}</h3>
                    <p className="text-sm text-ink-3 leading-relaxed">{body}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-red mt-3 group-hover:gap-2 transition-all">
                      Open <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Psychometric Career Assessments */}
      <section className="py-20 bg-bg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-red uppercase tracking-widest mb-3">Choose your milestone</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink">Psychometric Career Assessments</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ASSESSMENTS.map(({ icon: Icon, title, body, color }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex flex-col bg-white border border-line rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-ink mb-2 leading-snug">{title}</h3>
                <p className="text-sm text-ink-3 leading-relaxed flex-1">{body}</p>
                <Link href="/assessment" className="inline-flex items-center justify-center gap-2 mt-5 bg-red text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:bg-red-dark transition-all">
                  Start Now <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-ink mb-5">About Us</h2>
          <p className="text-ink-3 leading-relaxed">
            <span className="font-bold text-ink">OneGrasp</span> is dedicated to empowering students and working
            professionals to pursue higher education — whether online or through study-abroad opportunities. Our
            mission is to bridge the gap in education by offering quality, accessible guidance for learners from all
            backgrounds. We help millions advance their careers, reignite their passion for learning, and embark on
            new ventures with confidence.
          </p>
        </div>
      </section>
    </>
  );
}
