'use strict';
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  Info,
  MapPin,
  MessageSquare,
  Phone,
  Printer,
  Sparkles,
  Calendar,
  User,
  Activity,
  Maximize2,
  Trash2,
  CheckCircle,
  FileText,
  Mail,
  Loader2,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Customer, MatchRecommendation, JourneyStatus } from '@/types/matchmaker';

export default function AdminCustomerDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter();
  const { id: customerId } = use(params);

  // States
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recs' | 'timeline'>('recs');

  // Notes form state
  const [noteContent, setNoteContent] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Matchmaker Maya');
  const [noteStatusUpdate, setNoteStatusUpdate] = useState<JourneyStatus | ''>('');
  const [savingNote, setSavingNote] = useState(false);

  // Send Match Modal State
  const [selectedMatch, setSelectedMatch] = useState<MatchRecommendation | null>(null);
  const [sendingMatch, setSendingMatch] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Customer Profile
  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      } else {
        router.push('/admin');
      }
    } catch (err) {
      console.error(err);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  // Load Recommendations
  const fetchRecommendations = async () => {
    setRecsLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/recommendations`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
    fetchRecommendations();
  }, [customerId]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleStatusChange = async (newStatus: JourneyStatus) => {
    if (!customer) return;
    try {
      const res = await fetch(`/api/customers/${customer.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'System (Status Control)',
          content: `Updated client journey status to: ${newStatus}`,
          status: newStatus
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomer(updated);
        triggerToast(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !customer) return;
    setSavingNote(true);

    try {
      const res = await fetch(`/api/customers/${customer.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: noteAuthor,
          content: noteContent,
          status: noteStatusUpdate || undefined
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomer(updated);
        setNoteContent('');
        setNoteStatusUpdate('');
        triggerToast('Note & Timeline updated successfully');
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleRecordAction = async (matchId: string, status: 'saved' | 'rejected' | 'sent') => {
    if (!customer) return;
    try {
      const rec = recommendations.find(r => r.profile.id === matchId);
      const res = await fetch('/api/matches/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          matchId,
          status,
          score: rec?.score,
          aiExplanation: rec?.aiExplanation,
          aiIntroduction: rec?.aiIntroduction
        })
      });

      if (res.ok) {
        setRecommendations(prev =>
          prev.map(r => (r.profile.id === matchId ? { ...r, status } : r))
        );
        if (status === 'saved') triggerToast('Match saved to client shortlist');
        if (status === 'rejected') triggerToast('Match hidden from client pool');
        if (status === 'sent') {
          triggerToast('Match proposal recorded as Sent');
          fetchCustomer(); // Reload customer to update timeline
        }
      }
    } catch (err) {
      console.error('Match action failed:', err);
    }
  };

  const handleConfirmSendMatch = async () => {
    if (!selectedMatch || !customer) return;
    setSendingMatch(true);

    try {
      await handleRecordAction(selectedMatch.profile.id, 'sent');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      setSelectedMatch(null);
      setShowEmailPreview(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMatch(false);
    }
  };

  if (loading || !customer) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading Client Dossier...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Client Registry</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Export Dossier (PDF)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Profile Card Header */}
        <div className="glass-panel p-6 rounded-3xl space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-rose-500 text-white font-extrabold text-2xl shadow-lg shadow-primary/20">
                {customer.firstName[0]}
                {customer.lastName[0]}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                    {customer.firstName} {customer.lastName}
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    ID: {customer.id}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {customer.gender} • {customer.age} yrs • {customer.city}, {customer.country}
                </p>
              </div>
            </div>

            {/* Journey Status Selector */}
            <div className="space-y-1 text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Journey Status</span>
              <div className="relative">
                <select
                  value={customer.journeyStatus}
                  onChange={(e) => handleStatusChange(e.target.value as JourneyStatus)}
                  className="px-3 py-2 text-xs font-bold rounded-xl border border-primary/30 bg-primary/10 text-primary focus:outline-none cursor-pointer"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Profile Verified">Profile Verified</option>
                  <option value="Match Search">Match Search</option>
                  <option value="Match Sent">Match Sent</option>
                  <option value="Meeting Scheduled">Meeting Scheduled</option>
                  <option value="Active Discussion">Active Discussion</option>
                  <option value="Success">Success</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border pt-4 text-xs">
            <div>
              <span className="text-slate-400 block">Education</span>
              <strong className="text-slate-800 dark:text-slate-200">{customer.education.degree} ({customer.education.undergradCollege})</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Profession</span>
              <strong className="text-slate-800 dark:text-slate-200">{customer.profession.designation} ({customer.profession.income} LPA)</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Religion & Caste</span>
              <strong className="text-slate-800 dark:text-slate-200">{customer.religion} ({customer.caste})</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Lifestyle</span>
              <strong className="text-slate-800 dark:text-slate-200">{customer.lifestyle.diet} • Smoke: {customer.lifestyle.smoking}</strong>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border gap-6">
          <button
            onClick={() => setActiveTab('recs')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'recs'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            AI-Scored Match Recommendations ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Timeline & Follow-up Notes ({customer.notes.length})
          </button>
        </div>

        {/* TAB 1: RECOMMENDATIONS */}
        {activeTab === 'recs' && (
          <div className="space-y-6">
            {recsLoading ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Running compatibility engine and server AI pitch generation...</span>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center text-slate-400">
                No matches currently available in pool.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((rec) => {
                  const p = rec.profile;
                  const isSent = rec.status === 'sent';
                  const isSaved = rec.status === 'saved';
                  const isRejected = rec.status === 'rejected';

                  return (
                    <div
                      key={p.id}
                      className={`glass-panel p-6 rounded-3xl space-y-4 shadow-sm relative overflow-hidden transition-all ${
                        isRejected ? 'opacity-50 grayscale' : ''
                      }`}
                    >
                      {/* Score Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 text-lg">
                            {p.firstName[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white">
                              {p.firstName} {p.lastName}
                            </h3>
                            <p className="text-xs text-slate-400">
                              {p.age} yrs • {p.city} • {p.profession.designation}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-2xl font-black text-primary">{rec.score}%</span>
                          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Match Score</span>
                        </div>
                      </div>

                      {/* Breakdown badges */}
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">Age: {rec.scoreBreakdown.age}/15</span>
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">Edu: {rec.scoreBreakdown.education}/15</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">Career: {rec.scoreBreakdown.career}/15</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">Religion: {rec.scoreBreakdown.religion}/15</span>
                      </div>

                      {/* AI Match Explanation */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-primary font-bold">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>AI Compatibility Insight</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {rec.aiExplanation}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between border-t border-border pt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRecordAction(p.id, isSaved ? 'rejected' : 'saved')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isSaved
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'border border-border hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {isSaved ? '★ Saved' : 'Save Match'}
                          </button>
                          <button
                            onClick={() => handleRecordAction(p.id, 'rejected')}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-destructive transition-all cursor-pointer"
                          >
                            {isRejected ? 'Hidden' : 'Hide'}
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedMatch(rec);
                            setShowEmailPreview(true);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                            isSent
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'bg-primary hover:bg-primary/95 shadow-primary/20'
                          }`}
                        >
                          {isSent ? 'Proposal Sent ✓' : 'Send Match Proposal'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TIMELINE & NOTES */}
        {activeTab === 'timeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Notes Form */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-sm h-fit">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>Add Follow-Up Note</span>
              </h3>

              <form onSubmit={handleAddNote} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Matchmaker Author</label>
                  <input
                    type="text"
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Journey Status Update (Optional)</label>
                  <select
                    value={noteStatusUpdate}
                    onChange={(e) => setNoteStatusUpdate(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="">Keep current status ({customer.journeyStatus})</option>
                    <option value="Profile Verified">Profile Verified</option>
                    <option value="Match Search">Match Search</option>
                    <option value="Match Sent">Match Sent</option>
                    <option value="Meeting Scheduled">Meeting Scheduled</option>
                    <option value="Active Discussion">Active Discussion</option>
                    <option value="Success">Success</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Call / Meeting Details</label>
                  <textarea
                    rows={4}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Record notes from client call, family preferences, or status update..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingNote}
                  className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingNote ? 'Saving Note...' : 'Log Note & Update Timeline'}
                </button>
              </form>
            </div>

            {/* Right: Timeline list */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Activity Timeline</h3>
              <div className="space-y-3">
                {customer.timeline.map((evt, idx) => (
                  <div key={evt.id || idx} className="glass-panel p-4 rounded-2xl flex items-start gap-4">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{evt.title}</h4>
                        <span className="text-[10px] text-slate-400">{new Date(evt.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Send Match Proposal Modal */}
      {showEmailPreview && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 space-y-6 bg-white dark:bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="font-extrabold text-sm">Send AI Match Proposal</h3>
              </div>
              <button onClick={() => setShowEmailPreview(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="text-slate-400 block">Recipient:</span>
                <strong>{customer.firstName} {customer.lastName} ({customer.email})</strong>
              </div>

              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                <span className="font-bold text-primary block">AI Generated Pitch:</span>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed italic">
                  "{selectedMatch.aiIntroduction}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setShowEmailPreview(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-border cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSendMatch}
                disabled={sendingMatch}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                {sendingMatch ? 'Transmitting Proposal...' : 'Confirm & Share with Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
