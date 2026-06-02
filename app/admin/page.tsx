'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Loader2, ShieldAlert, Search, Mail, FileText, CheckCircle2, AlertCircle,
  LogOut, Users, Star, Send,
} from 'lucide-react';
import Logo from '@/components/brand/Logo';
import {
  ADMIN_EMAIL, getSession, signOut, listLeads, markLeadEmailed,
  type FbSession, type LeadRecord,
} from '@/lib/firebase';

type SendState = 'idle' | 'sending' | 'sent' | 'error';

export default function AdminPage() {
  const [session, setSession] = useState<FbSession | null>(null);
  const [authState, setAuthState] = useState<'checking' | 'denied' | 'ok'>('checking');
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [send, setSend] = useState<Record<string, SendState>>({});
  const [rowError, setRowError] = useState<Record<string, string>>({});

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (s && s.email.toLowerCase() === ADMIN_EMAIL) {
      setAuthState('ok');
      listLeads(s).then((rows) => { setLeads(rows); setLoading(false); });
    } else {
      setAuthState('denied');
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [l.name, l.email, l.phone, l.recipientEmail, l.class].some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [leads, query]);

  const stats = useMemo(() => {
    const total = leads.length;
    const ratings = leads.map((l) => Number(l.rating) || 0).filter((r) => r > 0);
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';
    const emailed = leads.filter((l) => l.emailed === true).length;
    const today = new Date().toDateString();
    const todayCount = leads.filter((l) => l.createTime && new Date(l.createTime).toDateString() === today).length;
    return { total, avgRating, emailed, todayCount };
  }, [leads]);

  async function sendReport(lead: LeadRecord) {
    const to = String(lead.recipientEmail || lead.email || '').trim();
    const reportId = String(lead.reportId || '').trim();
    if (!to || !reportId) {
      setSend((s) => ({ ...s, [lead.id]: 'error' }));
      setRowError((e) => ({ ...e, [lead.id]: 'Missing email or report id for this lead.' }));
      return;
    }
    setSend((s) => ({ ...s, [lead.id]: 'sending' }));
    setRowError((e) => ({ ...e, [lead.id]: '' }));
    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, name: lead.name, reportId, completion: lead.completion }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Send failed.');
      setSend((s) => ({ ...s, [lead.id]: 'sent' }));
      await markLeadEmailed(lead.id, session);
      setLeads((rows) => rows.map((r) => (r.id === lead.id ? { ...r, emailed: true } : r)));
    } catch (err) {
      setSend((s) => ({ ...s, [lead.id]: 'error' }));
      setRowError((e) => ({ ...e, [lead.id]: err instanceof Error ? err.message : 'Send failed.' }));
    }
  }

  if (authState === 'checking') {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 text-red animate-spin" /></div>;
  }

  if (authState === 'denied') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl border border-line shadow-md p-8">
          <div className="w-14 h-14 rounded-full bg-red-soft flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7 text-red" />
          </div>
          <h2 className="text-xl font-extrabold text-ink mb-2">Admin access only</h2>
          <p className="text-ink-3 text-sm mb-5">Sign in with the OneGrasp admin account to view the leads dashboard.</p>
          <Link href="/sign-in" className="inline-flex items-center gap-2 bg-red text-white font-semibold px-6 py-3 rounded-xl shadow-glow">Go to sign in</Link>
        </div>
      </div>
    );
  }

  const fmtDate = (s?: string) => (s ? new Date(s).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-line sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={30} />
            <span className="text-sm font-bold text-ink">Admin · Leads</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-ink-4">{session?.email}</span>
            <button onClick={() => { signOut(); window.location.href = '/sign-in'; }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-red border border-line rounded-xl px-3 py-2">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <Kpi icon={<Users className="w-4 h-4" />} label="Total leads" value={String(stats.total)} />
          <Kpi icon={<FileText className="w-4 h-4" />} label="Today" value={String(stats.todayCount)} />
          <Kpi icon={<Star className="w-4 h-4" />} label="Avg rating" value={`${stats.avgRating}/10`} />
          <Kpi icon={<Send className="w-4 h-4" />} label="Reports sent" value={String(stats.emailed)} />
        </div>

        {/* search */}
        <div className="relative mb-4 max-w-sm">
          <Search className="w-4 h-4 text-ink-4 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, phone…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
        </div>

        <div className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center"><Loader2 className="w-6 h-6 text-red animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-ink-4 text-sm">No leads yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg text-ink-3 text-left text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">Student</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Class</th>
                    <th className="px-4 py-3 font-semibold">Rating</th>
                    <th className="px-4 py-3 font-semibold">Done</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 font-semibold">Report</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => {
                    const st = send[l.id] ?? (l.emailed ? 'sent' : 'idle');
                    return (
                      <tr key={l.id} className="border-t border-line align-top">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink">{String(l.name || '—')}</p>
                          <p className="text-xs text-ink-4">{String(l.recipientEmail || l.email || '')}</p>
                        </td>
                        <td className="px-4 py-3 text-ink-2">
                          <p>{String(l.email || '—')}</p>
                          <p className="text-xs text-ink-4">{String(l.phone || '')}</p>
                        </td>
                        <td className="px-4 py-3 text-ink-2">{String(l.class || '—')}</td>
                        <td className="px-4 py-3 text-ink-2">{l.rating ? `${l.rating}/10` : '—'}</td>
                        <td className="px-4 py-3 text-ink-2">{l.completion != null ? `${l.completion}%` : '—'}</td>
                        <td className="px-4 py-3 text-ink-4 text-xs whitespace-nowrap">{fmtDate(l.createTime || (l.createdAt as string))}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => sendReport(l)}
                              disabled={st === 'sending'}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                st === 'sent' ? 'bg-green-50 text-success border border-success/30'
                                : 'bg-red text-white shadow-glow disabled:opacity-60'}`}>
                              {st === 'sending' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                                : st === 'sent' ? <><CheckCircle2 className="w-3.5 h-3.5" /> Sent · resend</>
                                : <><Mail className="w-3.5 h-3.5" /> Send report</>}
                            </button>
                            {l.reportId ? (
                              <a href={`/report/view?id=${l.reportId}`} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-ink-3 hover:text-red">
                                <FileText className="w-3.5 h-3.5" /> View
                              </a>
                            ) : null}
                          </div>
                          {rowError[l.id] ? (
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-red"><AlertCircle className="w-3 h-3" /> {rowError[l.id]}</p>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 text-ink-4 text-xs font-semibold uppercase tracking-wide">{icon}{label}</div>
      <p className="mt-2 text-2xl font-extrabold text-ink">{value}</p>
    </div>
  );
}
