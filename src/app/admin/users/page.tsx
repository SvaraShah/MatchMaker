'use strict';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  ChevronDown,
  ArrowUpDown,
  UserCheck,
  Eye,
  Loader2,
  Filter
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Customer, JourneyStatus } from '@/types/matchmaker';

export default function AdminUsersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<JourneyStatus | 'All'>('All');
  const [gender, setGender] = useState<string>('All');
  const [sort, setSort] = useState<string>('lastUpdated');

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
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  }, [search, status, gender, sort]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const getStatusStyles = (st: JourneyStatus) => {
    switch (st) {
      case 'New Lead':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Profile Verified':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Match Search':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Client Registry & Profiles
            </h1>
            <p className="text-xs text-slate-500">Search, filter, and inspect registered matrimonial client portfolios.</p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-border">
            Total Profiles: {customers.length}
          </span>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-2xl space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search profiles by name, city, designation..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="appearance-none pl-3 pr-8 py-2.5 text-xs font-semibold rounded-xl border border-border bg-background cursor-pointer"
                >
                  <option value="All">All Journey Statuses</option>
                  <option value="New Lead">New Lead</option>
                  <option value="Profile Verified">Profile Verified</option>
                  <option value="Match Search">Match Search</option>
                  <option value="Match Sent">Match Sent</option>
                  <option value="Meeting Scheduled">Meeting Scheduled</option>
                  <option value="Active Discussion">Active Discussion</option>
                  <option value="Success">Success</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 text-xs font-semibold rounded-xl border border-border bg-background cursor-pointer"
                >
                  <option value="All">All Genders</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 text-xs font-semibold rounded-xl border border-border bg-background cursor-pointer"
                >
                  <option value="lastUpdated">Sort: Last Updated</option>
                  <option value="name">Sort: Name (A-Z)</option>
                  <option value="age">Sort: Age (Youngest)</option>
                </select>
                <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Loading profiles...</span>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl overflow-hidden shadow-xs border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-border text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Client Name</th>
                    <th className="p-4">Gender & Age</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Profession</th>
                    <th className="p-4">Background</th>
                    <th className="p-4">Journey Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {c.firstName} {c.lastName}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {c.gender} • {c.age} yrs
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {c.city}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {c.profession.designation} ({c.profession.income} LPA)
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {c.religion} ({c.caste})
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusStyles(c.journeyStatus)}`}>
                          {c.journeyStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => router.push(`/admin/customer/${c.id}`)}
                          className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
