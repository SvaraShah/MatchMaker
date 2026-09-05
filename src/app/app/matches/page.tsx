'use strict';
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Sparkles,
  Bookmark,
  Send,
  Briefcase,
  GraduationCap,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import UserLayout from '@/components/UserLayout';

export default function DiscoverMatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // Express Interest Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [interestMessage, setInterestMessage] = useState('');
  const [sendingInterest, setSendingInterest] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/me/matches');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setMatches(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch matches:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggleShortlist = async (candidateId: string, isShortlisted: boolean) => {
    try {
      if (isShortlisted) {
        const res = await fetch(`/api/me/shortlist/${candidateId}`, { method: 'DELETE' });
        if (res.ok) {
          setMatches(prev =>
            prev.map(m => (m.profile.id === candidateId ? { ...m, isShortlisted: false } : m))
          );
          triggerToast('Removed profile from Shortlist');
        }
      } else {
        const res = await fetch('/api/me/shortlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId }),
        });
        if (res.ok) {
          setMatches(prev =>
            prev.map(m => (m.profile.id === candidateId ? { ...m, isShortlisted: true } : m))
          );
          triggerToast('Added profile to Shortlist');
        }
      }
    } catch (e) {
      console.error('Shortlist error:', e);
    }
  };

  const handleSendInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    setSendingInterest(true);

    try {
      const res = await fetch('/api/me/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: selectedCandidate.profile.id,
          message: interestMessage,
        }),
      });

      if (res.ok) {
        setMatches(prev =>
          prev.map(m =>
            m.profile.id === selectedCandidate.profile.id
              ? { ...m, requestStatus: 'pending' }
              : m
          )
        );
        triggerToast(`Interest request sent to ${selectedCandidate.profile.firstName}!`);
        setSelectedCandidate(null);
        setInterestMessage('');
      }
    } catch (e) {
      console.error('Express interest error:', e);
    } finally {
      setSendingInterest(false);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top duration-200">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-rose-500" />
            Discover Compatible Matches
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Opposite gender candidates calculated using our 8-dimension deterministic compatibility engine.
          </p>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            <span className="text-xs font-semibold">Generating compatibility scores & AI insights...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
            <Heart className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold">No candidates found</h3>
            <p className="text-xs text-slate-400">Try broadening your partner preference criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((m) => {
              const p = m.profile;
              const isExpanded = expandedMatchId === p.id;
              const hasSentRequest = Boolean(m.requestStatus);

              return (
                <div
                  key={p.id}
                  className="glass-panel p-6 rounded-3xl space-y-5 shadow-sm hover:border-rose-300 dark:hover:border-rose-900/50 transition-all relative overflow-hidden"
                >
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-400 to-primary text-white font-black text-xl flex items-center justify-center shadow-md shadow-rose-500/20">
                        {p.firstName[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                          {p.firstName} {p.lastName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {p.age} yrs • {p.city} • {p.religion} ({p.caste})
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-rose-500">{m.score}%</span>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Score</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-border">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{p.profession.designation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{p.education.degree}</span>
                    </div>
                  </div>

                  {/* AI Match pitch */}
                  <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-xs space-y-1">
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Match Introduction
                    </span>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed italic">
                      "{m.aiIntroduction}"
                    </p>
                  </div>

                  {/* Breakdown Toggle */}
                  <button
                    onClick={() => setExpandedMatchId(isExpanded ? null : p.id)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white pt-1 cursor-pointer"
                  >
                    <span>View 8-Dimension Compatibility Breakdown</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="grid grid-cols-4 gap-2 pt-2 text-[10px] font-semibold border-t border-border animate-in fade-in duration-150">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
                        <span className="block text-slate-400">Age</span>
                        <span className="text-rose-500 font-bold">{m.scoreBreakdown.age}/15</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
                        <span className="block text-slate-400">Education</span>
                        <span className="text-rose-500 font-bold">{m.scoreBreakdown.education}/15</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
                        <span className="block text-slate-400">Career</span>
                        <span className="text-rose-500 font-bold">{m.scoreBreakdown.career}/15</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
                        <span className="block text-slate-400">Religion</span>
                        <span className="text-rose-500 font-bold">{m.scoreBreakdown.religion}/15</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <button
                      onClick={() => handleToggleShortlist(p.id, m.isShortlisted)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        m.isShortlisted
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Bookmark className="h-3.5 w-3.5" fill={m.isShortlisted ? 'currentColor' : 'none'} />
                      <span>{m.isShortlisted ? 'Shortlisted ✓' : 'Shortlist'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedCandidate(m)}
                      disabled={hasSentRequest}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                        hasSentRequest
                          ? 'bg-emerald-600 cursor-default'
                          : 'bg-gradient-to-r from-rose-500 to-primary hover:opacity-95 shadow-rose-500/20'
                      }`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{hasSentRequest ? `Interest ${m.requestStatus}` : 'Express Interest'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Express Interest Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="glass-panel max-w-md w-full rounded-3xl p-6 space-y-6 bg-white dark:bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2 text-rose-500">
                  <Send className="h-5 w-5" />
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Express Interest to {selectedCandidate.profile.firstName}
                  </h3>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSendInterest} className="space-y-4 text-xs">
                <p className="text-slate-600 dark:text-slate-300">
                  Send a polite introduction request to {selectedCandidate.profile.firstName} {selectedCandidate.profile.lastName} ({selectedCandidate.profile.city}).
                </p>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Personal Note (Optional)</label>
                  <textarea
                    rows={3}
                    value={interestMessage}
                    onChange={(e) => setInterestMessage(e.target.value)}
                    placeholder="Hi! I came across your profile on TDC Matrimony and would love to connect..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-border cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingInterest}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {sendingInterest ? 'Sending Request...' : 'Send Interest Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
