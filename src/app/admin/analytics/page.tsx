'use client';

import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ANALYTICS_DATA, ADMIN_STATS } from '@/lib/mockData';
import { BarChart3, TrendingUp, Users, Heart, Sparkles, PieChart, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Matchmaking Intelligence & Analytics
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Executive performance metrics, client demographics & conversion funnels
          </p>
        </div>
      </div>

      {/* Top Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total Profiles', val: ADMIN_STATS.totalClients },
          { label: 'Active Profiles', val: ADMIN_STATS.activeProfiles },
          { label: 'Matches Suggested', val: ADMIN_STATS.matchesSuggested },
          { label: 'Interests Sent', val: 43 },
          { label: 'Interests Accepted', val: 26 },
          { label: 'Connections', val: ADMIN_STATS.connections },
          { label: 'Avg Compatibility', val: '86.4%' }
        ].map((m, idx) => (
          <div key={idx} className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">{m.label}</span>
            <span className="text-xl font-bold text-stone-900 block leading-tight">{m.val}</span>
          </div>
        ))}
      </div>

      {/* Analytics Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Funnel Breakdown */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">Conversion Funnel</h3>
            <p className="text-xs text-stone-500">Pipeline progression from profile creation to marriage connection</p>
          </div>

          <div className="space-y-3 pt-2">
            {ANALYTICS_DATA.funnel.map((item, idx) => {
              const pct = Math.round((item.count / 128) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-stone-800">
                    <span>{item.stage}</span>
                    <span>{item.count} ({pct}%)</span>
                  </div>
                  <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-600 to-rose-800 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compatibility Distribution */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">Compatibility Score Distribution</h3>
            <p className="text-xs text-stone-500">Deterministic scoring breakdown across active candidate pairs</p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: '85–95% Excellent Match', count: 16, pct: 42, color: 'bg-emerald-600' },
              { label: '70–84% Good Match', count: 14, pct: 36, color: 'bg-teal-600' },
              { label: '55–69% Moderate Match', count: 6, pct: 15, color: 'bg-amber-500' },
              { label: 'Below 55% Low Compatibility', count: 3, pct: 7, color: 'bg-stone-400' }
            ].map((dist, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-stone-800">
                  <span>{dist.label}</span>
                  <span>{dist.count} Pairs ({dist.pct}%)</span>
                </div>
                <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full ${dist.color} rounded-full`} style={{ width: `${dist.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics by City */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">Top Client Locations</h3>
            <p className="text-xs text-stone-500">Client volume distribution across major metropolitan cities</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { city: 'Mumbai', count: 48, pct: '37.5%' },
              { city: 'Pune', count: 24, pct: '18.7%' },
              { city: 'Ahmedabad', count: 20, pct: '15.6%' },
              { city: 'Delhi NCR', count: 18, pct: '14.0%' },
              { city: 'Bangalore', count: 12, pct: '9.3%' },
              { city: 'Jaipur / Other', count: 6, pct: '4.9%' }
            ].map((loc, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                <span className="font-semibold text-stone-800">{loc.city}</span>
                <span className="font-bold text-rose-700">{loc.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Matches by Religion */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">Matches by Religion & Sect</h3>
            <p className="text-xs text-stone-500">Demographic composition of bureau client base</p>
          </div>

          <div className="space-y-3">
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

      </div>

    </AdminLayout>
  );
}
