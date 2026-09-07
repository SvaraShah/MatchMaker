'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { MOCK_PROFILES, MatrimonialProfile } from '@/lib/mockData';
import {
  Kanban,
  Search,
  Eye,
  Heart,
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const PIPELINE_STAGES: MatrimonialProfile['journeyStatus'][] = [
  'New Lead',
  'Profile Pending',
  'Profile Verified',
  'Preferences Confirmed',
  'Matching',
  'Match Suggested',
  'Interest Sent',
  'Connection',
  'Closed'
];

export default function PipelinePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<MatrimonialProfile[]>(MOCK_PROFILES);
  const [searchQuery, setSearchQuery] = useState('');

  const handleStageChange = (profileId: string, newStage: MatrimonialProfile['journeyStatus']) => {
    setProfiles(prev =>
      prev.map(p => (p.id === profileId ? { ...p, journeyStatus: newStage } : p))
    );
  };

  const filtered = profiles.filter(p =>
    p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Kanban Matchmaking Pipeline
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Track clients across 9 matrimonial conversion stages
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pipeline cards..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-stone-900"
          />
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
        {PIPELINE_STAGES.map((stage) => {
          const stageClients = filtered.filter(p => p.journeyStatus === stage);
          return (
            <div
              key={stage}
              className="w-72 shrink-0 bg-stone-100/70 border border-stone-200/80 rounded-2xl p-3.5 flex flex-col space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <span className="font-serif font-bold text-xs text-stone-900">{stage}</span>
                <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold">
                  {stageClients.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 min-h-[350px]">
                {stageClients.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-stone-400 border border-dashed border-stone-200 rounded-xl bg-white/50">
                    No clients in this stage
                  </div>
                ) : (
                  stageClients.map((client) => (
                    <div
                      key={client.id}
                      className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-2xs space-y-3 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img src={client.photoUrl} alt="" className="h-10 w-10 rounded-full object-cover border border-stone-200 shrink-0" />
                        <div className="min-w-0">
                          <h4
                            onClick={() => router.push(`/admin/clients/${client.id}`)}
                            className="font-bold text-xs text-stone-900 truncate hover:text-rose-700 cursor-pointer"
                          >
                            {client.firstName} {client.lastName}
                          </h4>
                          <p className="text-[10px] text-stone-500 font-medium">
                            {client.age} yrs • {client.city}
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] space-y-0.5 text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-100">
                        <p className="font-semibold text-stone-800 truncate">{client.profession.designation}</p>
                        <p className="text-[10px] text-rose-700 font-medium truncate">{client.religion} ({client.caste})</p>
                      </div>

                      {/* Stage Selector */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">Move Stage</label>
                        <select
                          value={client.journeyStatus}
                          onChange={(e) => handleStageChange(client.id, e.target.value as any)}
                          className="w-full text-[10px] py-1 px-2 rounded-lg border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:border-rose-500 cursor-pointer"
                        >
                          {PIPELINE_STAGES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                        <button
                          onClick={() => router.push(`/admin/clients/${client.id}`)}
                          className="flex-1 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-[10px] font-semibold text-stone-700 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Dossier</span>
                        </button>
                        <button
                          onClick={() => router.push(`/admin/matches?client=${client.id}`)}
                          className="flex-1 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-[10px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Heart className="h-3 w-3" />
                          <span>Match</span>
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

    </AdminLayout>
  );
}
