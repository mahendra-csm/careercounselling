'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Loader2, ShieldAlert, Search, Mail, FileText, CheckCircle2, AlertCircle,
  LogOut, Users, Star, Send, School, Plus,
} from 'lucide-react';
import Logo from '@/components/brand/Logo';
import {
  ADMIN_EMAIL, getSession, signOut, listLeads, markLeadEmailed,
  listSchools, createSchool, updateLeadSchool, clearAllStudentData,
  type FbSession, type LeadRecord, type SchoolRecord,
} from '@/lib/firebase';
import { generateReportPdfBlob, blobToBase64 } from '@/lib/client-pdf';

type SendState = 'idle' | 'sending' | 'sent' | 'error';

export default function AdminPage() {
  const [session, setSession] = useState<FbSession | null>(null);
  const [authState, setAuthState] = useState<'checking' | 'denied' | 'ok'>('checking');
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [send, setSend] = useState<Record<string, SendState>>({});
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<Record<string, string>>({});
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [schoolFilter, setSchoolFilter] = useState(''); // '' = all
  const [newSchool, setNewSchool] = useState('');
  const [creating, setCreating] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [clearConfirm, setClearConfirm] = useState('');
  const [clearing, setClearing] = useState(false);
  const [clearMsg, setClearMsg] = useState('');

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (s && s.email.toLowerCase() === ADMIN_EMAIL) {
      setAuthState('ok');
      listLeads(s).then((rows) => { setLeads(rows); setLoading(false); });
      listSchools(s).then(setSchools);
    } else {
      setAuthState('denied');
      setLoading(false);
    }
  }, []);

  // Every school name we know about: created schools + any seen on a lead.
  const schoolNames = useMemo(() => {
    const set = new Set<string>();
    schools.forEach((s) => set.add(s.name));
    leads.forEach((l) => { const v = String(l.school ?? '').trim(); if (v) set.add(v); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [schools, leads]);

  const countFor = (name: string) => leads.filter((l) => String(l.school ?? '').trim() === name).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (schoolFilter && String(l.school ?? '').trim() !== schoolFilter) return false;
      if (!q) return true;
      return [l.name, l.email, l.phone, l.recipientEmail, l.class, l.school].some((v) => String(v ?? '').toLowerCase().includes(q));
    });
  }, [leads, query, schoolFilter]);

  async function addSchool() {
    const name = newSchool.trim();
    if (!name || creating) return;
    setCreating(true);
    const ok = await createSchool(name, session);
    if (ok) { setSchools((s) => [...s, { id: name, name }].filter((v, i, a) => a.findIndex((x) => x.name === v.name) === i)); setNewSchool(''); }
    setCreating(false);
  }

  async function assignSchool(lead: LeadRecord, name: string) {
    setLeads((rows) => rows.map((r) => (r.id === lead.id ? { ...r, school: name } : r)));
    await updateLeadSchool(lead.id, name, session);
  }

  const stats = useMemo(() => {
    const total = leads.length;
    const ratings = leads.map((l) => Number(l.rating) || 0).filter((r) => r > 0);
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';
    const emailed = leads.filter((l) => l.emailed === true).length;
    const today = new Date().toDateString();
    const todayCount = leads.filter((l) => l.createTime && new Date(l.createTime).toDateString() === today).length;
    return { total, avgRating, emailed, todayCount };
  }, [leads]);

  async function handleClearAll() {
    if (clearConfirm.trim().toUpperCase() !== 'DELETE' || clearing) return;
    setClearing(true);
    setClearMsg('');
    const res = await clearAllStudentData(session);
    setClearing(false);
    setClearConfirm('');
    setLeads([]);
    setClearMsg(`Cleared ${res.leadsDeleted} student(s) and ${res.reportsDeleted} report(s).${res.failed ? ` ${res.failed} could not be removed — check Firestore delete permissions.` : ''}`);
  }

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
      // Render the report to a PDF in THIS browser (no server/Chromium needed).
      const blob = await generateReportPdfBlob(reportId, (done, total) =>
        setProgress((p) => ({ ...p, [lead.id]: `${done}/${total}` }))
      );
      const pdfBase64 = await blobToBase64(blob);
      // Hand the finished PDF to a tiny email-only function.
      const res = await fetch('/api/email-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, name: lead.name, completion: lead.completion, pdfBase64 }),
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

        {/* schools */}
        <div className="bg-white border border-line rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="text-sm font-bold text-ink flex items-center gap-1.5"><School className="w-4 h-4 text-red" /> Schools</p>
            <div className="flex items-center gap-2">
              <input value={newSchool} onChange={(e) => setNewSchool(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSchool()}
                placeholder="New school name" className="w-44 px-3 py-2 rounded-xl border border-line bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
              <button onClick={addSchool} disabled={creating || !newSchool.trim()}
                className="inline-flex items-center gap-1.5 bg-red text-white text-sm font-semibold px-3 py-2 rounded-xl shadow-glow disabled:opacity-50">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add school
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSchoolFilter('')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${schoolFilter === '' ? 'bg-red text-white border-red' : 'bg-bg text-ink-2 border-line hover:border-red-line'}`}>
              All <span className="opacity-70">({leads.length})</span>
            </button>
            {schoolNames.map((name) => (
              <button key={name} onClick={() => setSchoolFilter(name)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${schoolFilter === name ? 'bg-red text-white border-red' : 'bg-bg text-ink-2 border-line hover:border-red-line'}`}>
                {name} <span className="opacity-70">({countFor(name)})</span>
              </button>
            ))}
            {schoolNames.length === 0 && <span className="text-xs text-ink-4">No schools yet — add one, or they’ll appear as students submit.</span>}
          </div>
        </div>

        {/* search */}
        <div className="relative mb-4 max-w-sm">
          <Search className="w-4 h-4 text-ink-4 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, phone, school…"
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
                    <th className="px-4 py-3 font-semibold">School</th>
                    <th className="px-4 py-3 font-semibold">Place</th>
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
                        <td className="px-4 py-3">
                          <select value={String(l.school ?? '')} onChange={(e) => assignSchool(l, e.target.value)}
                            className="max-w-[150px] px-2 py-1.5 rounded-lg border border-line bg-white text-xs text-ink-2 focus:outline-none focus:ring-2 focus:ring-red/30">
                            <option value="">— Unassigned —</option>
                            {String(l.school ?? '').trim() && !schoolNames.includes(String(l.school).trim()) && (
                              <option value={String(l.school)}>{String(l.school)}</option>
                            )}
                            {schoolNames.map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-ink-2">{String(l.location || '—')}</td>
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
                              {st === 'sending' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Building {progress[l.id] ?? ''}…</>
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

        {/* Danger zone — wipe all student data before a fresh testing round */}
        <div className="mt-6 rounded-2xl border border-red-line bg-red-soft/40 p-4">
          <button onClick={() => setShowDanger((v) => !v)} className="flex items-center gap-2 text-sm font-bold text-red">
            <ShieldAlert className="w-4 h-4" /> Danger zone {showDanger ? '▴' : '▾'}
          </button>
          {showDanger && (
            <div className="mt-3 max-w-xl">
              <p className="text-xs text-ink-3 mb-3">
                Permanently delete <b>all {leads.length} student record(s) and their reports</b>. Use this to reset before a new round of school testing. This cannot be undone. Type <b>DELETE</b> to confirm.
              </p>
              <div className="flex items-center gap-2">
                <input value={clearConfirm} onChange={(e) => setClearConfirm(e.target.value)} placeholder="Type DELETE"
                  className="w-40 px-3 py-2 rounded-xl border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red" />
                <button onClick={handleClearAll} disabled={clearing || clearConfirm.trim().toUpperCase() !== 'DELETE'}
                  className="inline-flex items-center gap-1.5 bg-red text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-glow disabled:opacity-50">
                  {clearing ? <><Loader2 className="w-4 h-4 animate-spin" /> Clearing…</> : 'Clear all data'}
                </button>
              </div>
              {clearMsg && <p className="mt-2 text-xs font-semibold text-ink-2">{clearMsg}</p>}
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
