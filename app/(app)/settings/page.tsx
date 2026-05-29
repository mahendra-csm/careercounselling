'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Save, User, Bell, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface Profile {
  name: string;
  job_title?: string;
  industry?: string;
  years_experience?: number;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({ name: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) setProfile(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-7 h-7 text-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-ink mb-1">Settings</h1>
        <p className="text-ink-3 text-sm mb-8">Manage your profile and preferences.</p>

        <div className="space-y-6">
          {/* Profile section */}
          <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-4 h-4 text-ink-3" />
              <h2 className="font-bold text-ink">Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-ink-2 block mb-1.5">Full name</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-2 block mb-1.5">Current job title</label>
                <input
                  value={profile.job_title || ''}
                  onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-ink-2 block mb-1.5">Industry</label>
                <input
                  value={profile.industry || ''}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-line bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-red/30 focus:border-red transition-all text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-5 flex items-center gap-2 bg-red text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-red-dark transition-all shadow-glow disabled:opacity-60 text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save changes'}
            </button>
          </div>

          {/* Notifications placeholder */}
          <div className="bg-white border border-line rounded-2xl p-6 shadow-sm opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-ink-3" />
              <h2 className="font-bold text-ink">Notifications</h2>
              <span className="text-xs bg-line text-ink-4 px-2 py-0.5 rounded-full">Coming soon</span>
            </div>
            <p className="text-sm text-ink-3">Email notifications for report updates and reminders.</p>
          </div>

          {/* Security placeholder */}
          <div className="bg-white border border-line rounded-2xl p-6 shadow-sm opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-ink-3" />
              <h2 className="font-bold text-ink">Security</h2>
              <span className="text-xs bg-line text-ink-4 px-2 py-0.5 rounded-full">Coming soon</span>
            </div>
            <p className="text-sm text-ink-3">Password changes and two-factor authentication.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
