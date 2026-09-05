'use strict';
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Users,
  Zap,
  Loader2,
  TrendingUp,
  UserCheck,
  Heart,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Filter,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setStats(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm font-semibold">Calculating real platform metrics from PostgreSQL...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Advanced Matchmaker Analytics
            </h1>
            <p className="text-xs text-slate-500">Real-time matchmaker operational metrics & conversion telemetry computed directly from PostgreSQL.</p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-900 border border-border px-3 py-1.5 rounded-xl self-start md:self-auto">
            Live Database Sync
          </span>
        </div>

        {/* 1. Client Growth & Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl space-y-2 border border-border/60">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs uppercase font-semibold">Total Clients</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.total || 0}</p>
            <p className="text-[11px] text-slate-500">
              {stats?.active || 0} active • {stats?.inactive || 0} matched/inactive
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl space-y-2 border border-border/60">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs uppercase font-semibold">Match Search Queue</span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-3xl font-black text-amber-500">{stats?.matchSearch || 0}</p>
            <p className="text-[11px] text-slate-500">Clients currently seeking recommendations</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl space-y-2 border border-border/60">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs uppercase font-semibold font-semibold">Overall Success Rate</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-emerald-500">{stats?.successRate || 0}%</p>
            <p className="text-[11px] text-slate-500">Successful matrimonial matches completed</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl space-y-2 border border-border/60">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs uppercase font-semibold">Avg Profile Completeness</span>
              <UserCheck className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-3xl font-black text-indigo-500">{stats?.profileCompletion?.average || 0}%</p>
            <p className="text-[11px] text-slate-500">
              {stats?.profileCompletion?.completed || 0} completed (&ge;80%)
            </p>
          </div>
        </div>

        {/* 2. Match Funnel Visualization */}
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Matchmaking Conversion Funnel
            </h2>
            <span className="text-xs text-slate-400">End-to-End Pipeline Telemetry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-center">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">1. Total Clients</span>
              <p className="text-xl font-black">{stats?.total || 0}</p>
              <span className="text-[10px] text-slate-500">100% Base</span>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">2. In Matching</span>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400">{stats?.matchSearch || 0}</p>
              <span className="text-[10px] text-slate-500">Search Queue</span>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">3. Matches Analyzed</span>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{stats?.matchQuality?.totalAnalyzed || 0}</p>
              <span className="text-[10px] text-slate-500">Deterministic Engine</span>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">4. Interests Sent</span>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400">{stats?.engagement?.interests || 0}</p>
              <span className="text-[10px] text-slate-500">{stats?.matchQuality?.conversions?.matchToInterest || 0}% Conv.</span>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">5. Connected</span>
              <p className="text-xl font-black text-purple-600 dark:text-purple-400">{stats?.engagement?.acceptedInterests || 0}</p>
              <span className="text-[10px] text-slate-500">{stats?.matchQuality?.conversions?.interestToConnect || 0}% Conv.</span>
            </div>

            {/* Step 6 */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">6. Matched</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats?.successRate || 0}%</p>
              <span className="text-[10px] text-slate-500">{stats?.matchQuality?.conversions?.connectToMatch || 0}% Conv.</span>
            </div>
          </div>
        </div>

        {/* 3. Operational Performance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Match Quality Distribution */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Match Compatibility Distribution
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-600 dark:text-emerald-400">High Quality Matches (&ge; 80%)</span>
                  <span>{stats?.matchQuality?.highQuality || 0} pairs</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${
                        stats?.matchQuality?.totalAnalyzed > 0
                          ? (stats.matchQuality.highQuality / stats.matchQuality.totalAnalyzed) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-600 dark:text-amber-400">Moderate Quality Matches (60% - 79%)</span>
                  <span>{stats?.matchQuality?.moderateQuality || 0} pairs</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${
                        stats?.matchQuality?.totalAnalyzed > 0
                          ? (stats.matchQuality.moderateQuality / stats.matchQuality.totalAnalyzed) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-600 dark:text-rose-400">Low Quality Matches (&lt; 60%)</span>
                  <span>{stats?.matchQuality?.lowQuality || 0} pairs</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${
                        stats?.matchQuality?.totalAnalyzed > 0
                          ? (stats.matchQuality.lowQuality / stats.matchQuality.totalAnalyzed) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-between items-center text-xs text-slate-500">
              <span>Average Compatibility Score:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{stats?.matchQuality?.averageScore || 0}%</strong>
            </div>
          </div>

          {/* Follow-up Performance */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Follow-Up & Operational Execution
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-1">
                <span className="text-[10px] uppercase font-bold">Completed Tasks</span>
                <p className="text-2xl font-black">{stats?.followUps?.completed || 0}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 space-y-1">
                <span className="text-[10px] uppercase font-bold">Due Today</span>
                <p className="text-2xl font-black">{stats?.followUps?.dueToday || 0}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 space-y-1">
                <span className="text-[10px] uppercase font-bold">Overdue Tasks</span>
                <p className="text-2xl font-black">{stats?.followUps?.overdue || 0}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 space-y-1">
                <span className="text-[10px] uppercase font-bold">Active Realtime Chats</span>
                <p className="text-2xl font-black">{stats?.engagement?.conversations || 0}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-between items-center text-xs text-slate-500">
              <span>Shortlists Recorded:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{stats?.engagement?.shortlists || 0}</strong>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

