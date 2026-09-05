'use strict';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Eye,
  Plus,
  Loader2,
  Calendar,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

export default function CustomerManagementPage() {
  const router = useRouter();

  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination state
  const [page, setPage] = useState(1);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkPayload, setBulkPayload] = useState<string>('');
  const [submittingBulk, setSubmittingBulk] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/customers?limit=100`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (genderFilter !== 'All') url += `&gender=${genderFilter}`;
      if (statusFilter !== 'All') url += `&status=${encodeURIComponent(statusFilter)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, genderFilter, statusFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Compute profile completeness score (0-100%)
  const calculateCompleteness = (client: any) => {
    let score = 50; // base profile fields
    if (client.photoUrl) score += 10;
    if (client.aboutMe) score += 10;
    if (client.preferences) score += 20;
    if (client.education?.degree) score += 5;
    if (client.profession?.designation) score += 5;
    return Math.min(100, score);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(clients.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExecuteBulkAction = async () => {
    if (selectedIds.length === 0 || !bulkAction || submittingBulk) return;
    setSubmittingBulk(true);

    try {
      let payloadObj: any = {};
      if (bulkAction === 'update_stage') payloadObj = { stage: bulkPayload };
      if (bulkAction === 'add_note') payloadObj = { content: bulkPayload };
      if (bulkAction === 'create_followup')
        payloadObj = {
          title: bulkPayload,
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          priority: 'medium',
        };

      const res = await fetch('/api/admin/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerIds: selectedIds,
          action: bulkAction,
          payload: payloadObj,
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert(`Successfully executed ${bulkAction} for ${json.affectedCount} clients.`);
        setSelectedIds([]);
        setBulkAction('');
        setBulkPayload('');
        fetchClients();
      } else {
        alert(json.error || 'Bulk operation failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingBulk(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Customer Management Directory 2.0
            </h1>
            <p className="text-xs text-slate-500">
              Complete client lifecycle registry with completeness scores, multi-filters & bulk operations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-border bg-background hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              {viewMode === 'table' ? 'Grid View' : 'Table View'}
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-border">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, city, designation, company..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5 text-primary" />
              <span className="font-bold">Gender:</span>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs cursor-pointer"
              >
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-bold">Stage:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs cursor-pointer"
              >
                <option value="All">All Stages</option>
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

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="glass-panel p-4 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-xs font-bold text-primary flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              {selectedIds.length} Clients Selected for Bulk Action
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-medium cursor-pointer"
              >
                <option value="">Select Bulk Action...</option>
                <option value="update_stage">Update Pipeline Stage</option>
                <option value="add_note">Add Matchmaker Note</option>
                <option value="create_followup">Schedule Task Follow-up</option>
              </select>

              {bulkAction === 'update_stage' && (
                <select
                  value={bulkPayload}
                  onChange={(e) => setBulkPayload(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-medium cursor-pointer"
                >
                  <option value="">Select Stage...</option>
                  <option value="New Lead">New Lead</option>
                  <option value="Profile Review">Profile Review</option>
                  <option value="Preferences Verified">Preferences Verified</option>
                  <option value="Match Search">Match Search</option>
                  <option value="Proposed">Proposed</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              )}

              {(bulkAction === 'add_note' || bulkAction === 'create_followup') && (
                <input
                  type="text"
                  value={bulkPayload}
                  onChange={(e) => setBulkPayload(e.target.value)}
                  placeholder={bulkAction === 'add_note' ? 'Enter note content...' : 'Enter task title...'}
                  className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs"
                />
              )}

              <button
                onClick={handleExecuteBulkAction}
                disabled={submittingBulk || !bulkAction}
                className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
              >
                {submittingBulk ? 'Executing...' : 'Apply Action'}
              </button>
            </div>
          </div>
        )}

        {/* Content Display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-slate-500 mt-2 font-medium">Loading customer directory records...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl space-y-3 border border-border">
            <Users className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Customer Records Found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or clearing filters.</p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="glass-panel rounded-3xl border border-border overflow-hidden shadow-xs">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-slate-800/70 border-b border-border text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === clients.length && clients.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-border text-primary cursor-pointer"
                      />
                    </th>
                    <th className="p-4">Client Profile</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Profession</th>
                    <th className="p-4">Completeness</th>
                    <th className="p-4">Pipeline Stage</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clients.map((client) => {
                    const isSelected = selectedIds.includes(client.id);
                    const completeness = calculateCompleteness(client);
                    return (
                      <tr
                        key={client.id}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-primary/5' : ''
                        }`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(client.id)}
                            className="rounded border-border text-primary cursor-pointer"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-rose-400 to-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {client.firstName.charAt(0)}
                            </div>
                            <div>
                              <span
                                onClick={() => router.push(`/admin/clients/${client.id}`)}
                                className="font-bold text-slate-950 dark:text-white hover:text-primary transition-colors cursor-pointer block"
                              >
                                {client.firstName} {client.lastName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {client.gender} • {client.age} yrs • {client.religion} ({client.caste})
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                          {client.city}, {client.country}
                        </td>
                        <td className="p-4 text-slate-700 dark:text-slate-300">
                          <span className="font-semibold block">{client.profession.designation}</span>
                          <span className="text-[10px] text-slate-400">{client.profession.company}</span>
                        </td>
                        <td className="p-4">
                          <div className="w-28 space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-500">Complete</span>
                              <span className={completeness >= 80 ? 'text-emerald-600' : 'text-amber-600'}>
                                {completeness}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  completeness >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${completeness}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-border">
                            {client.journeyStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => router.push(`/admin/clients/${client.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Dossier</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="sm:hidden divide-y divide-border">
              {clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => router.push(`/admin/clients/${client.id}`)}
                  className="p-4 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-rose-400 to-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {client.firstName[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {client.firstName} {client.lastName}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {client.gender} • {client.age} yrs • {client.city}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {client.journeyStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{client.profession?.designation}</span>
                    <span className="font-bold text-primary">View Dossier →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div
                key={client.id}
                onClick={() => router.push(`/admin/clients/${client.id}`)}
                className="glass-panel p-6 rounded-3xl space-y-4 border border-border hover:border-primary transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-rose-400 to-rose-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                      {client.firstName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-950 dark:text-white">
                        {client.firstName} {client.lastName}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {client.gender}, {client.age} yrs • {client.city}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-border">
                    {client.journeyStatus}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-border">
                  <p>
                    <strong>Profession:</strong> {client.profession.designation} ({client.profession.company})
                  </p>
                  <p>
                    <strong>Education:</strong> {client.education.degree} ({client.education.undergradCollege})
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">360° Dossier View</span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
