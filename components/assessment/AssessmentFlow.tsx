'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School, BookOpen, Compass, GraduationCap, Briefcase,
  HelpCircle, SlidersHorizontal, Telescope, Route,
  ChevronRight, ChevronLeft, Loader2, ShieldCheck, Check, Eye, EyeOff,
} from 'lucide-react';
import Logo from '@/components/brand/Logo';
import { QUESTIONS, scorePsychometric, type AnswerMap } from '@/lib/psychometric';
import { makeReportId, saveLocalReport } from '@/lib/report-store';
import { signUp, signIn, getSession } from '@/lib/firebase';

type StageKey = 'no-idea' | 'confused' | 'exploring' | 'sure';

const MILESTONES = [
  { id: 'class-2-7', label: 'Career Analysis for 2nd to 7th class', icon: School, blurb: 'Discover the multiple intelligences of the student.' },
  { id: 'class-8-10', label: 'Career Analysis for 8th, 9th & 10th Class', icon: BookOpen, blurb: 'Find the most suitable career path and subjects.' },
  { id: 'class-11-12', label: 'Career Analysis for 11th & 12th Class', icon: Compass, blurb: 'Career road map with a detailed execution plan.' },
  { id: 'graduates', label: 'Career Analysis for Graduates', icon: GraduationCap, blurb: 'Most suitable career path and road map.' },
  { id: 'professionals', label: 'Career Analysis for Professionals', icon: Briefcase, blurb: 'Early and mid career counselling with a plan.' },
] as const;

const STAGES: { id: StageKey; label: string; icon: typeof HelpCircle }[] = [
  { id: 'no-idea', label: 'I have no idea about my career', icon: HelpCircle },
  { id: 'confused', label: 'I am confused among various career options', icon: SlidersHorizontal },
  { id: 'exploring', label: 'I am a bit sure but want to explore other options as well', icon: Telescope },
  { id: 'sure', label: 'I am very sure about my career choice but need an execution plan', icon: Route },
];

const TABS = ['Set your milestone', 'Select your current stage', 'Start assessment'];

export default function AssessmentFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);

  // collected data
  const [name, setName] = useState('');
  const [dreamCareer, setDreamCareer] = useState('');
  const [milestone, setMilestone] = useState<string>('');
  const [currentDoing, setCurrentDoing] = useState('');
  const [stage, setStage] = useState<StageKey | ''>('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [notRobot, setNotRobot] = useState(false);

  // question runner
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  // submission
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  const milestoneLabel = MILESTONES.find((m) => m.id === milestone)?.label ?? '';
  const doingOptions = milestoneLabel
    ? [`Career Planning — ${milestoneLabel.replace('Career Analysis for ', '')} (English)`,
       `Subject & stream guidance — ${milestoneLabel.replace('Career Analysis for ', '')}`]
    : [];

  const canNextMilestone = name.trim().length > 1 && milestone;
  const canNextStage = currentDoing && stage;
  const canStart = email.trim().includes('@') && notRobot;

  const totalQ = QUESTIONS.length;
  const setAnswer = (id: string, value: number) => setAnswers((s) => ({ ...s, [id]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const step = (msg: string, pct: number) => { setStatusMsg(msg); setProgress(pct); };
    try {
      step('Scoring your answers…', 25);
      const profile = scorePsychometric(answers, name, dreamCareer);
      const id = makeReportId();

      step('Building your personalised report…', 55);
      saveLocalReport(id, profile);

      // Firebase: sign in/up if a password was provided, then save to Firestore
      step('Saving your report…', 80);
      let session = getSession();
      if (!session && password.trim().length >= 6 && email.includes('@')) {
        try {
          session = await signUp(email.trim(), password.trim(), name.trim());
        } catch (e) {
          // account may exist → try sign in
          try { session = await signIn(email.trim(), password.trim()); } catch { /* continue anonymously */ }
        }
      }
      if (session) {
        const { saveReport } = await import('@/lib/firebase');
        await saveReport(id, profile, session);
      }

      step('Report ready — redirecting…', 100);
      setTimeout(() => router.push(`/report/view?id=${id}`), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  /* ---------- submission overlay ---------- */
  if (submitting) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#F4D4D6" strokeWidth="8" />
              <motion.circle cx="48" cy="48" r="40" fill="none" stroke="#E0242E" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={251} animate={{ strokeDashoffset: 251 - (251 * progress) / 100 }} transition={{ duration: 0.5 }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-extrabold text-red">{progress}%</span>
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-ink mb-2">Analysing your profile{name ? `, ${name.split(' ')[0]}` : ''}</h2>
          <p className="text-ink-3 text-sm">{statusMsg}</p>
          {error && <div className="mt-6 bg-red-soft border border-red-line rounded-xl p-4 text-sm text-red">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={32} /></Link>
          <Link href="/dashboard" className="text-sm font-semibold text-ink-3 hover:text-ink">Home</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-line bg-white">
          {TABS.map((t, i) => {
            const active = phase >= i;
            const current = (phase <= 2 && phase === i) || (phase >= 3 && i === 2);
            return (
              <div key={t} className={`px-3 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors ${
                current ? 'bg-red text-white' : active ? 'bg-red-soft text-red' : 'text-ink-4'}`}>{t}</div>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {/* PHASE 0: MILESTONE */}
          {phase === 0 && (
            <motion.div key="p0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-2xl border border-line shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-ink text-center mb-6">Select your Milestone</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
                <div>
                  <label className="text-sm font-semibold text-ink-2 block mb-1.5">Your Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-ink-2 block mb-1.5">Dream career <span className="text-ink-4 font-normal">(optional)</span></label>
                  <input value={dreamCareer} onChange={(e) => setDreamCareer(e.target.value)} placeholder="e.g. Doctor, Designer"
                    className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
                </div>
              </div>
              <p className="text-sm font-bold text-ink-2 mb-3">I need guidance for <span className="text-ink-4 font-medium">(Select any one)</span>:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MILESTONES.map(({ id, label, icon: Icon, blurb }) => {
                  const selected = milestone === id;
                  return (
                    <button key={id} onClick={() => setMilestone(id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${selected ? 'border-red bg-red-soft' : 'border-line hover:border-red-line bg-white'}`}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${selected ? 'bg-red text-white' : 'bg-bg text-ink-3'}`}><Icon className="w-5 h-5" /></div>
                      <p className="font-bold text-sm text-ink leading-snug">{label}</p>
                      <p className="text-xs text-ink-4 mt-1">{blurb}</p>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-8">
                <Link href="/sign-in" className="text-sm font-semibold text-ink-3 hover:text-red">Existing user login</Link>
                <button disabled={!canNextMilestone} onClick={() => setPhase(1)}
                  className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-xl shadow-glow disabled:opacity-50 disabled:shadow-none">Next <ChevronRight className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}

          {/* PHASE 1: CURRENT STAGE */}
          {phase === 1 && (
            <motion.div key="p1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-2xl border border-line shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-ink text-center mb-6">Set your current stage</h2>
              <div className="max-w-xl mx-auto mb-6">
                <label className="text-sm font-bold text-ink-2 block mb-1.5">I&apos;m currently doing:</label>
                <select value={currentDoing} onChange={(e) => setCurrentDoing(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red">
                  <option value="">Please select your current stage</option>
                  {doingOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <p className="text-sm font-bold text-ink-2 mb-3 text-center">Define your current stage:</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {STAGES.map(({ id, label, icon: Icon }) => {
                  const selected = stage === id;
                  return (
                    <button key={id} onClick={() => setStage(id)}
                      className={`text-center p-4 rounded-xl border-2 transition-all ${selected ? 'border-red bg-red-soft' : 'border-line hover:border-red-line bg-white'}`}>
                      <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 ${selected ? 'bg-red text-white' : 'bg-bg text-ink-3'}`}><Icon className="w-6 h-6" /></div>
                      <p className="text-xs font-semibold text-ink-2 leading-snug">{label}</p>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-8">
                <button onClick={() => setPhase(0)} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft className="w-4 h-4" /> Back</button>
                <button disabled={!canNextStage} onClick={() => setPhase(2)}
                  className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-xl shadow-glow disabled:opacity-50 disabled:shadow-none">Next <ChevronRight className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}

          {/* PHASE 2: START ASSESSMENT (details) */}
          {phase === 2 && (
            <motion.div key="p2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-2xl border border-line shadow-sm p-6 sm:p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-extrabold text-ink text-center mb-1">Let&apos;s start</h2>
              <p className="text-center text-sm text-ink-3 mb-6">Add a password to save your report to your OneGrasp account (optional).</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
                <Field label="Location" value={location} onChange={setLocation} placeholder="City" />
                <Field label="Phone number" value={phone} onChange={setPhone} placeholder="Optional" />
                <Field label="Age (in years)" value={age} onChange={setAge} placeholder="e.g. 14" />
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-ink-2 block mb-1.5">Create a password <span className="text-ink-4 font-normal">(optional, min 6 chars)</span></label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => setNotRobot((v) => !v)}
                className={`mt-5 w-full sm:w-64 flex items-center gap-3 px-4 py-3 rounded-lg border ${notRobot ? 'border-success bg-green-50' : 'border-line bg-bg'}`}>
                <span className={`w-5 h-5 rounded flex items-center justify-center border ${notRobot ? 'bg-success border-success' : 'border-ink-4 bg-white'}`}>{notRobot && <Check className="w-3.5 h-3.5 text-white" />}</span>
                <span className="text-sm text-ink-2">I&apos;m not a robot</span>
                <ShieldCheck className="w-5 h-5 text-ink-4 ml-auto" />
              </button>
              <div className="flex items-center justify-between mt-8">
                <button onClick={() => setPhase(1)} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft className="w-4 h-4" /> Back</button>
                <button disabled={!canStart} onClick={() => setPhase(3)}
                  className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-xl shadow-glow disabled:opacity-50 disabled:shadow-none">Start <ChevronRight className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}

          {/* PHASE 3: INSTRUCTIONS */}
          {phase === 3 && (
            <motion.div key="p3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-2xl border border-line shadow-sm p-6 sm:p-8 max-w-2xl mx-auto">
              <div className="bg-red-soft border border-red-line rounded-xl px-4 py-2 mb-5"><h2 className="font-bold text-red">Instructions</h2></div>
              <p className="text-sm text-ink-2 mb-4">The Career Profiler consists of {totalQ} psychometric questions covering your personality, interests, emotional intelligence and skills. Read carefully.</p>
              <p className="text-sm font-bold text-red mb-2">Try not to think too much while answering:</p>
              <ul className="text-sm text-ink-2 space-y-1 list-disc pl-5 mb-5">
                <li>Answer honestly — there are <b>no right or wrong</b> answers.</li>
                <li>There is <b>no time limit</b>. Take your time.</li>
                <li>Go with your first instinct for each statement.</li>
                <li>Your answers combine into one personalised career report.</li>
              </ul>
              <div className="flex items-center justify-between">
                <button onClick={() => setPhase(2)} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft className="w-4 h-4" /> Back</button>
                <button onClick={() => { setQIndex(0); setPhase(4); }} className="inline-flex items-center gap-2 bg-success text-white font-semibold px-6 py-3 rounded-xl shadow-sm">Start test <ChevronRight className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}

          {/* PHASE 4: QUESTIONS */}
          {phase === 4 && (
            <motion.div key="p4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-2xl border border-line shadow-sm p-6 sm:p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-2 text-xs font-semibold text-ink-3">
                <span>Question {qIndex + 1} of {totalQ}</span>
                <span>{Math.round((qIndex / totalQ) * 100)}%</span>
              </div>
              <div className="h-2 bg-line-2 rounded-full overflow-hidden mb-6">
                <motion.div className="h-full bg-red" animate={{ width: `${(qIndex / totalQ) * 100}%` }} />
              </div>
              {(() => {
                const q = QUESTIONS[qIndex];
                const selected = answers[q.id];
                return (
                  <div>
                    <p className="text-lg font-bold text-ink mb-5">{q.text}</p>
                    <div className="space-y-2.5">
                      {q.options.map((opt, i) => {
                        const isSel = selected === i;
                        return (
                          <button key={opt} onClick={() => setAnswer(q.id, i)}
                            className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-3 ${isSel ? 'border-red bg-red-soft text-red' : 'border-line hover:border-red-line text-ink-2'}`}>
                            <span className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${isSel ? 'border-red' : 'border-ink-4'}`}>{isSel && <span className="w-2.5 h-2.5 rounded-full bg-red" />}</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-8">
                      <button onClick={() => (qIndex === 0 ? setPhase(3) : setQIndex((i) => i - 1))} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft className="w-4 h-4" /> Back</button>
                      {qIndex < totalQ - 1 ? (
                        <button disabled={selected === undefined} onClick={() => setQIndex((i) => i + 1)}
                          className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-xl shadow-glow disabled:opacity-50 disabled:shadow-none">Next <ChevronRight className="w-4 h-4" /></button>
                      ) : (
                        <button disabled={selected === undefined} onClick={handleSubmit}
                          className="inline-flex items-center gap-2 bg-success text-white font-semibold px-6 py-3 rounded-xl shadow-sm disabled:opacity-50"><Check className="w-4 h-4" /> See my results</button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-ink-2 block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
    </div>
  );
}
