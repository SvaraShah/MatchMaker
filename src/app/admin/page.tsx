'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import {
  Users,
  UserCheck,
  UserPlus,
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Calendar,
  Eye,
  Send
} from 'lucide-react';
import {
  ADMIN_STATS,
  TODAY_FOLLOWUPS,
  RECENT_ACTIVITIES,
  MOCK_PROFILES,
  ANALYTICS_DATA
} from '@/lib/mockData';
import { calculateDeterministicCompatibility } from '@/lib/deterministicMatcher';

export default function AdminDashboardPage() {
  const router = useRouter();

  // High Compatibility matches using deterministic engine
  const clientRiya = MOCK_PROFILES.find(p => p.id === 'client-1')!;
  const clientMeera = MOCK_PROFILES.find(p => p.id === 'client-3')!;
  const clientSneha = MOCK_PROFILES.find(p => p.id === 'client-5')!;

  const matchRiyaArjun = calculateDeterministicCompatibility(clientRiya, MOCK_PROFILES.find(p => p.id === 'client-2')!);
  const matchMeeraKunal = calculateDeterministicCompatibility(clientMeera, MOCK_PROFILES.find(p => p.id === 'client-4')!);
  const matchSnehaRohan = calculateDeterministicCompatibility(clientSneha, MOCK_PROFILES.find(p => p.id === 'client-6')!);

  const sampleMatchCards = [
    {
      profile: MOCK_PROFILES[0], // Riya
      score: matchRiyaArjun.totalScore,
      label: matchRiyaArjun.label
    },
    {
      profile: MOCK_PROFILES[1], // Arjun
      score: 88,
      label: 'Good Match'
    },
    {
      profile: MOCK_PROFILES[2], // Meera
      score: matchMeeraKunal.totalScore,
      label: matchMeeraKunal.label
    },
    {
      profile: MOCK_PROFILES[3], // Kunal
      score: 82,
      label: 'Good Match'
    },
    {
      profile: MOCK_PROFILES[4], // Sneha
      score: matchSnehaRohan.totalScore,
      label: matchSnehaRohan.label
    },
    {
      profile: MOCK_PROFILES[5], // Rohan
      score: 76,
      label: 'Good Match'
    }
  ];

  return (
    <AdminLayout>
      
      {/* Hero Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-stone-200/60">
        <div>
          <div className="flex items-center gap-2 text-rose-700 font-medium text-xs mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Matchmaker Executive Dashboard</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Good Morning, Matchmaker!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Here's what's happening across your matrimonial matchmaking portfolio today.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block text-right pr-3 border-r border-stone-200">
            <p className="font-serif italic text-xs text-stone-600">
              "Bringing people together<br />for a brighter tomorrow."
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 shadow-2xs flex items-center gap-2">
            <Calendar className="h-4 w-4 text-rose-600" />
            <span className="text-xs font-semibold text-stone-800">Tue, 10 Dec 2024</span>
          </div>
        </div>
      </div>

      {/* 8 Compact Metric Cards in Responsive Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total Clients', val: ADMIN_STATS.totalClients, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active Profiles', val: ADMIN_STATS.activeProfiles, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'New This Week', val: ADMIN_STATS.newThisWeek, icon: UserPlus, color: 'text-violet-600 bg-violet-50' },
          { label: 'Matches Suggested', val: ADMIN_STATS.matchesSuggested, icon: Heart, color: 'text-rose-600 bg-rose-50' },
          { label: 'Pending Interests', val: ADMIN_STATS.pendingInterests, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Connections', val: ADMIN_STATS.connections, icon: CheckCircle2, color: 'text-teal-600 bg-teal-50' },
          { label: 'Follow-ups Due', val: ADMIN_STATS.followUpsDue, icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
          { label: 'High Compatibility', val: ADMIN_STATS.highCompatibility, icon: Sparkles, color: 'text-pink-600 bg-pink-50' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs hover:shadow-xs transition-all space-y-1.5">
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-lg ${stat.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-[10px] text-stone-400 font-medium">CRM</span>
              </div>
              <div>
                <span className="text-xl font-bold text-stone-900 block leading-tight">{stat.val}</span>
                <span className="text-[11px] text-stone-500 font-medium block truncate mt-0.5">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Today's Follow-ups + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Today's Follow-ups Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900">Today's Follow-ups</h2>
              <p className="text-[11px] text-stone-500">Scheduled client tasks requiring matchmaker attention</p>
            </div>
            <button
              onClick={() => router.push('/admin/follow-ups')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  <th className="pb-2.5 font-bold">Client</th>
                  <th className="pb-2.5 font-bold">Task</th>
                  <th className="pb-2.5 font-bold">Time</th>
                  <th className="pb-2.5 font-bold">Priority</th>
                  <th className="pb-2.5 text-right font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {TODAY_FOLLOWUPS.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition-all">
                    <td className="py-3">
                      <div
                        className="flex items-center gap-2.5 cursor-pointer"
                        onClick={() => router.push(`/admin/clients/${item.clientId}`)}
                      >
                        <img src={item.avatar} alt={item.clientName} className="h-7 w-7 rounded-full object-cover border border-stone-200" />
                        <span className="font-semibold text-stone-900 hover:text-rose-700">{item.clientName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-stone-600 max-w-[180px] truncate">{item.task}</td>
                    <td className="py-3 text-stone-500 font-medium text-[11px]">{item.dueTime}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        item.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                        item.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Match Activity */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900">Recent Match Activity</h2>
              <p className="text-[11px] text-stone-500">Live interactions & compatibility progress</p>
            </div>
            <button
              onClick={() => router.push('/admin/pipeline')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {RECENT_ACTIVITIES.map((act) => (
              <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-50/70 border border-stone-100 hover:bg-stone-100/50 transition-all">
                <div className="flex -space-x-2 shrink-0 pt-0.5">
                  <img src={act.avatar1} alt="" className="h-7 w-7 rounded-full object-cover border-2 border-white" />
                  {act.avatar2 && (
                    <img src={act.avatar2} alt="" className="h-7 w-7 rounded-full object-cover border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-stone-900 leading-snug">{act.text}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">{act.detail}</p>
                </div>
                <span className="text-[10px] text-stone-400 font-medium shrink-0">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* High Compatibility Matches (Horizontal Row of 6 Premium Matrimonial Profile Cards) */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h2 className="font-serif font-bold text-lg text-stone-900">High Compatibility Matches</h2>
            <p className="text-xs text-stone-500">Top candidate profiles scoring high on 12-dimension deterministic matching</p>
          </div>
          <button
            onClick={() => router.push('/admin/matches')}
            className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View all matches</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 6 Responsive Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sampleMatchCards.map((item, idx) => {
            const p = item.profile;
            return (
              <div key={idx} className="bg-stone-50/70 border border-stone-200/70 rounded-xl overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between">
                
                {/* Profile Image & Badge */}
                <div className="relative h-44 w-full bg-stone-200">
                  <img src={p.photoUrl} alt={`${p.firstName} ${p.lastName}`} className="h-full w-full object-cover" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-700 text-white font-bold text-[11px] shadow-sm">
                    {item.score}%
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-stone-900 leading-tight">
                      {p.firstName} {p.lastName}
                    </h3>
                    <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                      {p.age} • {p.city}
                    </p>
                  </div>

                  <div className="text-[11px] space-y-0.5 text-stone-600 border-t border-stone-200/50 pt-2">
                    <p className="font-semibold text-stone-800 truncate">{p.profession.designation}</p>
                    <p className="text-[10px] text-stone-500 truncate">{p.education.degree}</p>
                    <p className="text-[10px] text-rose-700 font-medium truncate">
                      {p.religion} {p.jainSect ? `(${p.jainSect})` : ''}
                    </p>
                    <p className="text-[10px] text-stone-400">{p.maritalStatus}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-stone-200/50">
                    <button
                      onClick={() => router.push(`/admin/clients/${p.id}`)}
                      className="w-full py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-[10px] font-semibold text-stone-700 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => router.push(`/admin/matches?client=${p.id}`)}
                      className="w-full py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-[10px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Send className="h-3 w-3" />
                      <span>Suggest</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Visuals Section (Match Funnel, Matches by Religion, Client Growth) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* A. Match Funnel */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-5 space-y-4">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">Match Funnel</h3>
            <p className="text-[11px] text-stone-500">Pipeline conversion across matchmaking stages</p>
          </div>
          <div className="space-y-2 pt-1">
            {ANALYTICS_DATA.funnel.map((item, idx) => {
              const maxVal = ANALYTICS_DATA.funnel[0].count;
              const pct = Math.round((item.count / maxVal) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-stone-700">
                    <span>{item.stage}</span>
                    <span className="font-bold text-stone-900">{item.count}</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-rose-700 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* B. Matches by Religion */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-5 space-y-4">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">Matches by Religion</h3>
            <p className="text-[11px] text-stone-500">Client demographic breakdown across bureau pool</p>
          </div>
          <div className="space-y-3 pt-2">
            {ANALYTICS_DATA.byReligion.map((rel, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: rel.color }} />
                  <span className="font-semibold text-stone-800">{rel.name}</span>
                </div>
                <span className="font-bold text-stone-900">{rel.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* C. Client Growth */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">Client Growth</h3>
              <p className="text-[11px] text-stone-500">Monthly new profile registrations</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" />
              <span>+14%</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-40 pt-4 border-b border-stone-100">
            {ANALYTICS_DATA.clientGrowth.map((g, idx) => {
              const maxVal = 140;
              const hPct = Math.round((g.clients / maxVal) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-stone-600">{g.clients}</span>
                  <div
                    className="w-full bg-rose-600/80 hover:bg-rose-700 rounded-t-md transition-all"
                    style={{ height: `${hPct}%` }}
                  />
                  <span className="text-[10px] text-stone-400 font-medium">{g.month}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </AdminLayout>
  );
}
