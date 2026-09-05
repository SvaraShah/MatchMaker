'use strict';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Users,
  Bookmark,
  Send,
  User,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Heart,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import UserLayout from '@/components/UserLayout';
import { getTimeGreeting } from '@/lib/time';

export default function UserHomePage() {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Good morning');
  const [userSession, setUserSession] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [stats, setStats] = useState({
    shortlistsCount: 0,
    receivedRequestsCount: 0,
    sentRequestsCount: 0,
  });

  const fetchUserData = useCallback(async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const json = await meRes.json();
        if (json.success) setUserSession(json.user);
      }

      const profRes = await fetch('/api/me/profile');
      if (profRes.ok) {
        const pJson = await profRes.json();
        if (pJson.success) setProfileData(pJson.data);
      }

      const shortRes = await fetch('/api/me/shortlist');
      const reqRes = await fetch('/api/me/requests');

      let shortCount = 0;
      let recCount = 0;
      let sentCount = 0;

      if (shortRes.ok) {
        const sJson = await shortRes.json();
        if (sJson.success) shortCount = sJson.data.length;
      }
      if (reqRes.ok) {
        const rJson = await reqRes.json();
        if (rJson.success) {
          recCount = rJson.data.received.filter((r: any) => r.status === 'pending').length;
          sentCount = rJson.data.sent.length;
        }
      }

      setStats({
        shortlistsCount: shortCount,
        receivedRequestsCount: recCount,
        sentRequestsCount: sentCount,
      });

      // Fetch top recommended matches
      const matchRes = await fetch('/api/me/matches');
      if (matchRes.ok) {
        const mJson = await matchRes.json();
        if (mJson.success) setMatches(mJson.data.slice(0, 4));
      }
    } catch (e) {
      console.error('Failed to load user home data:', e);
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    setGreeting(getTimeGreeting());
    fetchUserData();
  }, [fetchUserData]);

  const firstName = userSession?.name?.split(' ')[0] || 'Member';

  // Calculate profile completeness score
  let completenessScore = 60;
  const missingItems: string[] = [];
  if (profileData) {
    if (profileData.photoUrl) completenessScore += 15; else missingItems.push('Profile Photo');
    if (profileData.aboutMe) completenessScore += 15; else missingItems.push('About Me Bio');
    if (profileData.preference) completenessScore += 10; else missingItems.push('Partner Preferences');
  }

  return (
    <UserLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Banner */}
        <div className="glass-panel p-8 rounded-3xl space-y-4 shadow-xs relative overflow-hidden bg-gradient-to-br from-white via-rose-50/40 to-rose-100/30 dark:from-slate-900 dark:via-rose-950/20 dark:to-slate-900 border-rose-100 dark:border-rose-900/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Verified Matrimonial Member
              </span>
              <h1 className="text-3xl font-black text-slate-950 dark:text-white">
                {greeting}, {firstName}!
              </h1>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                Here are some meaningful matches for you today.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Explore hand-picked AI verified pairings matched to your partner preferences.
              </p>
            </div>

            <button
              onClick={() => router.push('/app/matches')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-primary text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:opacity-95 transition-all cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>Discover All Matches</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Profile Completeness Card */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-rose-100 dark:border-rose-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-white font-black text-xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
                {profileData?.photoUrl ? (
                  <img src={profileData.photoUrl} alt={firstName} className="h-full w-full object-cover" />
                ) : (
                  <span>{firstName[0]}</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-950 dark:text-white">Your Profile</h3>
                  <span className="text-xs font-black text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                    {completenessScore}% Complete
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {missingItems.length > 0
                    ? `Improve match accuracy by adding: ${missingItems.join(', ')}`
                    : 'Your profile is fully completed and optimized for matchmaking!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/app/profile')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all cursor-pointer shrink-0"
            >
              Complete Profile
            </button>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full" style={{ width: `${completenessScore}%` }} />
          </div>
        </div>

        {/* Quick Activity Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => router.push('/app/matches')}
            className="glass-panel p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-rose-400 transition-all shadow-xs"
          >
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Eligible Matches</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">Curated</p>
              <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Opposite Gender Filtered
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div
            onClick={() => router.push('/app/shortlist')}
            className="glass-panel p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all shadow-xs"
          >
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">My Shortlist</span>
              <p className="text-2xl font-black text-amber-500">{stats.shortlistsCount}</p>
              <span className="text-[11px] text-slate-400">Saved candidate profiles</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <Bookmark className="h-5 w-5" />
            </div>
          </div>

          <div
            onClick={() => router.push('/app/requests')}
            className="glass-panel p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-all shadow-xs"
          >
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Received Requests</span>
              <p className="text-2xl font-black text-emerald-500">{stats.receivedRequestsCount}</p>
              <span className="text-[11px] text-slate-400">Pending invitations</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
              <Send className="h-5 w-5" />
            </div>
          </div>
        </section>

        {/* Recommended Matches */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500 fill-rose-500/20" />
              Recommended Matrimonial Matches
            </h2>
            <button
              onClick={() => router.push('/app/matches')}
              className="text-xs font-bold text-rose-500 hover:underline"
            >
              Explore All →
            </button>
          </div>

          {loadingMatches ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
              <span className="text-xs">Loading curated match profiles...</span>
            </div>
          ) : matches.length === 0 ? (
            <div className="glass-panel p-8 rounded-3xl text-center space-y-2">
              <p className="text-xs text-slate-500">No match recommendations available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((m) => {
                const p = m.profile;
                return (
                  <div
                    key={p.id}
                    className="glass-panel p-6 rounded-3xl space-y-4 hover:border-rose-300 dark:hover:border-rose-900/50 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 text-white font-black text-xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
                            {p.photoUrl ? (
                              <img src={p.photoUrl} alt={p.firstName} className="h-full w-full object-cover" />
                            ) : (
                              <span>{p.firstName[0]}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-950 dark:text-white">
                              {p.firstName} {p.lastName}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {p.age} yrs • {p.city} • {p.religion} ({p.caste})
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-2xl font-black text-rose-500">{m.score}%</span>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-border">
                        <p className="truncate">
                          <strong>Career:</strong> {p.profession?.designation}
                        </p>
                        <p className="truncate">
                          <strong>Education:</strong> {p.education?.degree}
                        </p>
                      </div>

                      {m.aiIntroduction && (
                        <p className="text-xs italic text-slate-600 dark:text-slate-300 bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30 line-clamp-2">
                          "{m.aiIntroduction}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <button
                        onClick={() => router.push(`/app/matches/${p.id}`)}
                        className="text-xs font-bold text-rose-500 hover:underline"
                      >
                        View Full Profile →
                      </button>

                      <button
                        onClick={() => router.push('/app/matches')}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-primary text-white text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </UserLayout>
  );
}
