'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import {
  MOCK_PROFILES,
  MatrimonialProfile
} from '@/lib/mockData';
import {
  Heart,
  Search,
  CheckCircle2,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Calendar,
  DollarSign,
  UserCheck,
  Building,
  Home,
  Users,
  FileText,
  Clock,
  ArrowRight,
  Plus,
  Compass
} from 'lucide-react';

export default function ClientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params?.id as string;

  const client = MOCK_PROFILES.find(p => p.id === clientId) || MOCK_PROFILES[0];
  const [activeTab, setActiveTab] = useState<'overview' | 'preferences' | 'career' | 'family' | 'timeline' | 'notes'>('overview');

  // Quick note modal state
  const [newNoteContent, setNewNoteContent] = useState('');
  const [notesList, setNotesList] = useState(client.notes);

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    const noteObj = {
      id: `n-${Date.now()}`,
      author: 'Matchmaker Admin',
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString()
    };
    setNotesList([noteObj, ...notesList]);
    setNewNoteContent('');
  };

  const prefs = client.preferences;

  return (
    <AdminLayout>
      
      {/* Top Breadcrumb & Hero Card */}
      <div className="space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="hover:text-stone-900 cursor-pointer" onClick={() => router.push('/admin')}>Dashboard</span>
          <span>/</span>
          <span className="hover:text-stone-900 cursor-pointer" onClick={() => router.push('/admin/clients')}>Clients</span>
          <span>/</span>
          <span className="font-bold text-stone-900">{client.firstName} {client.lastName}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-5">
              {/* Photo Avatar */}
              <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-stone-100 shrink-0">
                <img src={client.photoUrl} alt={client.firstName} className="h-full w-full object-cover" />
                {client.verified && (
                  <div className="absolute top-1 right-1 p-1 bg-emerald-600 text-white rounded-full" title="Verified Profile">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>

              {/* Title & Key Attributes */}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                    {client.firstName} {client.lastName}
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/60">
                    {client.journeyStatus}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                  {client.age} years • {client.city}, {client.state} • {client.gender}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mt-2">
                  <span className="font-semibold text-rose-700">
                    {client.religion} {client.jainSect ? `(${client.jainSect})` : ''} • {client.caste}
                  </span>
                  <span>•</span>
                  <span>{client.profession.designation} at {client.profession.company}</span>
                  <span>•</span>
                  <span>{client.maritalStatus}</span>
                </div>
              </div>
            </div>

            {/* Primary Matchmaking Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={() => router.push(`/admin/matches?client=${client.id}`)}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-800 hover:from-rose-700 hover:to-rose-900 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Heart className="h-4 w-4 fill-white/20" />
                <span>Find Matches</span>
              </button>
              <button
                onClick={() => router.push(`/admin/matches?client=${client.id}&compare=true`)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Compass className="h-4 w-4 text-stone-600" />
                <span>Compare</span>
              </button>
            </div>

          </div>

          {/* Profile Completeness Bar */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <span>Profile Completeness: {client.profileCompletion}%</span>
            </div>
            <div className="h-2 flex-1 max-w-xs bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${client.profileCompletion}%` }} />
            </div>
          </div>

        </div>

        {/* HIGHLY VISIBLE "LOOKING FOR" PARTNER PREFERENCES BANNER (Correction 3) */}
        <div className="bg-gradient-to-br from-rose-900 via-stone-900 to-rose-950 text-white rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-rose-300" />
              <h2 className="font-serif font-bold text-lg text-white">Looking For (Partner Preferences)</h2>
            </div>
            <span className="text-xs font-semibold text-rose-200 px-3 py-1 rounded-full bg-white/10 border border-white/20">
              Preferred Partner: {prefs.preferredGender}
            </span>
          </div>

          {/* Detailed Preferences Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
            
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 block">Preferred Age</span>
              <p className="font-bold text-sm text-white">{prefs.ageMin} – {prefs.ageMax} yrs</p>
              <p className="text-[10px] text-stone-300">Client Age: {client.age} yrs</p>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 block">Target Gender</span>
              <p className="font-bold text-sm text-white">{prefs.preferredGender}</p>
              <p className="text-[10px] text-stone-300">Client Gender: {client.gender}</p>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 block">Locations</span>
              <p className="font-bold text-sm text-white truncate">{prefs.locations.join(', ')}</p>
              <p className="text-[10px] text-stone-300">Current: {client.city}</p>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 block">Jain / Religion</span>
              <p className="font-bold text-sm text-white truncate">{prefs.jainPreference || prefs.religions.join('/')}</p>
              <p className="text-[10px] text-stone-300">Sect: {prefs.jainSect || 'Any'}</p>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 block">Caste Preference</span>
              <p className="font-bold text-sm text-white truncate">{prefs.castes.join(', ')}</p>
              <p className="text-[10px] text-stone-300">Sub-caste: {prefs.subCaste || 'Open'}</p>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 block">Occupation</span>
              <p className="font-bold text-xs text-white leading-tight line-clamp-2">{prefs.preferredOccupation}</p>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 block">Education</span>
              <p className="font-bold text-xs text-white truncate">{prefs.preferredEducation}</p>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 block">Min Income</span>
              <p className="font-bold text-sm text-white">₹{prefs.preferredIncomeMin} LPA+</p>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 block">Height Range</span>
              <p className="font-bold text-sm text-white">{Math.round(prefs.heightMin / 30.48)}' to {Math.round(prefs.heightMax / 30.48)}' ({prefs.heightMin}–{prefs.heightMax}cm)</p>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 block">Marital Status</span>
              <p className="font-bold text-sm text-white">{prefs.preferredMaritalStatus}</p>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 block">Diet Preference</span>
              <p className="font-bold text-sm text-white">{prefs.preferredDiet}</p>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 block">Lifestyle</span>
              <p className="font-bold text-xs text-white">Non-Smoker / Non-Drinker</p>
            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 gap-6 text-xs font-semibold text-stone-500 overflow-x-auto">
          {[
            { key: 'overview', label: 'About & Overview' },
            { key: 'preferences', label: 'Partner Preferences (Full)' },
            { key: 'career', label: 'Education & Career' },
            { key: 'family', label: 'Family & Lifestyle' },
            { key: 'timeline', label: 'Activity Timeline' },
            { key: 'notes', label: `Matchmaker Notes (${notesList.length})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-b-2 border-rose-700 text-rose-900 font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Views */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs min-h-[300px]">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 mb-2">About {client.firstName}</h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">{client.aboutMe}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 text-xs">
                <div className="space-y-3">
                  <h4 className="font-bold text-stone-900 text-sm">Personal Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Date of Birth:</span>
                      <span className="font-semibold text-stone-800">{client.dob}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Height:</span>
                      <span className="font-semibold text-stone-800">{client.height} cm ({Math.floor(client.height / 30.48)}'{Math.round((client.height % 30.48) / 2.54)}")</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Mother Tongue:</span>
                      <span className="font-semibold text-stone-800">{client.motherTongue}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Languages Known:</span>
                      <span className="font-semibold text-stone-800">{client.languagesKnown.join(', ')}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Manglik Status:</span>
                      <span className="font-semibold text-stone-800">{client.manglik}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-stone-900 text-sm">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Email:</span>
                      <span className="font-semibold text-stone-800">{client.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Phone:</span>
                      <span className="font-semibold text-stone-800">{client.phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Location:</span>
                      <span className="font-semibold text-stone-800">{client.city}, {client.state}, {client.country}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Last Contacted:</span>
                      <span className="font-semibold text-stone-800">{new Date(client.lastContacted).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 mb-1">Partner Preference Breakdown</h3>
                <p className="text-xs text-stone-500">Criteria defined for candidate compatibility evaluation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
                  <span className="font-bold text-stone-900 text-sm block">Age & Gender</span>
                  <p><strong className="text-stone-700">Preferred Gender:</strong> {prefs.preferredGender}</p>
                  <p><strong className="text-stone-700">Age Range:</strong> {prefs.ageMin} to {prefs.ageMax} years</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
                  <span className="font-bold text-stone-900 text-sm block">Religious & Sect Criteria</span>
                  <p><strong className="text-stone-700">Religions:</strong> {prefs.religions.join(', ')}</p>
                  <p><strong className="text-stone-700">Jain Preference:</strong> {prefs.jainPreference || 'Open to both'}</p>
                  <p><strong className="text-stone-700">Jain Sect:</strong> {prefs.jainSect || 'Any'}</p>
                  <p><strong className="text-stone-700">Castes:</strong> {prefs.castes.join(', ')}</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
                  <span className="font-bold text-stone-900 text-sm block">Career & Financial</span>
                  <p><strong className="text-stone-700">Preferred Occupation:</strong> {prefs.preferredOccupation}</p>
                  <p><strong className="text-stone-700">Preferred Education:</strong> {prefs.preferredEducation}</p>
                  <p><strong className="text-stone-700">Min Income:</strong> ₹{prefs.preferredIncomeMin} LPA</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
                  <span className="font-bold text-stone-900 text-sm block">Lifestyle & Diet</span>
                  <p><strong className="text-stone-700">Diet:</strong> {prefs.preferredDiet}</p>
                  <p><strong className="text-stone-700">Marital Status:</strong> {prefs.preferredMaritalStatus}</p>
                  <p><strong className="text-stone-700">Height:</strong> {prefs.heightMin} cm – {prefs.heightMax} cm</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">Matchmaker Notes</h3>
                  <p className="text-xs text-stone-500">Internal notes & family discussion history</p>
                </div>
              </div>

              {/* Add Note Form */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Add a new matchmaker note regarding family preferences, calls, or shortlisted candidates..."
                  className="w-full p-3 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-stone-900 h-20 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {notesList.map((note) => (
                  <div key={note.id} className="p-4 rounded-2xl bg-white border border-stone-200/80 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span className="font-bold text-rose-800">{note.author}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-stone-700">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </AdminLayout>
  );
}
