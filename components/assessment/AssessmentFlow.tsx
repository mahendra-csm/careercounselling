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
  MapPin, Maximize, AlertTriangle, Lock, Loader2, ShieldAlert, Languages,
  Mail, KeyRound,
} from 'lucide-react';
import Logo from '@/components/brand/Logo';
import {
  QUESTIONS, SECTIONS, questionsForSection,
  type AnswerMap, type SectionId,
} from '@/lib/assessment-questions';
import { EXAM_LANGS, localizeQuestion, type ExamLang } from '@/lib/assessment-i18n';
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

// Country dialing codes — India default. (flag, dial code, ISO label)
const COUNTRY_CODES: { flag: string; dial: string; iso: string }[] = [
  { flag: '🇮🇳', dial: '+91', iso: 'IN' },
  { flag: '🇺🇸', dial: '+1', iso: 'US' },
  { flag: '🇬🇧', dial: '+44', iso: 'UK' },
  { flag: '🇦🇪', dial: '+971', iso: 'AE' },
  { flag: '🇸🇦', dial: '+966', iso: 'SA' },
  { flag: '🇶🇦', dial: '+974', iso: 'QA' },
  { flag: '🇦🇺', dial: '+61', iso: 'AU' },
  { flag: '🇸🇬', dial: '+65', iso: 'SG' },
  { flag: '🇲🇾', dial: '+60', iso: 'MY' },
  { flag: '🇨🇦', dial: '+1', iso: 'CA' },
  { flag: '🇩🇪', dial: '+49', iso: 'DE' },
  { flag: '🇳🇵', dial: '+977', iso: 'NP' },
];

const CLASS_OPTIONS = ['Below Class 8', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Graduate', 'Other'];

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
  const [countryCode, setCountryCode] = useState('+91'); // default India
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [notRobot, setNotRobot] = useState(false);

  // question runner
  const total = QUESTIONS.length;
  const [lang, setLang] = useState<ExamLang>('en'); // exam language for prompts + options
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [introSection, setIntroSection] = useState<SectionId | null>(null);
  const [ackIntros, setAckIntros] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalLeft, setTotalLeft] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [timedOut, setTimedOut] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState('');

  // anti-proxy monitoring (full-screen + tab focus + copy/shortcuts)
  const [fsWarnings, setFsWarnings] = useState(0);
  const [showFsWarning, setShowFsWarning] = useState(false);
  const [terminated, setTerminated] = useState(false);
  const [violationReason, setViolationReason] = useState('You left full-screen mode');

  // submission
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  // account creation (done up front, before the exam)
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  // completion + lead capture (after the exam)
  const [done, setDone] = useState(false);
  const [reportId, setReportId] = useState('');
  const [completionPct, setCompletionPct] = useState(0);
  const [klass, setKlass] = useState('');
  const [rating, setRating] = useState(0);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');

  const milestoneLabel = MILESTONES.find((m) => m.id === milestone)?.label ?? '';
  const doingOptions = milestoneLabel
    ? [`Career Planning — ${milestoneLabel.replace('Career Analysis for ', '')} (English)`,
       `Subject & stream guidance — ${milestoneLabel.replace('Career Analysis for ', '')}`]
    : [];

  // ---- field validation ----
  const isValidName = /^[a-zA-Z][a-zA-Z\s.'-]{1,}$/.test(name.trim());
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  // India: 10 digits starting 6-9. Other countries: 6–15 digits.
  const isValidPhone = countryCode === '+91' ? /^[6-9]\d{9}$/.test(phone.trim()) : /^\d{6,15}$/.test(phone.trim());
  const maxPhoneDigits = countryCode === '+91' ? 10 : 15;
  const ageNum = Number(age.trim());
  const isValidAge = Number.isInteger(ageNum) && ageNum >= 10 && ageNum <= 20;
  const isValidLocation = location.trim().length > 2;
  // Password is REQUIRED — these credentials become the student's login.
  const isValidPassword = password.trim().length >= 6;
  const canNextMilestone = isValidName && milestone;
  const canNextStage = currentDoing && stage;
  const canStart = isValidEmail && isValidPhone && isValidAge && isValidLocation && notRobot && isValidPassword;

  // section boundaries
  const firstIndexOf = useMemo(() => {
    const map: Record<string, number> = {};
    QUESTIONS.forEach((q, i) => { if (map[q.section] === undefined) map[q.section] = i; });
    return map;
  }, []);

  const setAnswer = (id: string, value: number) => {
    if (timedOut[id]) return; // locked: time already expired for this question
    setAnswers((s) => ({ ...s, [id]: value }));
    // If this question was flagged for review, changing the answer resolves it.
    if (marked[id]) {
      setMarked((m) => ({ ...m, [id]: false }));
      setToast('Marked-for-review resolved — your answer was updated.');
    }
  };

  // auto-dismiss the toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // ---- anti-proxy full-screen helpers ----
  const enterFullscreen = useCallback(() => {
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
    const req = el.requestFullscreen ?? el.webkitRequestFullscreen;
    if (req) req.call(el).catch(() => { /* denied — non-fatal */ });
  }, []);
  const exitFullscreen = useCallback(() => {
    const d = document as Document & { webkitExitFullscreen?: () => Promise<void> };
    if (d.fullscreenElement || (d as { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
      (d.exitFullscreen ?? d.webkitExitFullscreen)?.call(d).catch(() => {});
    }
  }, []);

  // Records a proctoring violation (fullscreen exit, tab switch, focus loss).
  // Multiple browser signals can fire for one action, so we coalesce within a
  // short window. First violation = one warning; the second ends the exam.
  const lastViolationAt = useRef(0);
  const recordViolation = useCallback((reason: string) => {
    const now = Date.now();
    if (now - lastViolationAt.current < 1200) return; // collapse duplicate signals from one action
    lastViolationAt.current = now;
    setViolationReason(reason);
    setFsWarnings((w) => {
      const next = w + 1;
      if (next >= 2) { setTerminated(true); setShowFsWarning(false); }
      else { setShowFsWarning(true); }
      return next;
    });
  }, []);

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
            // Create the account from the credentials entered before the exam —
            // these become the student's login. (Sign-up first: newer Firebase
            // projects return a generic INVALID_LOGIN_CREDENTIALS for unknown
            // emails, so we can't rely on EMAIL_NOT_FOUND from a sign-in attempt.)
            session = await signUp(emailValue, passwordValue, name.trim());
          } catch (err) {
            const code = (err as { code?: string } | null)?.code ?? '';
            if (code.includes('EMAIL_EXISTS')) {
              // Returning student — sign in with the same credentials instead.
              try {
                session = await signIn(emailValue, passwordValue);
              } catch {
                // Wrong password for an existing email — report stays local only.
              }
            }
            // Any other failure (e.g. email/password sign-in disabled in Firebase)
            // is non-fatal — the report is already saved locally.
          }
        }

        if (session) {
          const { saveReport } = await import('@/lib/firebase');
          await saveReport(id, profile, session);
        }
      } catch {
        // Non-fatal: fall through to the local report.
      }

      // Show the completion + lead-capture screen instead of jumping straight
      // to the report. The student confirms their details, rates the exam, and
      // we email the report to the recipient.
      step('Report ready!', 100);
      const pct = Math.round((Object.keys(answers).length / total) * 100);
      setReportId(id);
      setCompletionPct(pct);
      setRecipientEmail(email.trim());
      setSubmitting(false);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      // Keep the overlay visible so the error is actually shown, instead of
      // silently dropping the user back onto the last question.
    }
  }, [answers, name, password, email, router, total]);

  // Stores the full student lead in Firestore and emails the report to the
  // chosen recipient (from support@onegrasp.com).
  const sendReport = async () => {
    setSendError('');
    const recipient = recipientEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) { setSendError('Enter a valid recipient email.'); return; }
    if (!klass) { setSendError('Please select your class.'); return; }
    if (!rating) { setSendError('Please rate your exam out of 10.'); return; }
    setSending(true);
    const session = getSession();
    const fullPhone = phone.trim() ? `${countryCode} ${phone.trim()}` : '';
    const reportUrl = `${window.location.origin}/report/view?id=${reportId}`;

    // 1) Persist the lead (best-effort — never blocks the user).
    try {
      const { saveLead } = await import('@/lib/firebase');
      await saveLead({
        name: name.trim(), email: email.trim(), phone: fullPhone, class: klass,
        rating, recipientEmail: recipient, reportId, completion: completionPct,
        milestone, stage, location, age,
      }, session);
    } catch { /* non-fatal */ }

    // 2) Email the report.
    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient, name: name.trim(), email: email.trim(), phone: fullPhone,
          class: klass, rating, completion: completionPct, reportUrl,
        }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not send the report email.');
      setSent(true);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Could not send the report email.');
    } finally {
      setSending(false);
    }
  };

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

  // Create the student's account from the credentials entered above, then move
  // on to the instructions. Doing this up front guarantees the email + password
  // are a working login and surfaces any problem before the exam starts.
  const startWithAccount = async () => {
    setAuthError('');
    if (getSession()) { setPhase(3); return; } // already signed in
    setAuthBusy(true);
    try {
      await signUp(email.trim(), password.trim(), name.trim());
      setPhase(3);
    } catch (err) {
      const code = (err as { code?: string } | null)?.code ?? '';
      if (code.includes('EMAIL_EXISTS')) {
        // Email already registered — confirm the password matches by signing in.
        try {
          await signIn(email.trim(), password.trim());
          setPhase(3);
        } catch {
          setAuthError('This email is already registered. Enter the password you set earlier, or sign in instead.');
        }
      } else {
        setAuthError(err instanceof Error ? err.message : 'Could not set up your account. Please try again.');
      }
    } finally {
      setAuthBusy(false);
    }
  };

  // begin runner
  const startTest = () => {
    enterFullscreen();
    setFsWarnings(0);
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
    // Already expired → keep it locked, don't restart the timer on revisit.
    if (timedOut[q.id]) { setSecondsLeft(0); return; }
    setSecondsLeft(q.timeSec);
    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tick);
          // lock this question, then auto-advance when time runs out
          setTimedOut((t) => ({ ...t, [q.id]: true }));
          goTo(qIndexRef.current + 1);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [qIndex, introSection, phase, goTo, timedOut]);

  // global remaining time (sum of remaining questions' budgets)
  useEffect(() => {
    if (phase !== 4 || introSection) return;
    const remainingBudget = QUESTIONS.slice(qIndex).reduce((s, q) => s + q.timeSec, 0);
    setTotalLeft(remainingBudget);
    const t = setInterval(() => setTotalLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [qIndex, introSection, phase]);

  // anti-proxy: during the test the student must stay in full screen AND keep the
  // exam tab focused. Exiting full screen, switching tabs/apps, or moving focus
  // out of the window all count. First violation = one warning; a second ends it.
  // A short grace period after entering the exam avoids false positives from the
  // initial fullscreen transition (which briefly blurs the window).
  useEffect(() => {
    if (phase !== 4 || submitting || terminated) return;
    let armed = false;
    const armTimer = setTimeout(() => { armed = true; }, 1500);

    const onFsChange = () => {
      const inFs = Boolean(document.fullscreenElement || (document as { webkitFullscreenElement?: Element }).webkitFullscreenElement);
      if (!inFs && armed) recordViolation('You left full-screen mode');
    };
    const onVisibility = () => {
      if (document.hidden && armed) recordViolation('You switched away from the exam tab');
    };
    const onBlur = () => { if (armed) recordViolation('You moved focus out of the exam window'); };

    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  }, [phase, submitting, terminated, recordViolation]);

  // anti-proxy: block copy / cut / paste, right-click and risky shortcuts
  // (devtools, new tab/window, print, view-source) while the test is running.
  useEffect(() => {
    if (phase !== 4 || submitting || terminated) return;
    const block = (e: Event) => { e.preventDefault(); setToast('This action is disabled during the exam.'); };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const isShortcut =
        (ctrl && ['c', 'v', 'x', 't', 'n', 'p', 's', 'u'].includes(k)) ||
        k === 'f12' ||
        (ctrl && e.shiftKey && ['i', 'j', 'c'].includes(k));
      if (isShortcut) { e.preventDefault(); setToast('Shortcuts are disabled during the exam.'); }
    };
    document.addEventListener('contextmenu', block);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('paste', block);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('paste', block);
      document.removeEventListener('keydown', onKey);
    };
  }, [phase, submitting, terminated]);

  // leave full screen once the test is over
  useEffect(() => {
    if (submitting || terminated) exitFullscreen();
  }, [submitting, terminated, exitFullscreen]);

  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(marked).filter(Boolean).length;

  /* ---------- exam terminated (proxy detected) ---------- */
  if (terminated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl border border-red-line shadow-md p-8">
          <div className="w-16 h-16 rounded-full bg-red-soft flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-8 h-8 text-red" />
          </div>
          <h2 className="text-2xl font-extrabold text-ink mb-2">Assessment ended</h2>
          <p className="text-ink-3 text-sm mb-2">{violationReason} again after a warning.</p>
          <p className="text-ink-3 text-sm mb-6">
            To keep the assessment fair and proxy-free, it has been stopped. Please contact your
            counsellor to retake it.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-xl shadow-glow">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- completion + lead capture ---------- */
  if (done) {
    const recipientValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim());
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-10">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-line shadow-md p-6 sm:p-8">
          {!sent ? (
            <>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-9 h-9 text-success" />
                </div>
                <h2 className="text-2xl font-extrabold text-ink mb-1">
                  Well done{name ? `, ${name.split(' ')[0]}` : ''}! 🎉
                </h2>
                <p className="text-sm text-ink-3">
                  You&apos;ve successfully completed the assessment — <b className="text-ink">{completionPct}% completed</b>.
                </p>
                <div className="mt-3 h-2 w-full rounded-full bg-line-2 overflow-hidden">
                  <div className="h-full rounded-full bg-success" style={{ width: `${completionPct}%` }} />
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-bold text-ink mb-3">Confirm your details to receive your report</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-ink-2 block mb-1">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-2 block mb-1">Phone</label>
                    <input value={phone ? `${countryCode} ${phone}` : ''} readOnly className="w-full px-3 py-2.5 rounded-xl border border-line bg-line-2/40 text-sm text-ink-3" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-2 block mb-1">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-2.5 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-2 block mb-1">Class</label>
                    <select value={klass} onChange={(e) => setKlass(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red">
                      <option value="">Select your class</option>
                      {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-semibold text-ink-2 block mb-1.5">How would you rate your exam experience? <span className="text-ink-4 font-normal">(1–10)</span></label>
                  <div className="grid grid-cols-10 gap-1.5">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <button key={n} type="button" onClick={() => setRating(n)}
                        className={`h-9 rounded-lg text-sm font-bold transition-all ${rating === n ? 'bg-red text-white' : 'bg-bg border border-line text-ink-3 hover:border-red-line'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-semibold text-ink-2 block mb-1">Send report to</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-ink-4 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} type="email" placeholder="recipient@email.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
                  </div>
                  <p className="text-[11px] text-ink-4 mt-1">We&apos;ll email your report here from support@onegrasp.com.</p>
                </div>

                {sendError && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-line bg-red-soft p-3 text-sm text-red">
                    <AlertCircle className="w-4 h-4 mt-px shrink-0" /> <span>{sendError}</span>
                  </div>
                )}

                <button onClick={sendReport} disabled={sending || !recipientValid || !klass || !rating}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-red text-white font-semibold py-3 rounded-xl shadow-glow disabled:opacity-50 disabled:shadow-none">
                  {sending ? (<><Loader2 className="w-4 h-4 animate-spin" /> Sending your report…</>) : (<><Mail className="w-4 h-4" /> Send my report</>)}
                </button>
                <button onClick={() => router.push(`/report/view?id=${reportId}`)}
                  className="mt-2 w-full text-center text-sm font-semibold text-ink-3 hover:text-ink">
                  View report now without emailing
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-success" />
              </div>
              <h2 className="text-2xl font-extrabold text-ink mb-1">Report sent! 📩</h2>
              <p className="text-sm text-ink-3 mb-6">
                Your Career Discovery Report is on its way to <b className="text-ink">{recipientEmail}</b>. Check the inbox (and spam) in a minute.
              </p>
              <button onClick={() => router.push(`/report/view?id=${reportId}`)}
                className="w-full inline-flex items-center justify-center gap-2 bg-red text-white font-semibold py-3 rounded-xl shadow-glow">
                View your report <ChevronRight className="w-4 h-4" />
              </button>
              <Link href="/dashboard" className="mt-2 inline-block w-full text-center text-sm font-semibold text-ink-3 hover:text-ink">
                Go to dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

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
                  {name.trim() && !isValidName && (
                    <p className="text-xs text-red mt-1.5">Enter a valid name (letters only, at least 2 characters).</p>
                  )}
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
              <h2 className="text-2xl font-extrabold text-ink text-center mb-1">Create your account</h2>
              <p className="text-center text-sm text-ink-3 mb-6">This email &amp; password become your login — use them later to sign in and view your dashboard &amp; report.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-ink-2 block mb-1.5">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
                  <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-ink-4">
                    <Mail className="w-3.5 h-3.5 mt-px shrink-0 text-red" />
                    You&apos;ll receive your report and all updates on this email — and use it to log in.
                  </p>
                  {email.trim() && !isValidEmail && <p className="text-xs text-red mt-1">Enter a valid email address.</p>}
                </div>
                <LocationField value={location} onChange={setLocation}
                  error={location.trim() && !isValidLocation ? 'Pick your location from the suggestions.' : ''} />
                <div>
                  <label className="text-sm font-semibold text-ink-2 block mb-1.5">Phone number</label>
                  <div className="flex items-stretch rounded-xl border border-line bg-bg focus-within:ring-2 focus-within:ring-red/30 focus-within:border-red overflow-hidden">
                    <select value={countryCode} onChange={(e) => { setCountryCode(e.target.value); setPhone(''); }}
                      className="shrink-0 bg-transparent pl-3 pr-2 text-sm font-semibold text-ink-2 border-r border-line focus:outline-none cursor-pointer">
                      {COUNTRY_CODES.map((c) => <option key={c.iso} value={c.dial}>{c.flag} {c.dial}</option>)}
                    </select>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, maxPhoneDigits))}
                      placeholder={countryCode === '+91' ? '10-digit mobile' : 'mobile number'}
                      className="flex-1 min-w-0 bg-transparent px-3 py-3 text-sm focus:outline-none" />
                  </div>
                  {phone.trim() && !isValidPhone && (
                    <p className="text-xs text-red mt-1.5">{countryCode === '+91' ? 'Enter a valid 10-digit mobile number.' : 'Enter a valid phone number (6–15 digits).'}</p>
                  )}
                </div>
                <Field label="Age (in years)" value={age} onChange={(v) => setAge(v.replace(/\D/g, '').slice(0, 2))}
                  placeholder="e.g. 14"
                  error={age.trim() && !isValidAge ? 'Age must be between 10 and 20.' : ''} />
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-ink-2 block mb-1.5">Create a password <span className="text-ink-4 font-normal">(min 6 characters)</span></label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-ink-4">
                    <KeyRound className="w-3.5 h-3.5 mt-px shrink-0 text-red" />
                    Remember this — it&apos;s the password you&apos;ll use to log in to your dashboard.
                  </p>
                  {password.trim() && password.trim().length < 6 && (
                    <p className="text-xs text-red mt-1">Password must be at least 6 characters.</p>
                  )}
                </div>
              </div>
              <button onClick={() => setNotRobot((v) => !v)}
                className={`mt-5 w-full sm:w-64 flex items-center gap-3 px-4 py-3 rounded-lg border ${notRobot ? 'border-success bg-green-50' : 'border-line bg-bg'}`}>
                <span className={`w-5 h-5 rounded flex items-center justify-center border ${notRobot ? 'bg-success border-success' : 'border-ink-4 bg-white'}`}>{notRobot && <Check className="w-3.5 h-3.5 text-white" />}</span>
                <span className="text-sm text-ink-2">I&apos;m not a robot</span>
                <ShieldCheck className="w-5 h-5 text-ink-4 ml-auto" />
              </button>
              {authError && (
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-line bg-red-soft p-3 text-sm text-red">
                  <AlertCircle className="w-4 h-4 mt-px shrink-0" />
                  <span>{authError} <Link href="/sign-in" className="font-semibold underline">Sign in</Link></span>
                </div>
              )}
              <div className="flex items-center justify-between mt-8">
                <button onClick={() => setPhase(1)} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft className="w-4 h-4" /> Back</button>
                <button disabled={!canStart || authBusy} onClick={startWithAccount}
                  className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-xl shadow-glow disabled:opacity-50 disabled:shadow-none">
                  {authBusy ? (<><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>) : (<>Start <ChevronRight className="w-4 h-4" /></>)}
                </button>
              </div>
            </motion.div>
          )}

          {/* PHASE 3: INSTRUCTIONS + SECTION OVERVIEW */}
          {phase === 3 && (
            <motion.div key="p3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-2xl border border-line shadow-sm p-5 sm:p-6 max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h2 className="text-xl font-extrabold text-ink">Instructions — please read</h2>
                <span className="text-[11px] font-bold text-red bg-red-soft border border-red-line rounded-full px-3 py-1">{total} questions · 6 sections · ~45s each</span>
              </div>

              {/* exam language — questions & answers shown in the chosen language */}
              <div className="rounded-xl border border-line bg-bg p-3.5 mb-4">
                <p className="text-[12px] font-bold text-ink mb-0.5 flex items-center gap-1.5"><Languages className="w-4 h-4 text-red" /> Choose your exam language</p>
                <p className="text-[11px] text-ink-3 mb-2.5">Your questions &amp; answers will appear in this language. The rest of the app stays in English.</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {EXAM_LANGS.map((l) => {
                    const selected = lang === l.id;
                    const glyph = l.id === 'hi' ? 'अ' : l.id === 'te' ? 'అ' : 'A';
                    return (
                      <button key={l.id} type="button" onClick={() => setLang(l.id)}
                        className={`relative flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-all ${selected ? 'border-red bg-red-soft' : 'border-line hover:border-red-line bg-white'}`}>
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl font-bold ${selected ? 'bg-red text-white' : 'bg-bg text-ink-3'}`}>{glyph}</span>
                        <span className="text-left leading-tight">
                          <span className="block text-[15px] font-extrabold text-ink">{l.native}</span>
                          <span className="block text-[11px] text-ink-4">{l.label}</span>
                        </span>
                        {selected && <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red text-white"><Check className="h-2.5 w-2.5" /></span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6 sections — all visible in one view (3 × 2) */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 mb-4">
                {SECTIONS.map((s) => (
                  <div key={s.id} className="rounded-xl border border-line p-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-5 h-5 rounded-full bg-red text-white text-[10px] font-bold flex items-center justify-center shrink-0">{s.index}</span>
                      <p className="font-bold text-[13px] text-ink leading-tight">{s.title}</p>
                      <span className="ml-auto text-[10px] text-ink-4 shrink-0">{questionsForSection(s.id).length} Q</span>
                    </div>
                    <p className="text-[11px] text-ink-3 leading-snug line-clamp-3">{s.blurb}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-bg border border-line p-3.5">
                  <p className="text-[12px] font-bold text-ink mb-1.5 flex items-center gap-1.5"><ListChecks className="w-4 h-4 text-red" /> How it works</p>
                  <ul className="text-[12px] text-ink-2 space-y-1 list-disc pl-4">
                    <li>Each question has its own timer. When it ends, you move on automatically — <b>a timed-out question is locked</b>, so don&apos;t leave it blank.</li>
                    <li>Sections 1–5 have <b>no right or wrong</b> answers. Section 6 (Analytical) <b>does</b> — read carefully.</li>
                    <li>Use the palette to jump between questions and mark ones for review.</li>
                  </ul>
                </div>
                <div className="rounded-xl bg-red-soft border border-red-line p-3.5">
                  <p className="text-[12px] font-bold text-red mb-1.5 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> Anti-proxy rules</p>
                  <ul className="text-[12px] text-ink-2 space-y-1 list-disc pl-4">
                    <li>The test runs in <b>full-screen mode</b> to keep it fair.</li>
                    <li>Do <b>not</b> exit full screen, switch tabs, or open other apps/windows.</li>
                    <li><b>Copying, pasting, right-click</b> and developer shortcuts are disabled.</li>
                    <li>Any violation gives you <b>one warning</b>. A second <b>ends the exam</b> automatically.</li>
                    <li>Keep your phone away and answer on your own.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setPhase(2)} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ChevronLeft className="w-4 h-4" /> Back</button>
                <button onClick={startTest} className="inline-flex items-center gap-2 bg-success text-white font-semibold px-6 py-3 rounded-xl shadow-sm">
                  <Maximize className="w-4 h-4" /> Start in full screen <ChevronRight className="w-4 h-4" />
                </button>
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
            const locked = timedOut[q.id];
            const lowTime = secondsLeft <= 10;
            const loc = localizeQuestion(q, lang); // translated prompt + option labels
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
                  {/* question + illustration (use the full width) */}
                  <div className="grid lg:grid-cols-[1.1fr_0.9fr] min-h-0 overflow-y-auto">
                    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
                      <div className="max-w-2xl">
                        <p className="text-xs font-semibold text-ink-4 mb-2">{sec.scale}</p>
                        <p className="text-lg font-bold text-ink mb-4">{loc.prompt}</p>

                        {locked && (
                          <div className="flex items-center gap-2 bg-yellow-50 border border-warning/40 text-warning text-[12.5px] font-semibold rounded-xl px-3 py-2 mb-3">
                            <Lock className="w-4 h-4" /> Time exceeded — this question is locked and can no longer be changed.
                          </div>
                        )}

                        <div className="space-y-2.5">
                          {loc.options.map((label, i) => {
                            const isSel = selected === i;
                            return (
                              <button key={`${q.id}-${i}`} onClick={() => setAnswer(q.id, i)} disabled={locked}
                                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-3 ${isSel ? 'border-red bg-red-soft text-red' : 'border-line text-ink-2'} ${locked ? 'opacity-60 cursor-not-allowed' : 'hover:border-red-line'}`}>
                                <span className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${isSel ? 'border-red' : 'border-ink-4'}`}>{isSel && <span className="w-2.5 h-2.5 rounded-full bg-red" />}</span>
                                {label}
                              </button>
                            );
                          })}
                        </div>

                        {/* actions — kept right under the answers */}
                        <div className="mt-5 space-y-3">
                          <div className="flex items-center gap-3">
                            {qIndex < total - 1 ? (
                              <button onClick={() => goTo(qIndex + 1)}
                                className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-xl shadow-glow">Save &amp; Next <ChevronRight className="w-4 h-4" /></button>
                            ) : (
                              <button onClick={handleSubmit}
                                className="inline-flex items-center gap-2 bg-success text-white font-semibold px-6 py-3 rounded-xl shadow-sm"><Check className="w-4 h-4" /> Submit test</button>
                            )}
                            <button onClick={() => setMarked((m) => ({ ...m, [q.id]: !m[q.id] }))}
                              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-colors ${marked[q.id] ? 'border-warning bg-yellow-50 text-warning' : 'border-line text-ink-3 hover:border-warning'}`}>
                              <Flag className="w-4 h-4" /> {marked[q.id] ? 'Marked' : 'Mark for review'}
                            </button>
                          </div>
                          <button onClick={() => goTo(qIndex - 1)} disabled={qIndex === 0}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink disabled:opacity-40">
                            <ChevronLeft className="w-4 h-4" /> Previous
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* illustration panel — fills the spare width */}
                    <aside className="hidden lg:flex flex-col items-center justify-center text-center bg-gradient-to-b from-red-soft/60 to-bg border-l border-line p-8">
                      <AssessmentArt />
                      <p className="text-[15px] font-extrabold text-ink mt-5">You&apos;re doing great{name ? `, ${name.split(' ')[0]}` : ''}!</p>
                      <p className="text-[12.5px] text-ink-3 mt-1 max-w-xs">
                        There are no wrong answers in this section — go with your first instinct. Every answer helps us map the careers that fit you best.
                      </p>
                      <div className="mt-5 w-full max-w-xs rounded-xl bg-white border border-line p-3 text-left">
                        <p className="text-[11px] font-bold text-ink-2 mb-1.5">Your progress</p>
                        <div className="h-2 rounded-full bg-line-2 overflow-hidden">
                          <div className="h-full rounded-full bg-red" style={{ width: `${Math.round((answeredCount / total) * 100)}%` }} />
                        </div>
                        <p className="text-[11px] text-ink-4 mt-1.5">{answeredCount} of {total} answered</p>
                      </div>
                    </aside>
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

      {/* toast (e.g. mark-for-review resolved) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-ink text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-success" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* anti-proxy: full-screen warning (one chance) */}
      <AnimatePresence>
        {showFsWarning && !terminated && (
          <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-7 text-center">
              <div className="w-14 h-14 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-warning" />
              </div>
              <h3 className="text-xl font-extrabold text-ink mb-2">Exam integrity warning</h3>
              <p className="text-sm text-ink-3 mb-1">
                {violationReason}. This is your <b className="text-ink">only warning</b> — another violation
                (exiting full screen, switching tabs, or losing focus) will <b className="text-red"> end the exam</b> automatically.
              </p>
              <p className="text-xs text-ink-4 mb-5">Return to full screen and stay on this tab to continue.</p>
              <button onClick={() => { enterFullscreen(); setShowFsWarning(false); }}
                className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-xl shadow-glow">
                <Maximize className="w-4 h-4" /> Return to full screen
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- illustration ---------------- */

function AssessmentArt() {
  return (
    <svg viewBox="0 0 240 200" className="w-48 h-40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <ellipse cx="120" cy="178" rx="78" ry="12" fill="#E0242E" opacity="0.08" />
      {/* clipboard */}
      <rect x="74" y="44" width="92" height="120" rx="10" fill="#fff" stroke="#E6E3E0" strokeWidth="3" />
      <rect x="100" y="36" width="40" height="18" rx="6" fill="#E0242E" />
      <rect x="88" y="74" width="20" height="8" rx="4" fill="#2FA37C" />
      <rect x="114" y="73" width="40" height="8" rx="4" fill="#EFEDEA" />
      <rect x="88" y="96" width="20" height="8" rx="4" fill="#3F6CA6" />
      <rect x="114" y="95" width="40" height="8" rx="4" fill="#EFEDEA" />
      <rect x="88" y="118" width="20" height="8" rx="4" fill="#E8821E" />
      <rect x="114" y="117" width="40" height="8" rx="4" fill="#EFEDEA" />
      {/* check badge */}
      <circle cx="158" cy="138" r="20" fill="#2FA37C" />
      <path d="M150 138l6 6 12-13" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* pencil */}
      <g transform="rotate(38 196 70)">
        <rect x="186" y="40" width="14" height="70" rx="3" fill="#F2B705" />
        <path d="M186 110l7 14 7-14z" fill="#3a3a3a" />
        <rect x="186" y="40" width="14" height="10" rx="3" fill="#E0242E" />
      </g>
    </svg>
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
  const currentRef = useRef<HTMLButtonElement>(null);
  // keep the active question visible as the test advances (incl. across sections)
  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [qIndex]);
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
                  <button key={q.id} ref={isCurrent ? currentRef : undefined} onClick={() => onJump(globalIdx)}
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

function Field({ label, value, onChange, type = 'text', placeholder, error }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-ink-2 block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red ${error ? 'border-red' : 'border-line'}`} />
      {error && <p className="text-xs text-red mt-1.5">{error}</p>}
    </div>
  );
}

/* Location autocomplete backed by OpenStreetMap (Nominatim) — no API key needed. */
function LocationField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<{ id: string; label: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3 || q === value) { setResults([]); return; }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=0&limit=6&q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal, headers: { 'Accept-Language': 'en' } },
        );
        const data = (await res.json()) as { place_id: number; display_name: string }[];
        setResults(data.map((d) => ({ id: String(d.place_id), label: d.display_name })));
        setOpen(true);
      } catch { /* ignore aborted / network */ } finally { setLoading(false); }
    }, 350);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [query, value]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      <label className="text-sm font-semibold text-ink-2 block mb-1.5">Location</label>
      <div className="relative">
        <MapPin className="w-4 h-4 text-ink-4 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(''); }}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search your city / area"
          className={`w-full pl-9 pr-9 py-3 rounded-xl border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red ${error ? 'border-red' : 'border-line'}`}
        />
        {loading && <Loader2 className="w-4 h-4 text-ink-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-line rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {results.map((r) => (
            <li key={r.id}>
              <button type="button"
                onClick={() => { onChange(r.label); setQuery(r.label); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-[12.5px] text-ink-2 hover:bg-bg flex gap-2 items-start">
                <MapPin className="w-3.5 h-3.5 text-red mt-0.5 shrink-0" /> {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs text-red mt-1.5">{error}</p>}
    </div>
  );
}
