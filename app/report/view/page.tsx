'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import PsychometricReport from '@/components/report/PsychometricReport';
import type { PsychometricProfile } from '@/lib/psychometric';
import { getLocalReport } from '@/lib/report-store';
import { getSession, loadReport } from '@/lib/firebase';

function ReportView() {
  const params = useSearchParams();
  const id = params.get('id') || '';
  const [profile, setProfile] = useState<PsychometricProfile | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let active = true;
    (async () => {
      // 1) instant: local cache
      const local = getLocalReport(id);
      if (local) { setProfile(local); setState('ready'); return; }
      // 2) Firestore (cross-device / signed-in)
      const remote = await loadReport(id, getSession());
      if (!active) return;
      if (remote && remote.kind === 'psychometric') { setProfile(remote); setState('ready'); }
      else setState('missing');
    })();
    return () => { active = false; };
  }, [id]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-red animate-spin mx-auto mb-3" />
          <p className="text-ink-3 text-sm">Loading your report…</p>
        </div>
      </div>
    );
  }
  if (state === 'missing' || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red mx-auto mb-3" />
          <h3 className="font-bold text-ink mb-2">Report not found</h3>
          <p className="text-ink-3 text-sm mb-4">We couldn’t find this report on this device. Sign in and take the assessment to generate a new one.</p>
          <a href="/assessment" className="text-sm text-red font-semibold hover:underline">Take the assessment →</a>
        </div>
      </div>
    );
  }
  return <PsychometricReport profile={profile} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-red animate-spin" /></div>}>
      <ReportView />
    </Suspense>
  );
}
