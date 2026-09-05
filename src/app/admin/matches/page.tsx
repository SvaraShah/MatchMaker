'use strict';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Loader2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  Bot,
  Calendar,
  User,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Customer } from '@/types/matchmaker';

export default function AdminMatchesPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected candidates
  const [candidateAId, setCandidateAId] = useState<string>('');
  const [candidateBId, setCandidateBId] = useState<string>('');

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [proposing, setProposing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal states for Note & Follow-up
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
        if (data.length >= 2) {
          setCandidateAId(data[0].id);
          // Pick candidate B of opposite gender if available
          const opposite = data.find((c: Customer) => c.gender !== data[0].gender);
          if (opposite) {
            setCandidateBId(opposite.id);
          } else {
            setCandidateBId(data[1].id);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const candidateA = customers.find((c) => c.id === candidateAId);
  const candidateB = customers.find((c) => c.id === candidateBId);

  // Run match analysis when A or B changes
  const runAnalysis = useCallback(async (aId: string, bId: string) => {
    if (!aId || !bId || aId === bId) {
      setMatchData(null);
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch('/api/matches/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: aId, candidateId: bId }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setMatchData(json.data);
        }
      }
    } catch (e) {
      console.error('Match analysis error:', e);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    if (candidateAId && candidateBId && candidateAId !== candidateBId) {
      runAnalysis(candidateAId, candidateBId);
    }
  }, [candidateAId, candidateBId, runAnalysis]);

  const handleProposeMatch = async () => {
    if (!candidateAId || !candidateBId || !matchData) return;
    setProposing(true);
    try {
      const res = await fetch('/api/matches/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: candidateAId,
          matchId: candidateBId,
          status: 'sent',
          score: matchData.score,
          scoreBreakdown: matchData.scoreBreakdown,
          aiExplanation: matchData.aiExplanation,
          aiIntroduction: matchData.aiIntroduction,
        }),
      });
      if (res.ok) {
        setActionSuccess('Match proposal sent successfully to client timeline!');
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (e) {
      console.error('Propose match error:', e);
    } finally {
      setProposing(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateAId || !noteContent.trim()) return;
    try {
      const res = await fetch(`/api/customers/${candidateAId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent, author: 'Matchmaker Admin' }),
      });
      if (res.ok) {
        setNoteContent('');
        setShowNoteModal(false);
        setActionSuccess('Private note saved successfully!');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateAId || !followUpTitle.trim() || !followUpDate) return;
    try {
      const res = await fetch('/api/admin/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: candidateAId,
          matchId: candidateBId || undefined,
          title: followUpTitle,
          dueDate: new Date(followUpDate).toISOString(),
          priority: 'MEDIUM',
        }),
      });
      if (res.ok) {
        setFollowUpTitle('');
        setFollowUpDate('');
        setShowFollowUpModal(false);
        setActionSuccess('Follow-up scheduled successfully!');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary fill-primary/20" />
              Match Management & Candidate Comparison
            </h1>
            <p className="text-xs text-slate-500">Evaluate candidate compatibility using deterministic matching breakdown & side-by-side profile dossier comparison.</p>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Candidate Selection Bar */}
        <div className="glass-panel p-5 rounded-3xl space-y-4">
          <h2 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Select Candidates to Compare</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Candidate A Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Candidate A (Primary Client)</label>
              <select
                value={candidateAId}
                onChange={(e) => setCandidateAId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-border bg-background text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.gender}, {c.age} yrs, {c.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Candidate B Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Candidate B (Prospect Match)</label>
              <select
                value={candidateBId}
                onChange={(e) => setCandidateBId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-border bg-background text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {customers
                  .filter((c) => c.id !== candidateAId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.gender}, {c.age} yrs, {c.city})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Candidate Overview Header */}
        {candidateA && candidateB && (
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border pb-6">
              {/* Candidate A Card */}
              <div className="flex items-center gap-4 flex-1 w-full">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 text-primary flex items-center justify-center font-bold text-xl overflow-hidden border border-primary/20">
                  {candidateA.photoUrl ? (
                    <img src={candidateA.photoUrl} alt={candidateA.firstName} className="h-full w-full object-cover" />
                  ) : (
                    <span>{candidateA.firstName[0]}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">
                    {candidateA.firstName} {candidateA.lastName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {candidateA.gender} • {candidateA.age} yrs • {candidateA.city}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {candidateA.journeyStatus}
                  </span>
                </div>
              </div>

              {/* Compatibility Badge in Center */}
              <div className="text-center px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 space-y-1">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Deterministic Score</span>
                <p className="text-3xl font-black text-primary">
                  {analyzing ? <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /> : `${matchData?.score || 0}%`}
                </p>
                <span className="text-[10px] font-semibold text-slate-500">
                  {matchData?.score >= 80 ? 'High Compatibility' : matchData?.score >= 60 ? 'Moderate Match' : 'Low Compatibility'}
                </span>
              </div>

              {/* Candidate B Card */}
              <div className="flex items-center justify-end gap-4 flex-1 w-full text-right">
                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">
                    {candidateB.firstName} {candidateB.lastName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {candidateB.gender} • {candidateB.age} yrs • {candidateB.city}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {candidateB.journeyStatus}
                  </span>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/40 text-indigo-500 flex items-center justify-center font-bold text-xl overflow-hidden border border-indigo-500/20">
                  {candidateB.photoUrl ? (
                    <img src={candidateB.photoUrl} alt={candidateB.firstName} className="h-full w-full object-cover" />
                  ) : (
                    <span>{candidateB.firstName[0]}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleProposeMatch}
                disabled={proposing || !matchData}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{proposing ? 'Proposing Match...' : 'Propose Match to Client'}</span>
              </button>

              <button
                onClick={() => setShowNoteModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Private Note</span>
              </button>

              <button
                onClick={() => setShowFollowUpModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all cursor-pointer border border-amber-500/20"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Schedule Follow-up</span>
              </button>

              <button
                onClick={() => router.push(`/admin/agent?client=${candidateA.id}`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-500/20 transition-all cursor-pointer border border-indigo-500/20"
              >
                <Bot className="h-3.5 w-3.5" />
                <span>Ask AI Agent Contextually</span>
              </button>
            </div>
          </div>
        )}

        {/* 8-Dimension Compatibility Breakdown Grid */}
        {matchData?.scoreBreakdown && (
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              8-Dimension Deterministic Score Breakdown
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(matchData.scoreBreakdown).map(([dimension, detail]: [string, any]) => (
                <div key={dimension} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold capitalize text-slate-800 dark:text-slate-200">
                      {dimension.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      detail.score >= 80
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : detail.score >= 50
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}>
                      {detail.score}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2">{detail.reason || detail.comment || 'Compatibility calculated'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Side-by-Side Dossier Comparison Table */}
        {candidateA && candidateB && (
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Side-by-Side Attribute Comparison
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-slate-50 dark:bg-slate-900/50">
                    <th className="p-3 font-bold text-slate-500 w-1/3">Attribute</th>
                    <th className="p-3 font-bold text-primary w-1/3">{candidateA.firstName} {candidateA.lastName}</th>
                    <th className="p-3 font-bold text-indigo-500 w-1/3">{candidateB.firstName} {candidateB.lastName}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">Age & Height</td>
                    <td className="p-3 font-medium">{candidateA.age} yrs • {candidateA.height}</td>
                    <td className="p-3 font-medium">{candidateB.age} yrs • {candidateB.height}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">Location</td>
                    <td className="p-3 font-medium">{candidateA.city}{candidateA.state ? `, ${candidateA.state}` : ''}</td>
                    <td className="p-3 font-medium">{candidateB.city}{candidateB.state ? `, ${candidateB.state}` : ''}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">Education</td>
                    <td className="p-3 font-medium">{candidateA.education.degree} ({candidateA.education.undergradCollege})</td>
                    <td className="p-3 font-medium">{candidateB.education.degree} ({candidateB.education.undergradCollege})</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">Profession & Income</td>
                    <td className="p-3 font-medium">{candidateA.profession.designation} ({candidateA.profession.income} LPA)</td>
                    <td className="p-3 font-medium">{candidateB.profession.designation} ({candidateB.profession.income} LPA)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">Religion & Caste</td>
                    <td className="p-3 font-medium">{candidateA.religion} ({candidateA.caste})</td>
                    <td className="p-3 font-medium">{candidateB.religion} ({candidateB.caste})</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">Diet & Lifestyle</td>
                    <td className="p-3 font-medium">{candidateA.lifestyle.diet} • {candidateA.maritalStatus || 'Never Married'}</td>
                    <td className="p-3 font-medium">{candidateB.lifestyle.diet} • {candidateB.maritalStatus || 'Never Married'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Explanations */}
        {matchData?.aiExplanation && (
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              AI Match Pitch & Operational Narrative
            </h2>
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <p className="font-semibold text-primary">Summary Pitch:</p>
              <p>{matchData.aiExplanation}</p>
              {matchData.aiIntroduction && (
                <>
                  <p className="font-semibold text-primary pt-2">Introductory Client Email:</p>
                  <p className="italic bg-background p-3 rounded-xl border border-border">{matchData.aiIntroduction}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal: Note Creation */}
        {showNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
            <form onSubmit={handleCreateNote} className="glass-panel p-6 rounded-3xl max-w-md w-full space-y-4 bg-background">
              <h3 className="text-sm font-bold">Add Private Note for {candidateA?.firstName}</h3>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter confidential matchmaker note..."
                rows={4}
                className="w-full p-3 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/95 cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Follow-up Creation */}
        {showFollowUpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
            <form onSubmit={handleCreateFollowUp} className="glass-panel p-6 rounded-3xl max-w-md w-full space-y-4 bg-background">
              <h3 className="text-sm font-bold">Schedule Follow-up Task</h3>
              <input
                type="text"
                value={followUpTitle}
                onChange={(e) => setFollowUpTitle(e.target.value)}
                placeholder="e.g. Call Priya to discuss match proposal"
                className="w-full p-3 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600 cursor-pointer"
                >
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

