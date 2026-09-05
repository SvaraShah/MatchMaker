'use strict';
'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  ArrowLeft,
  Heart,
  Calendar,
  FileText,
  Clock,
  Bot,
  ShieldCheck,
  Plus,
  CheckCircle,
  Sparkles,
  Loader2,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

export default function ClientDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'profile' | 'preferences' | 'matches' | 'activity' | 'notes' | 'followups' | 'ai' | 'audit'
  >('overview');

  // Form states
  const [newNoteContent, setNewNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpPriority, setFollowUpPriority] = useState('medium');
  const [addingFollowUp, setAddingFollowUp] = useState(false);

  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const fetchClientDossier = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchClientMatches = useCallback(async () => {
    setLoadingMatches(true);
    try {
      const res = await fetch(`/api/customers/${id}/recommendations`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setMatches(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMatches(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClientDossier();
  }, [fetchClientDossier]);

  useEffect(() => {
    if (activeTab === 'matches') fetchClientMatches();
  }, [activeTab, fetchClientMatches]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || addingNote) return;
    setAddingNote(true);

    try {
      const res = await fetch(`/api/customers/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNoteContent, author: 'Admin Matchmaker' }),
      });

      if (res.ok) {
        setNewNoteContent('');
        fetchClientDossier();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingNote(false);
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpTitle.trim() || !followUpDate || addingFollowUp) return;
    setAddingFollowUp(true);

    try {
      const res = await fetch('/api/admin/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: id,
          title: followUpTitle,
          dueDate: followUpDate,
          priority: followUpPriority,
        }),
      });

      if (res.ok) {
        setFollowUpTitle('');
        setFollowUpDate('');
        fetchClientDossier();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingFollowUp(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[450px]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-xs text-slate-500 mt-2 font-medium">Loading Client 360° Dossier...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!client) {
    return (
      <AdminLayout>
        <div className="glass-panel p-8 text-center rounded-3xl space-y-4 max-w-md mx-auto">
          <p className="text-xs text-rose-500 font-bold">Client record not found.</p>
          <button onClick={() => router.push('/admin/clients')} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl">
            Return to Client Directory
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Navigation back */}
        <button
          onClick={() => router.push('/admin/clients')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </button>

        {/* Dossier Header Workspace */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-sm border border-border bg-gradient-to-br from-white via-slate-50/50 to-rose-50/20 dark:from-slate-900 dark:to-rose-950/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-rose-500 to-primary text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
                {client.firstName.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                    {client.firstName} {client.lastName}
                  </h1>
                  <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {client.journeyStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-3">
                  <span>{client.gender} • {client.age} yrs • ID: {client.id.substring(0, 10)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {client.city}, {client.country}
                  </span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {client.profession.designation} at {client.profession.company} ({client.profession.income} LPA)
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => router.push(`/admin/agent`)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 hover:bg-primary/95 transition-all cursor-pointer"
              >
                <Bot className="h-4 w-4" />
                <span>Ask AI Agent</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1 text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'profile', label: 'Profile Details' },
            { id: 'preferences', label: 'Partner Preferences' },
            { id: 'matches', label: 'Matches' },
            { id: 'activity', label: 'Timeline Activity' },
            { id: 'notes', label: 'Private Notes' },
            { id: 'followups', label: 'Task Follow-ups' },
            { id: 'ai', label: 'AI Insights' },
            { id: 'audit', label: 'Audit Log' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary bg-primary/5'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl space-y-4 border border-border">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-950 dark:text-white">
                <GraduationCap className="h-4 w-4 text-primary" />
                Education & Career Background
              </h3>
              <div className="space-y-2 text-xs">
                <p><strong>Degree:</strong> {client.education.degree}</p>
                <p><strong>College:</strong> {client.education.undergradCollege}</p>
                {client.education.postgradDegree && <p><strong>Postgrad:</strong> {client.education.postgradDegree}</p>}
                <p><strong>Industry:</strong> {client.profession.industry}</p>
                <p><strong>Income:</strong> {client.profession.income} LPA</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-4 border border-border">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-950 dark:text-white">
                <Users className="h-4 w-4 text-primary" />
                Family & Lifestyle Attributes
              </h3>
              <div className="space-y-2 text-xs">
                <p><strong>Religion/Caste:</strong> {client.religion} ({client.caste})</p>
                <p><strong>Family Type:</strong> {client.family.familyType}</p>
                <p><strong>Diet:</strong> {client.lifestyle.diet}</p>
                <p><strong>Smoking:</strong> {client.lifestyle.smoking} • <strong>Drinking:</strong> {client.lifestyle.drinking}</p>
                <p><strong>Contact Email:</strong> {client.email}</p>
                <p><strong>Phone:</strong> {client.phone}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6 max-w-3xl">
            <form onSubmit={handleAddNote} className="glass-panel p-6 rounded-3xl space-y-3 border border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Log Private Matchmaker Note</h3>
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Enter confidential client observations, meeting takeaways, or preference updates..."
                className="w-full p-3 text-xs rounded-xl border border-border bg-background h-24 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addingNote || !newNoteContent.trim()}
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {addingNote ? 'Saving Note...' : 'Save Private Note'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {client.notes?.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs glass-panel rounded-2xl">No private notes logged for this client yet.</div>
              ) : (
                client.notes?.map((n: any) => (
                  <div key={n.id} className="glass-panel p-4 rounded-2xl border border-border space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-primary">{n.author}</span>
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'followups' && (
          <div className="space-y-6 max-w-3xl">
            <form onSubmit={handleAddFollowUp} className="glass-panel p-6 rounded-3xl space-y-4 border border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Schedule Task Follow-Up</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <input
                  type="text"
                  value={followUpTitle}
                  onChange={(e) => setFollowUpTitle(e.target.value)}
                  placeholder="Task title (e.g. Call client for match feedback)..."
                  className="sm:col-span-2 p-3 rounded-xl border border-border bg-background"
                />
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="p-3 rounded-xl border border-border bg-background"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addingFollowUp || !followUpTitle.trim() || !followUpDate}
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {addingFollowUp ? 'Scheduling...' : 'Schedule Follow-Up'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            {loadingMatches ? (
              <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Computing deterministic match engine recommendations...</span>
              </div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs glass-panel rounded-2xl">No candidate matches calculated yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((m: any, idx: number) => (
                  <div key={idx} className="glass-panel p-5 rounded-2xl border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-rose-500 text-white font-bold text-sm flex items-center justify-center">
                          {m.profile.firstName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-950 dark:text-white">
                            {m.profile.firstName} {m.profile.lastName}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {m.profile.gender}, {m.profile.age} yrs • {m.profile.city}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-rose-500">{m.score}%</span>
                        <span className="block text-[9px] font-bold uppercase text-slate-400">Match Score</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {m.profile.profession.designation} at {m.profile.profession.company}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="glass-panel p-8 rounded-3xl space-y-4 border border-border bg-gradient-to-br from-white to-rose-50/30 dark:from-slate-900 dark:to-rose-950/20">
            <h3 className="text-sm font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Matchmaker Portfolio Insights
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Client <strong>{client.firstName} {client.lastName}</strong> is currently at stage <strong>{client.journeyStatus}</strong>.
              Based on PostgreSQL records, they have <strong>{client.notes?.length || 0} notes</strong> and <strong>{matches.length} top candidates</strong> evaluated deterministically.
            </p>
            <button
              onClick={() => router.push('/admin/agent')}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 hover:bg-primary/95 transition-all cursor-pointer"
            >
              <Bot className="h-4 w-4" />
              <span>Launch AI Matchmaker Agent Session</span>
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
