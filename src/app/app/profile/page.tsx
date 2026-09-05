'use strict';
'use client';

import { useState, useEffect } from 'react';
import { User, CheckCircle, Save, Loader2 } from 'lucide-react';
import UserLayout from '@/components/UserLayout';

export default function UserProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [city, setCity] = useState('');
  const [designation, setDesignation] = useState('');
  const [company, setCompany] = useState('');
  const [income, setIncome] = useState(0);
  const [diet, setDiet] = useState('Vegetarian');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/me/profile');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setProfile(json.data);
          setCity(json.data.city || '');
          setDesignation(json.data.profession?.designation || '');
          setCompany(json.data.profession?.company || '');
          setIncome(json.data.profession?.income || 0);
          setDiet(json.data.lifestyle?.diet || 'Vegetarian');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          designation,
          company,
          income,
          diet,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setProfile(json.data);
          triggerToast('Profile updated successfully!');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top duration-200">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <User className="h-6 w-6 text-rose-500" />
            My Matrimonial Profile
          </h1>
          <p className="text-xs text-slate-500">Update your career, location, and lifestyle choices.</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
            <span>Loading profile...</span>
          </div>
        ) : !profile ? (
          <div className="glass-panel p-12 text-center text-slate-400">Profile error.</div>
        ) : (
          <form onSubmit={handleSaveProfile} className="glass-panel p-8 rounded-3xl space-y-6 shadow-sm">
            <div className="flex items-center gap-4 border-b border-border pb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-primary text-white font-extrabold text-2xl flex items-center justify-center">
                {profile.firstName[0]}
              </div>
              <div>
                <h2 className="text-2xl font-black">{profile.firstName} {profile.lastName}</h2>
                <p className="text-xs text-slate-400">{profile.gender} • {profile.age} yrs • {profile.religion} ({profile.caste})</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1">Current City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1">Profession Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1">Annual Income (LPA)</label>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1">Diet Preference</label>
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background cursor-pointer"
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Eggetarian">Eggetarian</option>
                </select>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </UserLayout>
  );
}
