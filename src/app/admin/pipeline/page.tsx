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
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Clock,
  Inbox
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
    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.caste.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            Kanban Matchmaking Pipeline
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Track client journeys across 9 matrimonial conversion stages
          </p>
        </div>

        {/* Global Pipeline Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pipeline cards by name, city, caste..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-stone-900 shadow-2xs placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Controlled Horizontal Scroll Kanban Board Wrapper */}
      <div className="w-full max-w-full overflow-x-auto pb-6 pt-1 select-none">
        
        <div className="flex gap-4 min-w-max">
          {PIPELINE_STAGES.map((stage) => {
            const stageClients = filtered.filter(p => p.journeyStatus === stage);
            
            return (
              <div
                key={stage}
                className="w-80 shrink-0 bg-stone-100/80 border border-stone-200/80 rounded-2xl p-4 flex flex-col space-y-3.5"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 pb-2 border-b border-stone-200/60">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-600"></span>
                    <span className="font-serif font-bold text-xs text-stone-900 tracking-tight">{stage}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold">
                    {stageClients.length}
                  </span>
                </div>

                {/* Column Cards Container */}
                <div className="space-y-3.5 min-h-[420px]">
                  {stageClients.length === 0 ? (
                    
                    /* Refined Empty State */
                    <div className="p-6 text-center space-y-2 border border-dashed border-stone-200/80 rounded-2xl bg-white/40 my-auto">
                      <Inbox className="h-6 w-6 text-stone-400 mx-auto stroke-[1.5]" />
                      <p className="font-bold text-xs text-stone-700">No clients here yet</p>
                      <p className="text-[11px] text-stone-400 leading-snug">
                        Clients will appear here as their matchmaking journey progresses.
                      </p>
                    </div>

                  ) : (

                    /* Matrimonial Client Cards */
                    stageClients.map((client) => (
                      <div
                        key={client.id}
                        className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs hover:shadow-md transition-all space-y-3"
                      >
                        {/* 1. Profile Header: Photo + Name + Age + City */}
                        <div className="flex items-center gap-3">
                          <img
                            src={client.photoUrl}
                            alt=""
                            className="h-11 w-11 rounded-full object-cover border-2 border-stone-100 shadow-2xs shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4
                              onClick={() => router.push(`/admin/clients/${client.id}`)}
                              className="font-bold text-sm text-stone-900 truncate hover:text-rose-700 cursor-pointer leading-tight"
                            >
                              {client.firstName} {client.lastName}
                            </h4>
                            <p className="text-xs text-stone-500 font-medium mt-0.5">
                              {client.age} yrs • {client.city}
                            </p>
                          </div>
                        </div>

                        {/* 2. Career: Occupation + Education */}
                        <div className="text-xs space-y-1 text-stone-700 bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
                          <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                            <Briefcase className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">{client.profession.designation}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                            <GraduationCap className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">{client.education.degree}</span>
                          </div>
                        </div>

                        {/* 3. Faith & Caste */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-rose-800">
                            {client.religion} {client.jainSect ? `(${client.jainSect})` : ''}
                          </span>
                          <span className="text-stone-500 font-medium">{client.caste}</span>
                        </div>

                        {/* 4. Small Metadata Row: Profile Completion + Verified */}
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px]">
                          <span className="text-stone-500 font-medium">
                            {client.profileCompletion}% Complete
                          </span>
                          {client.verified ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="text-stone-400">Unverified</span>
                          )}
                        </div>

                        {/* 5. Matchmaking Insight & Next Follow-up */}
                        <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-rose-900 font-bold">
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5 text-rose-600" />
                              <span>8 Strong Matches</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-stone-500 font-medium">
                            <Clock className="h-3 w-3 text-stone-400" />
                            <span>Next: Today, 4:00 PM</span>
                          </div>
                        </div>

                        {/* 6. Stage Selector Dropdown */}
                        <div className="space-y-1 pt-1">
                          <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                            Stage Status
                          </label>
                          <select
                            value={client.journeyStatus}
                            onChange={(e) => handleStageChange(client.id, e.target.value as any)}
                            className="w-full text-xs py-1.5 px-2.5 rounded-xl border border-stone-200 bg-stone-50 font-semibold text-stone-800 focus:outline-none focus:border-rose-500 cursor-pointer"
                          >
                            {PIPELINE_STAGES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        {/* 7. Action Button Hierarchy (Primary: Find Matches, Secondary: View Dossier) */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                          {/* Secondary: View Dossier (Outline / Ghost) */}
                          <button
                            onClick={() => router.push(`/admin/clients/${client.id}`)}
                            className="w-full py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-stone-500" />
                            <span>View Dossier</span>
                          </button>

                          {/* Primary: Find Matches (Rose / Burgundy filled) */}
                          <button
                            onClick={() => router.push(`/admin/matches?client=${client.id}`)}
                            className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-700 to-rose-800 hover:from-rose-800 hover:to-rose-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          >
                            <Heart className="h-3.5 w-3.5 fill-white/20" />
                            <span>Find Matches</span>
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

      </div>

    </AdminLayout>
  );
}
