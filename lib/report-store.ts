'use client';

import type { PsychometricProfile } from '@/lib/psychometric';

const PREFIX = 'onegrasp:report:';
const LAST = 'onegrasp:last-report-id';

export function makeReportId() {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `rep-${Date.now().toString(36)}-${rnd}`;
}

export function saveLocalReport(id: string, profile: PsychometricProfile) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFIX + id, JSON.stringify(profile));
    window.localStorage.setItem(LAST, id);
  } catch { /* quota — ignore */ }
}

export function getLocalReport(id: string): PsychometricProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + id);
    return raw ? (JSON.parse(raw) as PsychometricProfile) : null;
  } catch {
    return null;
  }
}

export function getLastReportId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LAST);
}
