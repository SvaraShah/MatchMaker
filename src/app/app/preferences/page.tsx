'use strict';
'use client';

import { useState, useEffect } from 'react';
import { SlidersHorizontal, CheckCircle, Save, Loader2 } from 'lucide-react';
import UserLayout from '@/components/UserLayout';

export default function UserPreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pref form states
  const [ageMin, setAgeMin] = useState(21);
  const [ageMax, setAgeMax] = useState(40);
  const [wantKids, setWantKids] = useState('Open');
  const [openToRelocate, setOpenToRelocate] = useState('Depends');
  const [locations, setLocations] = useState('');

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/me/preferences');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const pref = json.data;
          setAgeMin(pref.ageMin || 21);
          setAgeMax(pref.ageMax || 40);
          setWantKids(pref.wantKids || 'Open');
          setOpenToRelocate(pref.openToRelocate || 'Depends');
          setLocations(Array.isArray(pref.locations) ? pref.locations.join(', ') : '');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const locList = locations.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/me/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ageMin,
          ageMax,
          wantKids,
          openToRelocate,
          locations: locList,
        }),
      });

      if (res.ok) {
        triggerToast('Partner preferences saved! Matching engine will apply these parameters.');
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
            <SlidersHorizontal className="h-6 w-6 text-rose-500" />
            Partner Preferences
          </h1>
          <p className="text-xs text-slate-500">Configure parameters used by our deterministic matching engine.</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
            <span>Loading preferences...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="glass-panel p-8 rounded-3xl space-y-6 shadow-sm">
            <div className="border-b border-border pb-4 space-y-1">
              <h2 className="text-lg font-bold">Partner Match Criteria</h2>
              <p className="text-xs text-slate-400">Filter candidate discoveries based on your preferred location, age, and family expectations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1">Minimum Preferred Age</label>
                <input
                  type="number"
                  value={ageMin}
                  onChange={(e) => setAgeMin(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1">Maximum Preferred Age</label>
                <input
                  type="number"
                  value={ageMax}
                  onChange={(e) => setAgeMax(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1">Children Preference</label>
                <select
                  value={wantKids}
                  onChange={(e) => setWantKids(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background cursor-pointer"
                >
                  <option value="Yes">Yes (Wants Children)</option>
                  <option value="No">No (Does not want children)</option>
                  <option value="Open">Open / Negotiable</option>
                </select>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1">Relocation Preference</label>
                <select
                  value={openToRelocate}
                  onChange={(e) => setOpenToRelocate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background cursor-pointer"
                >
                  <option value="Yes">Yes (Willing to relocate)</option>
                  <option value="No">No (Must remain in current city)</option>
                  <option value="Depends">Depends on match</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block uppercase font-bold text-slate-400 mb-1">Preferred Cities (Comma-separated)</label>
                <input
                  type="text"
                  value={locations}
                  onChange={(e) => setLocations(e.target.value)}
                  placeholder="Mumbai, Delhi, Bangalore, Pune"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </UserLayout>
  );
}
