'use strict';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  SlidersHorizontal,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  TrendingUp,
  UserCheck,
  Zap,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';
import { Customer, JourneyStatus } from '@/types/matchmaker';

export default function DashboardPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<JourneyStatus | 'All'>('All');
  const [gender, setGender] = useState<string>('All');
  const [sort, setSort] = useState<string>('lastUpdated');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    matchSearch: 0,
    successRate: 0,
    verified: 0
  });

  // Load theme preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  // Fetch Customers API
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'All') params.append('status', status);
      if (gender !== 'All') params.append('gender', gender);
      params.append('sort', sort);

      const res = await fetch(`/api/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);

        // If it's a full fetch (no filters), update stats values
        if (!search && status === 'All' && gender === 'All') {
          const total = data.length;
          const matchSearch = data.filter((c: Customer) => c.journeyStatus === 'Match Search').length;
          const success = data.filter((c: Customer) => c.journeyStatus === 'Success').length;
          const verified = data.filter((c: Customer) => c.journeyStatus === 'Profile Verified' || c.journeyStatus === 'Match Search').length;
          
          setStats({
            total,
            matchSearch,
            successRate: total > 0 ? Math.round((success / total) * 100) : 0,
            verified
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  }, [search, status, gender, sort]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.refresh();
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Status Badge Colors helper
  const getStatusStyles = (status: JourneyStatus) => {
    switch (status) {
      case 'New Lead':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Profile Verified':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Match Search':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 animate-pulse-slow';
      case 'Match Sent':
        return 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      case 'Meeting Scheduled':
        return 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200 dark:border-violet-800';
      case 'Active Discussion':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'Success':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-semibold';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    }
  };

  // Completeness Calculator
  const getCompleteness = (c: Customer) => {
    let fields = [
      c.firstName, c.lastName, c.gender, c.dob, c.email, c.phone,
      c.city, c.religion, c.caste, c.motherTongue,
      c.education?.undergradCollege, c.education?.degree,
      c.profession?.company, c.profession?.designation, c.profession?.income, c.profession?.industry,
      c.family?.familyType, c.family?.parentsOccupation,
      c.lifestyle?.smoking, c.lifestyle?.drinking, c.lifestyle?.diet,
      c.preferences?.ageMin, c.preferences?.ageMax, c.preferences?.locations, c.preferences?.religions
    ];
    const filled = fields.filter(f => f !== undefined && f !== null && f !== '' && (Array.isArray(f) ? f.length > 0 : true));
    return Math.round((filled.length / fields.length) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* 1. Header Area */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
              <Zap className="h-5 w-5" fill="currentColor" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-primary dark:from-white dark:to-primary">
                TDC Matchmaker
              </span>
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-rose-50 text-primary dark:bg-primary/10 border border-primary/20">
                CRM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              Welcome, <strong className="text-slate-800 dark:text-white">Matchmaker Maya</strong>
            </span>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-border bg-background hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-semibold cursor-pointer transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner with info */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-[30%] bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              Client Registry
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Source partners, evaluate compatibility scores, and share hand-picked profiles.
            </p>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 border border-border px-3 py-1.5 rounded-xl">
            Active Session: Secure Gateway
          </div>
        </div>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Total Accounts</span>
              <p className="text-2xl font-bold">{loading ? '...' : stats.total}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-500 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Match Search Queue</span>
              <p className="text-2xl font-bold text-amber-500">{loading ? '...' : stats.matchSearch}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Success Rate</span>
              <p className="text-2xl font-bold text-emerald-500">{loading ? '...' : `${stats.successRate}%`}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Verified Pools</span>
              <p className="text-2xl font-bold text-indigo-500">{loading ? '...' : stats.verified}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </section>

        {/* Filter Toolbar */}
        <section className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          
          {/* Search box */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Search by name, designation, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 hidden sm:inline">Status:</span>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as JourneyStatus | 'All')}
                  className="appearance-none pl-3 pr-8 py-2.5 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="New Lead">New Lead</option>
                  <option value="Profile Verified">Profile Verified</option>
                  <option value="Match Search">Match Search</option>
                  <option value="Match Sent">Match Sent</option>
                  <option value="Meeting Scheduled">Meeting Scheduled</option>
                  <option value="Active Discussion">Active Discussion</option>
                  <option value="Success">Success</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-3.5 h-3 w-3 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* Gender Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 hidden sm:inline">Gender:</span>
              <div className="relative">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
                >
                  <option value="All">Genders (All)</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-3.5 h-3 w-3 pointer-events-none text-slate-400" />
              </div>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
                >
                  <option value="lastUpdated">Last Action</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="age">Age (Youngest)</option>
                  <option value="completeness">Profile %</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-3.5 h-3 w-3 pointer-events-none text-slate-400" />
              </div>
            </div>

          </div>
        </section>

        {/* Customer Listing */}
        <section className="glass-panel rounded-2xl overflow-hidden shadow-xs border border-border">
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-slate-100/30 dark:bg-slate-900/40 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-4.5 px-6">Client Name</th>
                  <th className="py-4.5 px-4">Demographics</th>
                  <th className="py-4.5 px-4">Profession & Income</th>
                  <th className="py-4.5 px-4 text-center">Completeness</th>
                  <th className="py-4.5 px-4 text-center">Journey Status</th>
                  <th className="py-4.5 px-4 text-right">Last Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="h-8 w-8 text-primary animate-pulse" />
                        <span className="text-xs text-slate-400 font-semibold animate-pulse">
                          Syncing CRM Vault...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">
                      No accounts matched search filters.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => {
                    const completeness = getCompleteness(c);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => router.push(`/customer/${c.id}`)}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group"
                      >
                        {/* Name & ID */}
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 dark:bg-primary/5 text-primary group-hover:scale-105 transition-all">
                              <span className="text-xs font-bold uppercase">
                                {c.firstName[0]}{c.lastName[0]}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
                                {c.firstName} {c.lastName}
                                {c.journeyStatus === 'Success' && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" fill="currentColor" />
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {c.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Age, Gender, City */}
                        <td className="py-4.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="text-slate-800 dark:text-slate-200 font-medium">
                              {c.gender} • {c.age} yrs
                            </div>
                            <span className="text-xs text-slate-400">
                              {c.city}, IND
                            </span>
                          </div>
                        </td>

                        {/* Profession & LPA */}
                        <td className="py-4.5 px-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[180px]">
                              {c.profession.designation}
                            </div>
                            <span className="text-xs text-primary dark:text-rose-400 font-semibold">
                              ₹{c.profession.income} LPA
                            </span>
                          </div>
                        </td>

                        {/* Completeness Bar */}
                        <td className="py-4.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center justify-center gap-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {completeness}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${completeness}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Journey Status badge */}
                        <td className="py-4.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(c.journeyStatus)}`}>
                            {c.journeyStatus}
                          </span>
                        </td>

                        {/* Last Updated */}
                        <td className="py-4.5 px-4 text-right pr-6">
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                            {new Date(c.lastUpdated).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* Footer info */}
      <footer className="py-6 border-t border-border bg-white dark:bg-slate-900 mt-20 text-center text-xs text-slate-400">
        TDC Matchmaker CRM Portal • Version 1.0.0 • AI-Powered Compatibility Engine
      </footer>
    </div>
  );
}
