'use strict';
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, Trash2, Loader2 } from 'lucide-react';
import UserLayout from '@/components/UserLayout';

export default function MyShortlistPage() {
  const router = useRouter();
  const [shortlists, setShortlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShortlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/me/shortlist');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setShortlists(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlist();
  }, []);

  const handleRemove = async (candidateId: string) => {
    try {
      const res = await fetch(`/api/me/shortlist/${candidateId}`, { method: 'DELETE' });
      if (res.ok) {
        setShortlists(prev => prev.filter(c => c.id !== candidateId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-amber-500" />
            My Shortlisted Candidates ({shortlists.length})
          </h1>
          <p className="text-xs text-slate-500">Privately bookmarked matrimonial candidates for review.</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            <span>Loading shortlisted candidates...</span>
          </div>
        ) : shortlists.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
            <Bookmark className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold">Your shortlist is empty</h3>
            <p className="text-xs text-slate-400">Discover matches and save your favorite candidate profiles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortlists.map((c) => (
              <div key={c.id} className="glass-panel p-5 rounded-2xl space-y-4 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-800 font-bold text-lg flex items-center justify-center">
                      {c.firstName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{c.firstName} {c.lastName}</h3>
                      <p className="text-xs text-slate-400">{c.age} yrs • {c.city}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(c.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive text-xs cursor-pointer"
                    title="Remove from shortlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 border-t border-border pt-3">
                  <p><strong>Designation:</strong> {c.profession.designation}</p>
                  <p><strong>College:</strong> {c.education.undergradCollege}</p>
                  <p><strong>Religion:</strong> {c.religion} ({c.caste})</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
