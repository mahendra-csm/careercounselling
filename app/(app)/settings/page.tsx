'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, User, Bell, LogOut, Check } from 'lucide-react';
import { getSession, updateSessionName, signOut } from '@/lib/firebase';

interface LocalSettings {
  name: string; email: string; location: string; phone: string;
  notifyReports: boolean; notifyTips: boolean;
}
const KEY = 'onegrasp:settings';
const DEFAULTS: LocalSettings = { name: '', email: '', location: '', phone: '', notifyReports: true, notifyTips: false };

export default function SettingsPage() {
  const router = useRouter();
  const [s, setS] = useState<LocalSettings>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let next = { ...DEFAULTS };
    try { const raw = localStorage.getItem(KEY); if (raw) next = { ...next, ...JSON.parse(raw) }; } catch {}
    const session = getSession();
    if (session) { next.name = next.name || session.name; next.email = session.email; }
    setS(next);
  }, []);

  const set = (patch: Partial<LocalSettings>) => setS((cur) => ({ ...cur, ...patch }));

  const handleSave = () => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
    if (s.name.trim()) updateSessionName(s.name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = () => { signOut(); router.push('/'); router.refresh(); };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-ink mb-1">Settings</h1>
        <p className="text-ink-3 text-sm mb-8">Manage your OneGrasp profile and preferences.</p>

        <div className="space-y-6">
          {/* Profile */}
          <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5"><User className="w-4 h-4 text-ink-3" /><h2 className="font-bold text-ink">Profile</h2></div>
            <div className="space-y-4">
              <Field label="Full name" value={s.name} onChange={(v) => set({ name: v })} />
              <div>
                <label className="text-sm font-semibold text-ink-2 block mb-1.5">Email</label>
                <input value={s.email} readOnly placeholder="Sign in to set your email"
                  className="w-full px-4 py-3 rounded-xl border border-line bg-line-2 text-ink-3 text-sm cursor-not-allowed" />
              </div>
              <Field label="Location" value={s.location} onChange={(v) => set({ location: v })} placeholder="City" />
              <Field label="Phone" value={s.phone} onChange={(v) => set({ phone: v })} placeholder="Optional" />
            </div>
            <button onClick={handleSave}
              className="mt-5 flex items-center gap-2 bg-red text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-red-dark transition-all shadow-glow text-sm">
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />} {saved ? 'Saved!' : 'Save changes'}
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-ink-3" /><h2 className="font-bold text-ink">Notifications</h2></div>
            <Toggle label="Report & result updates" checked={s.notifyReports} onChange={(v) => set({ notifyReports: v })} />
            <Toggle label="Career tips & scholarship alerts" checked={s.notifyTips} onChange={(v) => set({ notifyTips: v })} />
          </div>

          {/* Account */}
          <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-ink mb-3">Account</h2>
            <button onClick={handleSignOut}
              className="flex items-center gap-2 border border-red-line text-red font-semibold px-5 py-2.5 rounded-xl hover:bg-red-soft transition-all text-sm">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-semibold text-ink-2 block mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-ink text-sm focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red transition-all" />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className="w-full flex items-center justify-between py-2.5">
      <span className="text-sm text-ink-2">{label}</span>
      <span className={`w-10 h-6 rounded-full transition-colors relative ${checked ? 'bg-red' : 'bg-line'}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}
