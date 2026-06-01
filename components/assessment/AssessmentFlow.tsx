'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School, BookOpen, Compass, GraduationCap, Briefcase,
  HelpCircle, SlidersHorizontal, Telescope, Route,
  ChevronRight, ChevronLeft, ShieldCheck, Check, Eye, EyeOff,
  Clock, Flag, CheckCircle2, Circle, AlertCircle, ListChecks,
} from 'lucide-react';
import Logo from '@/components/brand/Logo';
import {
  QUESTIONS, SECTIONS, questionsForSection,
  type AnswerMap, type SectionId,
} from '@/lib/assessment-questions';
import { scoreAssessment } from '@/lib/assessment-engine';
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

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function AssessmentFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const isQuestionPhase = phase === 4;

  // collected data
  const [name, setName] = useState('');
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
  const total = QUESTIONS.length;
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [introSection, setIntroSection] = useState<SectionId | null>(null);
  const [ackIntros, setAckIntros] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalLeft, setTotalLeft] = useState(0);
  const [showPalette, setShowPalette] = useState(false);

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

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  // Password is optional; if provided it must meet Firebase's 6-char minimum.
  const isValidPassword = !password.trim() || password.trim().length >= 6;
  const canNextMilestone = name.trim().length > 1 && milestone;
  const canNextStage = currentDoing && stage;
  const canStart = isValidEmail && notRobot && isValidPassword;

  // section boundaries
  const firstIndexOf = useMemo(() => {
    const map: Record<string, number> = {};
    QUESTIONS.forEach((q, i) => { if (map[q.section] === undefined) map[q.section] = i; });
    return map;
  }, []);

  const setAnswer = (id: string, value: number) => setAnswers((s) => ({ ...s, [id]: value }));

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError('');
    const step = (msg: string, pct: number) => { setStatusMsg(msg); setProgress(pct); };
    try {
      step('Scoring your answers…', 25);
      const profile = scoreAssessment(answers, name);
      const id = makeReportId();

      step('Building your personalised report…', 55);
      saveLocalReport(id, profile);

      // Authentication + cloud save are enhancements. The report is already
      // saved locally, so anything that fails here must NOT block the redirect.
      step('Saving your report…', 80);
      try {
        const emailValue = email.trim();
        const passwordValue = password.trim();
        let session = getSession();

        if (!session && emailValue && passwordValue) {
          try {
            session = await signIn(emailValue, passwordValue);
          } catch (err) {
            const code = (err as { code?: string } | null)?.code;
            if (code === 'EMAIL_NOT_FOUND' && isValidPassword) {
              session = await signUp(emailValue, passwordValue, name.trim());
            }
            // Any other auth failure (wrong password, sign-in disabled, etc.)
            // is ignored — the report stays available locally.
          }
        }

        if (session) {
          const { saveReport } = await import('@/lib/firebase');
          await saveReport(id, profile, session);
        }
      } catch {
        // Non-fatal: fall through to the local report.
      }

      step('Report ready — redirecting…', 100);
      router.push(`/report/view?id=${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      // Keep the overlay visible so the error is actually shown, instead of
      // silently dropping the user back onto the last question.
    }
  }, [answers, name, password, email, router]);

  // navigate to an overall question index; show a section intro the first time
  // we enter a new section.
  const goTo = useCallback((idx: number) => {
    if (idx >= total) { handleSubmit(); return; }
    const clamped = Math.max(0, idx);
    const q = QUESTIONS[clamped];
    setQIndex(clamped);
    setVisited((v) => ({ ...v, [q.id]: true }));
    if (firstIndexOf[q.section] === clamped && !ackIntros[q.section]) {
      setIntroSection(q.section);
    }
  }, [total, handleSubmit, firstIndexOf, ackIntros]);

  // begin runner
  const startTest = () => {
    setQIndex(0);
    setIntroSection(QUESTIONS[0].section);
    setPhase(4);
  };

  const beginSection = () => {
    if (introSection) setAckIntros((a) => ({ ...a, [introSection]: true }));
    setIntroSection(null);
  };

  // per-question + total timers
  const qIndexRef = useRef(qIndex);
  qIndexRef.current = qIndex;
  useEffect(() => {
    if (phase !== 4 || introSection) return;
    const q = QUESTIONS[qIndex];
    setSecondsLeft(q.timeSec);
    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tick);
          // auto-advance when time runs out
          goTo(qIndexRef.current + 1);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [qIndex, introSection, phase, goTo]);

  // global remaining time (sum of remaining questions' budgets)
  useEffect(() => {
    if (phase !== 4 || introSection) return;
    const remainingBudget = QUESTIONS.slice(qIndex).reduce((s, q) => s + q.timeSec, 0);
    setTotalLeft(remainingBudget);
    const t = setInterval(() => setTotalLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [qIndex, introSection, phase]);

  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(marked).filter(Boolean).length;

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
          {error && (
            <div className="mt-6 text-left">
              <div className="bg-red-soft border border-red-line rounded-xl p-4 text-sm text-red">{error}</div>
              <div className="flex items-center justify-center gap-3 mt-4">
                <button onClick={() => { setError(''); setSubmitting(false); }}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink px-5 py-2.5 rounded-xl border border-line bg-white">
                  Back to test
                </button>
                <button onClick={() => handleSubmit()}
                  className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-2.5 rounded-xl shadow-glow">
                  Try again
                </button>
              </div>
            </div>
          )}
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

      {phase < 4 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-line bg-white">
            {TABS.map((t, i) => {
              const active = phase >= i;
              const current = phase === i;
              return (
                <div key={t} className={`px-3 py-3 text-center text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors ${
                  current ? 'bg-red text-white' : active ? 'bg-red-soft text-red' : 'text-ink-4'}`}>{t}</div>
              );
            })}
          </div>
        </div>
      )}

      <div className={isQuestionPhase ? 'w-full px-0 py-0' : 'max-w-5xl mx-auto px-4 sm:px-6 py-8'}>
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

          {/* PHASE 2: DETAILS */}
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
                  {!isValidPassword && (
                    <p className="text-xs text-red mt-1.5">Password must be at least 6 characters — or leave it blank to skip.</p>
                  )}
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

          {/* PHASE 3: INSTRUCTIONS + SECTION OVERVIEW */}
          {phase === 3 && (
            <motion.div key="p3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-2xl border border-line shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
              <div className="bg-red-soft border border-red-line rounded-xl px-4 py-2 mb-5"><h2 className="font-bold text-red">Instructions — please read</h2></div>
              <p className="text-sm text-ink-2 mb-4">
                The Career Profiler has <b>{total} questions</b> across <b>6 sections</b>. Each question has its own timer
                (<b>40–50 seconds</b>) shown at the top. When the timer ends, the test moves to the next question automatically,
                so don&apos;t leave a question blank. You can mark a question for review and jump back to it using the question
                palette. You can also go back to earlier sections and update your answers at any time.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                {SECTIONS.map((s) => (
                  <div key={s.id} className="rounded-xl border border-line p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-red text-white text-xs font-bold flex items-center justify-center">{s.index}</span>
                      <p className="font-bold text-sm text-ink">{s.title}</p>
                      <span className="ml-auto text-[11px] text-ink-4">{questionsForSection(s.id).length} Q</span>
                    </div>
                    <p className="text-xs text-ink-3 leading-relaxed">{s.blurb}</p>
                  </div>
                ))}
              </div>
              <ul className="text-sm text-ink-2 space-y-1 list-disc pl-5 mb-5">
                <li>Sections 1–5 have <b>no right or wrong</b> answers — go with your instinct.</li>
                <li>Section 6 (Analytical) <b>does</b> have correct answers — read carefully.</li>
                <li>A status palette shows answered, not answered and marked-for-review questions.</li>
              </ul>
              <div className="flex items-center justify-between">
                <button onClick={() => setPhase(2)} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft className="w-4 h-4" /> Back</button>
                <button onClick={startTest} className="inline-flex items-center gap-2 bg-success text-white font-semibold px-6 py-3 rounded-xl shadow-sm">Start test <ChevronRight className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}

          {/* PHASE 4: SECTION INTRO */}
          {phase === 4 && introSection && (() => {
            const sec = SECTIONS.find((s) => s.id === introSection)!;
            const count = questionsForSection(sec.id).length;
            return (
              <motion.div key={`intro-${sec.id}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-2xl border border-line shadow-sm p-6 sm:p-10 max-w-2xl mx-auto text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  {SECTIONS.map((s) => (
                    <span key={s.id} className={`h-1.5 rounded-full transition-all ${s.id === sec.id ? 'w-8 bg-red' : ackIntros[s.id] ? 'w-4 bg-red/40' : 'w-4 bg-line-2'}`} />
                  ))}
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-red mb-2">Section {sec.index} of 6</p>
                <h2 className="text-3xl font-extrabold text-ink mb-3">{sec.title}</h2>
                <p className="text-sm text-ink-2 max-w-md mx-auto mb-6">{sec.blurb}</p>
                <div className="bg-bg rounded-xl border border-line p-5 text-left max-w-md mx-auto mb-6">
                  <p className="text-sm font-bold text-ink mb-2">How to answer</p>
                  <p className="text-sm text-ink-2 mb-3">{sec.scale}</p>
                  <ul className="space-y-1.5">
                    {sec.instructions.map((t, i) => (
                      <li key={i} className="text-xs text-ink-3 flex gap-2"><span className="text-red">•</span>{t}</li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-line text-xs text-ink-3">
                    <span className="inline-flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" /> {count} questions</span>
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~45s each</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      const prevIdx = (firstIndexOf[sec.id] ?? 0) - 1;
                      if (prevIdx < 0) {
                        setIntroSection(null);
                        setPhase(3);
                        return;
                      }
                      setIntroSection(null);
                      goTo(prevIdx);
                    }}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink-3 hover:text-ink px-5 py-3 rounded-xl border border-line bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={beginSection} className="inline-flex items-center gap-2 bg-red text-white font-semibold px-8 py-3 rounded-xl shadow-glow">
                    Begin Section {sec.index} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })()}

          {/* PHASE 4: QUESTION */}
          {phase === 4 && !introSection && (() => {
            const q = QUESTIONS[qIndex];
            const sec = SECTIONS.find((s) => s.id === q.section)!;
            const sectionQs = questionsForSection(q.section);
            const withinIdx = sectionQs.findIndex((x) => x.id === q.id);
            const selected = answers[q.id];
            const lowTime = secondsLeft <= 10;
            return (
              <motion.div
                key="p4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="w-full h-[calc(100dvh-4rem)] overflow-hidden"
              >
                {/* timer + section bar */}
                <div className="bg-ink text-white px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-white/50">Section {sec.index} · {sec.title}</p>
                    <p className="text-sm font-bold">Question {qIndex + 1} of {total} <span className="text-white/50 font-normal">· {withinIdx + 1}/{sectionQs.length} in section</span></p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-sm ${lowTime ? 'bg-red text-white animate-pulse' : 'bg-white/10 text-white'}`}>
                      <Clock className="w-4 h-4" /> {fmt(secondsLeft)}
                      <span className="text-[10px] font-normal text-white/60 hidden sm:inline">this question</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/70">
                      <span>Total left</span><span className="font-bold text-white">{fmt(totalLeft)}</span>
                    </div>
                  </div>
                </div>

                {/* progress bar */}
                <div className="h-1.5 bg-line-2">
                  <motion.div className="h-full bg-red" animate={{ width: `${((qIndex + 1) / total) * 100}%` }} />
                </div>

                <div className="grid lg:grid-cols-[1fr_280px] gap-0 bg-white border border-t-0 border-line shadow-sm overflow-hidden h-[calc(100%-3.5rem)]">
                  {/* question */}
                  <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-0">
                    <p className="text-xs font-semibold text-ink-4 mb-2">{sec.scale}</p>
                    <p className="text-lg font-bold text-ink mb-5">{q.prompt}</p>
                    <div className="space-y-2.5">
                      {q.options.map((opt, i) => {
                        const isSel = selected === i;
                        return (
                          <button key={`${q.id}-${i}`} onClick={() => setAnswer(q.id, i)}
                            className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-3 ${isSel ? 'border-red bg-red-soft text-red' : 'border-line hover:border-red-line text-ink-2'}`}>
                            <span className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${isSel ? 'border-red' : 'border-ink-4'}`}>{isSel && <span className="w-2.5 h-2.5 rounded-full bg-red" />}</span>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between mt-8 gap-3 flex-wrap">
                      <button onClick={() => goTo(qIndex - 1)} disabled={qIndex === 0}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink disabled:opacity-40">
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>
                      <button onClick={() => setMarked((m) => ({ ...m, [q.id]: !m[q.id] }))}
                        className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-colors ${marked[q.id] ? 'border-warning bg-yellow-50 text-warning' : 'border-line text-ink-3 hover:border-warning'}`}>
                        <Flag className="w-4 h-4" /> {marked[q.id] ? 'Marked' : 'Mark for review'}
                      </button>
                      {qIndex < total - 1 ? (
                        <button onClick={() => goTo(qIndex + 1)}
                          className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-xl shadow-glow">Save &amp; Next <ChevronRight className="w-4 h-4" /></button>
                      ) : (
                        <button onClick={handleSubmit}
                          className="inline-flex items-center gap-2 bg-success text-white font-semibold px-6 py-3 rounded-xl shadow-sm"><Check className="w-4 h-4" /> Submit test</button>
                      )}
                    </div>
                  </div>

                  {/* palette (desktop) */}
                  <aside className="hidden lg:block border-l border-line bg-bg p-4 min-h-0 overflow-hidden">
                    <PaletteLegend answered={answeredCount} marked={markedCount} total={total} />
                    <Palette
                      qIndex={qIndex} answers={answers} marked={marked} visited={visited}
                      onJump={(i) => goTo(i)}
                    />
                  </aside>
                </div>

                {/* palette (mobile toggle) */}
                <div className="lg:hidden mt-3">
                  <button onClick={() => setShowPalette((v) => !v)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-white border border-line rounded-xl py-3 text-sm font-semibold text-ink-2">
                    <ListChecks className="w-4 h-4" /> {showPalette ? 'Hide' : 'Show'} question palette
                    <span className="text-ink-4">({answeredCount}/{total} answered)</span>
                  </button>
                  {showPalette && (
                    <div className="mt-3 bg-white border border-line rounded-xl p-4">
                      <PaletteLegend answered={answeredCount} marked={markedCount} total={total} />
                      <Palette qIndex={qIndex} answers={answers} marked={marked} visited={visited} onJump={(i) => { goTo(i); setShowPalette(false); }} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- palette components ---------------- */

function PaletteLegend({ answered, marked, total }: { answered: number; marked: number; total: number }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold text-ink-2 mb-2">Question palette</p>
      <div className="space-y-1.5 text-[11px] text-ink-3">
        <Legend color="bg-success" icon={<CheckCircle2 className="w-3 h-3 text-success" />} label={`Answered (${answered})`} />
        <Legend color="bg-warning" icon={<Flag className="w-3 h-3 text-warning" />} label={`Marked for review (${marked})`} />
        <Legend color="bg-white border border-ink-4" icon={<Circle className="w-3 h-3 text-ink-4" />} label={`Not answered (${total - answered})`} />
      </div>
    </div>
  );
}

function Legend({ color, icon, label }: { color: string; icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3.5 h-3.5 rounded ${color}`} />
      {icon}
      <span>{label}</span>
    </div>
  );
}

function Palette({
  qIndex, answers, marked, visited, onJump,
}: {
  qIndex: number; answers: AnswerMap; marked: Record<string, boolean>; visited: Record<string, boolean>;
  onJump: (i: number) => void;
}) {
  let offset = 0;
  return (
    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
      {SECTIONS.map((sec) => {
        const qs = questionsForSection(sec.id);
        const start = offset;
        offset += qs.length;
        return (
          <div key={sec.id}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-4 mb-1.5">{sec.index}. {sec.short}</p>
            <div className="grid grid-cols-5 gap-1.5">
              {qs.map((q, j) => {
                const globalIdx = start + j;
                const isCurrent = globalIdx === qIndex;
                const isAnswered = answers[q.id] !== undefined;
                const isMarked = marked[q.id];
                const wasVisited = visited[q.id];
                let cls = 'bg-white border border-ink-4/40 text-ink-3';
                if (isAnswered && isMarked) cls = 'bg-warning/20 border border-warning text-warning';
                else if (isAnswered) cls = 'bg-success text-white border border-success';
                else if (isMarked) cls = 'bg-warning text-white border border-warning';
                else if (wasVisited) cls = 'bg-red-soft border border-red-line text-red';
                return (
                  <button key={q.id} onClick={() => onJump(globalIdx)}
                    className={`relative h-8 rounded-md text-xs font-bold transition-all ${cls} ${isCurrent ? 'ring-2 ring-ink ring-offset-1' : ''}`}>
                    {globalIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="text-[10px] text-ink-4 flex items-center gap-1 pt-1"><AlertCircle className="w-3 h-3" /> Tap a number to jump to that question.</p>
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
