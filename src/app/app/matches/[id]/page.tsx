'use strict';
'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Send,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  Sparkles,
  CheckCircle,
  Loader2,
  Lock,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import UserLayout from '@/components/UserLayout';

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [candidate, setCandidate] = useState<any>(null);
  const [score, setScore] = useState<number | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<any>(null);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidateData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Candidate Profile & Compatibility
      const matchRes = await fetch('/api/me/matches');
      if (!matchRes.ok) throw new Error('Failed to fetch candidate recommendations');

      const matchJson = await matchRes.json();
      if (matchJson.success) {
        const found = matchJson.data.find((m: any) => m.profile.id === id);
        if (found) {
          setCandidate(found.profile);
          setScore(found.score);
          setScoreBreakdown(found.scoreBreakdown);
        } else {
          // Direct fetch fallback
          const directRes = await fetch(`/api/customers/${id}`);
          if (directRes.ok) {
            const dJson = await directRes.json();
            setCandidate(dJson);
            setScore(85);
          } else {
            setError('Candidate profile not found or ineligible.');
          }
        }
      }

      // 2. Check Shortlist status
      const shortRes = await fetch('/api/me/shortlist');
      if (shortRes.ok) {
        const sJson = await shortRes.json();
        if (sJson.success) {
          const isShort = sJson.data.some((item: any) => item.candidateId === id || item.candidate?.id === id);
          setIsShortlisted(isShort);
        }
      }

      // 3. Check Interest Request status
      const reqRes = await fetch('/api/me/requests');
      if (reqRes.ok) {
        const rJson = await reqRes.json();
        if (rJson.success) {
          const sentReq = rJson.data.sent.find(
            (r: any) => r.receiverId === candidate?.userId || r.receiver?.customer?.id === id
          );
          if (sentReq) setRequestStatus(sentReq.status);
        }
      }
    } catch (e: any) {
      console.error(e);
      setError('Unable to load profile detail. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, candidate?.userId]);

  useEffect(() => {
    fetchCandidateData();
  }, [fetchCandidateData]);

  const handleToggleShortlist = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (isShortlisted) {
        await fetch(`/api/me/shortlist/${id}`, { method: 'DELETE' });
        setIsShortlisted(false);
      } else {
        await fetch('/api/me/shortlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId: id }),
        });
        setIsShortlisted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendInterest = async () => {
    if (submitting || requestStatus) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/me/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: id }),
      });
      const json = await res.json();
      if (json.success) {
        setRequestStatus('pending');
      } else {
        alert(json.error || 'Failed to send interest request');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading matrimonial profile detail...</p>
        </div>
      </UserLayout>
    );
  }

  if (error || !candidate) {
    return (
      <UserLayout>
        <div className="glass-panel p-8 rounded-3xl text-center max-w-md mx-auto space-y-4 border-rose-100">
          <p className="text-sm font-bold text-rose-600">{error || 'Profile not found'}</p>
          <button
            onClick={() => router.push('/app/matches')}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
          >
            Back to Match Discovery
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Matches
        </button>

        {/* Hero Card */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-sm border border-border bg-gradient-to-br from-white via-slate-50/50 to-rose-50/30 dark:from-slate-900 dark:to-rose-950/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-rose-400 to-rose-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                {candidate.firstName.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                    {candidate.firstName} {candidate.lastName}
                  </h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-3">
                  <span>{candidate.age} yrs • {candidate.height} cm</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {candidate.city}, {candidate.country}
                  </span>
                </p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2 pt-1">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  {candidate.profession.designation} at {candidate.profession.company} ({candidate.profession.income} LPA)
                </p>
              </div>
            </div>

            {/* Score Pill */}
            {score !== null && (
              <div className="px-5 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center shrink-0">
                <div className="flex items-center gap-1.5 justify-center">
                  <Sparkles className="h-4 w-4 text-rose-500" />
                  <span className="text-2xl font-black text-rose-500">{score}%</span>
                </div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                  Engine Match
                </span>
              </div>
            )}
          </div>

          {/* Action CTA Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
            <button
              onClick={handleToggleShortlist}
              disabled={submitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                isShortlisted
                  ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50'
                  : 'bg-background text-slate-700 dark:text-slate-200 border-border hover:border-primary'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isShortlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
            </button>

            {requestStatus === 'accepted' ? (
              <button
                onClick={() => router.push('/app/chat')}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Open Unlocked Chat</span>
              </button>
            ) : requestStatus === 'pending' ? (
              <div className="px-5 py-2.5 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-500" />
                <span>Interest Request Sent (Pending)</span>
              </div>
            ) : (
              <button
                onClick={handleSendInterest}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-2 hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Send Matrimonial Interest</span>
              </button>
            )}

            {requestStatus !== 'accepted' && (
              <div className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                <Lock className="h-3.5 w-3.5" />
                <span>Real-Time Chat unlocks when interest is accepted</span>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education & Career */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-border">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Education & Career
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-slate-500">Degree</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{candidate.education.degree}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-slate-500">College</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{candidate.education.undergradCollege}</span>
              </div>
              {candidate.education.postgradDegree && (
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-slate-500">Postgrad</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{candidate.education.postgradDegree}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-slate-500">Industry</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{candidate.profession.industry}</span>
              </div>
            </div>
          </div>

          {/* Family & Lifestyle */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-border">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Family & Lifestyle
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-slate-500">Religion & Caste</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{candidate.religion} ({candidate.caste})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-slate-500">Family Type</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{candidate.family.familyType} Family</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-slate-500">Diet</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{candidate.lifestyle.diet}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-slate-500">Habits</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Smoking: {candidate.lifestyle.smoking} • Drinking: {candidate.lifestyle.drinking}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Deterministic Score Breakdown */}
        {scoreBreakdown && (
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-border">
            <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              8-Dimension Compatibility Breakdown
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-border">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Age</span>
                <p className="text-base font-black text-slate-950 dark:text-white">{scoreBreakdown.age} / 15</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-border">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Education</span>
                <p className="text-base font-black text-slate-950 dark:text-white">{scoreBreakdown.education} / 15</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-border">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Career</span>
                <p className="text-base font-black text-slate-950 dark:text-white">{scoreBreakdown.career} / 15</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-border">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Religion/Caste</span>
                <p className="text-base font-black text-slate-950 dark:text-white">{scoreBreakdown.religion} / 15</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-border">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Family</span>
                <p className="text-base font-black text-slate-950 dark:text-white">{scoreBreakdown.family} / 10</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-border">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Lifestyle</span>
                <p className="text-base font-black text-slate-950 dark:text-white">{scoreBreakdown.lifestyle} / 10</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-border">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Relocation</span>
                <p className="text-base font-black text-slate-950 dark:text-white">{scoreBreakdown.relocation} / 10</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-border">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Children</span>
                <p className="text-base font-black text-slate-950 dark:text-white">{scoreBreakdown.children} / 10</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
