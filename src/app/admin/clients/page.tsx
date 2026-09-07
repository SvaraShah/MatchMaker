'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import {
  Search,
  Filter,
  Grid,
  List,
  Heart,
  Eye,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { MOCK_PROFILES, MatrimonialProfile } from '@/lib/mockData';

export default function ClientsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [religionFilter, setReligionFilter] = useState<string>('All');
  const [jainSectFilter, setJainSectFilter] = useState<string>('All');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [maritalFilter, setMaritalFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredClients = useMemo(() => {
    return MOCK_PROFILES.filter(p => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.profession.designation.toLowerCase().includes(query) ||
        p.caste.toLowerCase().includes(query);

      // Filters
      const matchGender = genderFilter === 'All' || p.gender === genderFilter;
      const matchReligion = religionFilter === 'All' || p.religion === religionFilter;
      const matchJainSect = jainSectFilter === 'All' || p.jainSect === jainSectFilter;
      const matchCity = cityFilter === 'All' || p.city === cityFilter;
      const matchMarital = maritalFilter === 'All' || p.maritalStatus === maritalFilter;
      const matchStatus = statusFilter === 'All' || p.journeyStatus === statusFilter;

      return matchSearch && matchGender && matchReligion && matchJainSect && matchCity && matchMarital && matchStatus;
    });
  }, [searchQuery, genderFilter, religionFilter, jainSectFilter, cityFilter, maritalFilter, statusFilter]);

  return (
    <AdminLayout>
      
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            Client Directory 2.0
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage client portfolios, partner criteria, and matrimonial profiles ({filteredClients.length} Profiles)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid / Table Toggle */}
          <div className="bg-stone-100 p-1 rounded-xl border border-stone-200 flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === 'grid' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === 'table' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Control Center */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-4">
        
        {/* Top Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, city, occupation, caste..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-stone-900"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          
          {/* Gender */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Gender</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:border-rose-500"
            >
              <option value="All">All Genders</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>

          {/* Religion */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Religion</label>
            <select
              value={religionFilter}
              onChange={(e) => setReligionFilter(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:border-rose-500"
            >
              <option value="All">All Religions</option>
              <option value="Jain">Jain</option>
              <option value="Hindu">Hindu</option>
              <option value="Sikh">Sikh</option>
              <option value="Muslim">Muslim</option>
            </select>
          </div>

          {/* Jain Sect */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Jain Sect</label>
            <select
              value={jainSectFilter}
              onChange={(e) => setJainSectFilter(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:border-rose-500"
            >
              <option value="All">All Sects</option>
              <option value="Shwetambar">Shwetambar</option>
              <option value="Digambar">Digambar</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">City</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:border-rose-500"
            >
              <option value="All">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Jaipur">Jaipur</option>
            </select>
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Marital Status</label>
            <select
              value={maritalFilter}
              onChange={(e) => setMaritalFilter(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:border-rose-500"
            >
              <option value="All">All Marital Statuses</option>
              <option value="Never Married">Never Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>

          {/* Journey Status */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Stage</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-stone-200 bg-white font-medium text-stone-800 focus:outline-none focus:border-rose-500"
            >
              <option value="All">All Stages</option>
              <option value="Matching">Matching</option>
              <option value="Match Suggested">Match Suggested</option>
              <option value="Preferences Confirmed">Preferences Confirmed</option>
              <option value="Profile Verified">Profile Verified</option>
            </select>
          </div>

        </div>

      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Card Banner & Image */}
              <div className="relative h-52 w-full bg-stone-100">
                <img src={client.photoUrl} alt={client.firstName} className="h-full w-full object-cover" />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs text-white font-bold text-[10px]">
                  {client.profileCompletion}% Complete
                </div>
                {client.verified && (
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified Profile</span>
                  </div>
                )}
              </div>

              {/* Profile Overview */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-stone-900">
                      {client.firstName} {client.lastName}
                    </h3>
                    <span className="text-xs font-semibold text-rose-700">{client.gender}</span>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">
                    {client.age} yrs • {client.city}, {client.state}
                  </p>
                </div>

                {/* Attributes Summary */}
                <div className="text-xs space-y-1.5 text-stone-600 border-t border-stone-100 pt-2.5">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span className="truncate font-medium text-stone-800">{client.profession.designation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span className="truncate text-stone-600">{client.education.degree}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span className="truncate text-rose-700 font-semibold">
                      {client.religion} {client.jainSect ? `(${client.jainSect})` : ''} • {client.caste}
                    </span>
                  </div>
                </div>

                {/* Looking For snippet */}
                <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100 text-[11px] space-y-1">
                  <span className="font-bold text-stone-500 uppercase tracking-wider text-[9px] block">Looking For</span>
                  <p className="text-stone-700 leading-snug">
                    {client.preferences.preferredGender} ({client.preferences.ageMin}–{client.preferences.ageMax} yrs) in {client.preferences.locations.slice(0, 2).join(', ')}
                  </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                    className="w-full py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>360 Profile</span>
                  </button>
                  <button
                    onClick={() => router.push(`/admin/matches?client=${client.id}`)}
                    className="w-full py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Heart className="h-3.5 w-3.5" />
                    <span>Find Matches</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  <th className="p-3.5 font-bold">Client</th>
                  <th className="p-3.5 font-bold">Age / Gender</th>
                  <th className="p-3.5 font-bold">City</th>
                  <th className="p-3.5 font-bold">Occupation & Degree</th>
                  <th className="p-3.5 font-bold">Religion & Caste</th>
                  <th className="p-3.5 font-bold">Looking For</th>
                  <th className="p-3.5 font-bold">Stage</th>
                  <th className="p-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-stone-50/60 transition-all">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img src={client.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover border border-stone-200" />
                        <div>
                          <span className="font-bold text-stone-900 block">{client.firstName} {client.lastName}</span>
                          <span className="text-[10px] text-stone-400 font-medium">Income: ₹{client.profession.income} LPA</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-stone-800">{client.age} yrs • {client.gender}</td>
                    <td className="p-3.5 font-medium text-stone-700">{client.city}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-stone-900 block">{client.profession.designation}</span>
                      <span className="text-[11px] text-stone-500">{client.education.degree}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-rose-700 block">{client.religion} {client.jainSect ? `(${client.jainSect})` : ''}</span>
                      <span className="text-[11px] text-stone-500">{client.caste}</span>
                    </td>
                    <td className="p-3.5 max-w-[200px] truncate text-stone-600">
                      {client.preferences.preferredGender} ({client.preferences.ageMin}–{client.preferences.ageMax}) in {client.preferences.locations[0]}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-50 text-rose-800 border border-rose-200/50">
                        {client.journeyStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/clients/${client.id}`)}
                          className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => router.push(`/admin/matches?client=${client.id}`)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs cursor-pointer"
                        >
                          Match
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
