'use strict';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  ChevronRight,
  TrendingUp,
  Zap,
  Sparkles,
  Bot,
  UserCheck,
  Calendar,
  AlertCircle,
  Clock,
  Heart,
  CheckCircle2,
  ArrowRight,
  Filter
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Customer } from '@/types/matchmaker';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [followUps, setFollowUps] = useState<any[]>([]);

  // Stats
  const [stats, setStats] = useState<any>({
    total: 0,
    active: 0,
    matchSearch: 0,
    successRate: 0,
    verified: 0,
    pendingRequests: 0,
    followUps: { overdue: 0, dueToday: 0 }
  });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      }
    } catch (e) {
      console.error('Stats fetch error:', e);
    }
  };

  const fetchFollowUps = async () => {
    try {
      const res = await fetch('/api/admin/follow-ups');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setFollowUps(json.data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchStats();
    fetchFollowUps();
  }, [fetchCustomers]);

  const recentClients = customers.slice(0, 6);
  const needsAttentionClients = customers.filter(
    (c) => c.journeyStatus === 'New Lead' || c.journeyStatus === 'Match Search'
  ).slice(0, 5);

  const overdueFollowUps = followUps.filter((f) => f.status === 'PENDING' && new Date(f.dueDate) < new Date());

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Banner */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs relative overflow-hidden border border-border/60">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              Matchmaker Command Center
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete operational dossier management, client pipeline control, and AI-assisted matchmaking context.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/admin/pipeline')}
              className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-all cursor-pointer shadow-xs"
            >
              Open Pipeline Kanban
            </button>
          </div>
        </div>

        {/* Command Center KPI Cards Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => router.push('/admin/clients')}
            className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-xs hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Clients</span>
              <p className="text-2xl font-black">{loading ? '...' : stats.total}</p>
              <span className="text-[10px] text-slate-500">{stats.active || 0} Active Clients</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div
            onClick={() => router.push('/admin/matches')}
            className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-xs hover:border-amber-500/50 transition-all cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Match Search Queue</span>
              <p className="text-2xl font-black text-amber-500">{loading ? '...' : stats.matchSearch}</p>
              <span className="text-[10px] text-amber-600 dark:text-amber-400">Awaiting Match Review</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
          </div>

          <div
            onClick={() => router.push('/admin/follow-ups')}
            className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-xs hover:border-rose-500/50 transition-all cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Overdue Follow-ups</span>
              <p className="text-2xl font-black text-rose-500">{stats.followUps?.overdue || overdueFollowUps.length}</p>
              <span className="text-[10px] text-rose-600 dark:text-rose-400">Requires Immediate Action</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div
            onClick={() => router.push('/admin/analytics')}
            className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-xs hover:border-emerald-500/50 transition-all cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Match Success Rate</span>
              <p className="text-2xl font-black text-emerald-500">{loading ? '...' : `${stats.successRate}%`}</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Matrimonial Conversions</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </section>

        {/* Needs Attention & Action Items */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Needs Attention Callouts */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-border/60">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Clients Needing Operational Attention
              </h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Priority Items</span>
            </div>

            <div className="space-y-3">
              {needsAttentionClients.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No client profiles currently require immediate review.</p>
              ) : (
                needsAttentionClients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/admin/clients/${c.id}`)}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border/60 flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs overflow-hidden">
                        {c.photoUrl ? (
                          <img src={c.photoUrl} alt={c.firstName} className="h-full w-full object-cover" />
                        ) : (
                          <span>{c.firstName[0]}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                          {c.firstName} {c.lastName}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {c.gender} • {c.age} yrs • {c.city}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      {c.journeyStatus}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overdue & Due Today Follow-up Tasks */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-border/60">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-rose-500" />
                Matchmaker Follow-Up Radar
              </h2>
              <button
                onClick={() => router.push('/admin/follow-ups')}
                className="text-xs text-primary font-bold hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {followUps.slice(0, 4).length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No scheduled follow-up tasks recorded.</p>
              ) : (
                followUps.slice(0, 4).map((f) => (
                  <div
                    key={f.id}
                    onClick={() => router.push(`/admin/clients/${f.customerId}`)}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border/60 flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{f.title}</h4>
                      <p className="text-[11px] text-slate-500">Client ID: {f.customerId}</p>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      f.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : new Date(f.dueDate) < new Date()
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                    }`}>
                      {f.status === 'COMPLETED' ? 'Completed' : new Date(f.dueDate) < new Date() ? 'Overdue' : 'Due Soon'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Recent Client Registrations Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Recent Client Portfolios ({customers.length})
            </h2>
            <button
              onClick={() => router.push('/admin/clients')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Explore All Clients</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentClients.map((c) => (
              <div
                key={c.id}
                onClick={() => router.push(`/admin/clients/${c.id}`)}
                className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all cursor-pointer group shadow-xs hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm overflow-hidden">
                        {c.photoUrl ? (
                          <img src={c.photoUrl} alt={c.firstName} className="h-full w-full object-cover" />
                        ) : (
                          <span>{c.firstName[0]}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-950 dark:text-white group-hover:text-primary transition-colors">
                          {c.firstName} {c.lastName}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {c.gender} • {c.age} yrs • {c.city}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {c.journeyStatus}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 border-t border-border pt-3">
                    <p className="truncate">
                      <strong>Role:</strong> {c.profession?.designation}
                    </p>
                    <p className="truncate">
                      <strong>Education:</strong> {c.education?.degree}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-border pt-3">
                  <span>Income: {c.profession?.income} LPA</span>
                  <span className="font-bold text-primary group-hover:underline">View 360° Dossier →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

