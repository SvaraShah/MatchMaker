'use strict';
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  Info,
  MapPin,
  MessageSquare,
  Phone,
  Printer,
  Sparkles,
  Calendar,
  User,
  Activity,
  Maximize2,
  Trash2,
  CheckCircle,
  FileText,
  Mail,
  Loader2,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Customer, MatchRecommendation, JourneyStatus } from '@/types/matchmaker';

export default function CustomerDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter();
  const { id: customerId } = use(params);

  // States
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recs' | 'timeline'>('recs');

  // Notes form state
  const [noteContent, setNoteContent] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Matchmaker Maya');
  const [noteStatusUpdate, setNoteStatusUpdate] = useState<JourneyStatus | ''>('');
  const [savingNote, setSavingNote] = useState(false);

  // Send Match Modal State
  const [selectedMatch, setSelectedMatch] = useState<MatchRecommendation | null>(null);
  const [sendingMatch, setSendingMatch] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Customer Profile
  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Load Recommendations
  const fetchRecommendations = async () => {
    setRecsLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/recommendations`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
    fetchRecommendations();
  }, [customerId]);

  // Toast trigger helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Update Status directly
  const handleStatusChange = async (newStatus: JourneyStatus) => {
    if (!customer) return;
    try {
      const res = await fetch(`/api/customers/${customer.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'System (Status Control)',
          content: `Updated client journey status to: ${newStatus}`,
          status: newStatus
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomer(updated);
        triggerToast(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  // Submit Note Form
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !customer) return;
    setNoteContent('');
    setSavingNote(true);

    try {
      const res = await fetch(`/api/customers/${customer.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: noteAuthor,
          content: noteContent,
          status: noteStatusUpdate || undefined
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setCustomer(updated);
        setNoteStatusUpdate('');
        triggerToast('Note successfully recorded to timeline.');
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  // Match Action (Save, Reject)
  const handleMatchAction = async (prospectId: string, actionStatus: 'saved' | 'rejected', recObj: MatchRecommendation) => {
    if (!customer) return;
    try {
      const res = await fetch('/api/matches/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          matchId: prospectId,
          status: actionStatus,
          score: recObj.score,
          aiExplanation: recObj.aiExplanation,
          aiIntroduction: recObj.aiIntroduction
        })
      });

      if (res.ok) {
        // Update state locally
        setRecommendations(prev =>
          prev.map(item =>
            item.profile.id === prospectId ? { ...item, status: actionStatus } : item
          )
        );
        triggerToast(`Match profile marked as ${actionStatus === 'saved' ? 'Saved' : 'Rejected'}.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send Match Action Confirm
  const handleSendMatchConfirm = async () => {
    if (!customer || !selectedMatch) return;
    setSendingMatch(true);

    try {
      const res = await fetch('/api/matches/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          matchId: selectedMatch.profile.id,
          status: 'sent',
          score: selectedMatch.score,
          aiExplanation: selectedMatch.aiExplanation,
          aiIntroduction: selectedMatch.aiIntroduction
        })
      });

      if (res.ok) {
        // Trigger Confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e11d48', '#fbbf24', '#34d399']
        });

        // Update local recommendations state
        setRecommendations(prev =>
          prev.map(item =>
            item.profile.id === selectedMatch.profile.id ? { ...item, status: 'sent' as const } : item
          )
        );

        // Fetch customer profile again to reload automated note and timeline updates
        fetchCustomer();

        triggerToast(`Match proposal sent successfully to ${customer.firstName}!`);
        setShowEmailPreview(false);
        setSelectedMatch(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMatch(false);
    }
  };

  // Print Window Trigger
  const handleExportPDF = () => {
    window.print();
  };

  // Badge styles
  const getStatusStyles = (status: JourneyStatus) => {
    switch (status) {
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

  // Profile Completeness
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

  if (loading || !customer) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading CRM Client File...</span>
        </div>
      </main>
    );
  }

  const completeness = getCompleteness(customer);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 glass-panel border border-emerald-200 dark:border-emerald-800 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-4 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Sub-Header Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-border py-4 px-4 sm:px-6 lg:px-8 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Registry
          </button>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {/* Status Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-border">
              <span className="text-xs text-slate-400 font-medium">Journey Status:</span>
              <select
                value={customer.journeyStatus}
                onChange={(e) => handleStatusChange(e.target.value as JourneyStatus)}
                className="text-xs font-bold bg-transparent border-none outline-none focus:ring-0 text-slate-800 dark:text-white cursor-pointer"
              >
                <option value="New Lead">New Lead</option>
                <option value="Profile Verified">Profile Verified</option>
                <option value="Match Search">Match Search</option>
                <option value="Match Sent">Match Sent</option>
                <option value="Meeting Scheduled">Meeting Scheduled</option>
                <option value="Active Discussion">Active Discussion</option>
                <option value="Success">Success</option>
              </select>
            </div>

            {/* Export PDF */}
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer transition-all"
            >
              <Printer className="h-4 w-4" />
              Export Match Report
            </button>
          </div>
        </div>
      </div>

      {/* 2. Client Profile Header Banner */}
      <section className="bg-white dark:bg-slate-900 border-b border-border py-8 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4.5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-primary/5 text-primary border border-rose-100 dark:border-primary/10">
              <span className="text-2xl font-black uppercase">
                {customer.firstName[0]}{customer.lastName[0]}
              </span>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                {customer.firstName} {customer.lastName}
                <span className={`text-xs px-2.5 py-1 font-bold rounded-full border ${getStatusStyles(customer.journeyStatus)}`}>
                  {customer.journeyStatus}
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {customer.city}, {customer.country}
                </span>
                <span>•</span>
                <span>{customer.gender}</span>
                <span>•</span>
                <span>{customer.age} years old</span>
                <span>•</span>
                <span className="text-primary dark:text-rose-400 font-semibold">₹{customer.profession.income} LPA</span>
              </div>
            </div>
          </div>

          {/* Profile Completeness card */}
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-3.5 shadow-xs shrink-0 w-full md:w-auto">
            <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90">
                <circle
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="transparent"
                  r="20"
                  cx="24"
                  cy="24"
                />
                <circle
                  className="text-primary"
                  strokeWidth="3.5"
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 - (125.6 * completeness) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="20"
                  cx="24"
                  cy="24"
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-800 dark:text-white">
                {completeness}%
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Completeness</p>
              <p className="text-[10px] text-slate-400">CRM Biodata records filled</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Split Panel Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Detailed Biodata */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
            <User className="h-4 w-4" /> Client Biodata Dossier
          </h2>

          {/* Contact Details Card */}
          <div className="glass-panel p-5 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-border pb-2">
              Contact Details
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="h-4 w-4 text-slate-400" />
                <a href={`mailto:${customer.email}`} className="hover:underline hover:text-primary">{customer.email}</a>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="h-4 w-4 text-slate-400" />
                <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone}</a>
              </div>
            </div>
          </div>

          {/* Personal Info Card */}
          <div className="glass-panel p-5 rounded-2xl space-y-3.5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-border pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {new Date(customer.dob).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Height</span>
                <span className="font-semibold text-slate-800 dark:text-white">{customer.height} cm</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Religion / Caste</span>
                <span className="font-semibold text-slate-800 dark:text-white">{customer.religion} ({customer.caste})</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Mother Tongue</span>
                <span className="font-semibold text-slate-800 dark:text-white">{customer.motherTongue}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Languages Spoken</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {customer.languagesKnown.map(lang => (
                    <span key={lang} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-border rounded-md text-[10px] font-medium text-slate-600 dark:text-slate-300">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Professional & Education Card */}
          <div className="glass-panel p-5 rounded-2xl space-y-3.5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-border pb-2 flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-slate-400" /> Education & Career
            </h3>
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Undergrad Institution</span>
                <span className="font-semibold text-slate-800 dark:text-white block">{customer.education.undergradCollege}</span>
                <span className="text-slate-400 text-[10px]">{customer.education.degree}</span>
              </div>
              {customer.education.postgradDegree && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Postgrad Degree</span>
                  <span className="font-semibold text-slate-800 dark:text-white block">
                    {customer.education.postgradDegree}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-3 mt-3 space-y-2">
                <div>
                  <span className="text-slate-400 block mb-0.5">Current Profession</span>
                  <span className="font-semibold text-slate-800 dark:text-white block">{customer.profession.designation}</span>
                  <span className="text-slate-400 text-[10px]">{customer.profession.company} • {customer.profession.industry}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Annual Income</span>
                  <span className="font-bold text-primary dark:text-rose-400 text-sm">₹{customer.profession.income} LPA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Family & Lifestyle Card */}
          <div className="glass-panel p-5 rounded-2xl space-y-3.5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-border pb-2 flex items-center gap-1.5">
              <Home className="h-4 w-4 text-slate-400" /> Family & Lifestyle
            </h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Family Structure</span>
                <span className="font-semibold text-slate-800 dark:text-white">{customer.family.familyType} Family</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Siblings</span>
                <span className="font-semibold text-slate-800 dark:text-white">{customer.family.siblings} sibling(s)</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Parents Occupation</span>
                <span className="font-semibold text-slate-800 dark:text-white">{customer.family.parentsOccupation}</span>
              </div>
              <div className="col-span-2 border-t border-border pt-3 mt-3 grid grid-cols-2 gap-y-3 gap-x-2">
                <div>
                  <span className="text-slate-400 block mb-0.5">Diet</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{customer.lifestyle.diet}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Open To Pets</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{customer.lifestyle.openToPets ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Smoking</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{customer.lifestyle.smoking}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Drinking</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{customer.lifestyle.drinking}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="glass-panel p-5 rounded-2xl space-y-3.5 shadow-xs border border-primary/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary dark:text-rose-400 border-b border-border pb-2">
              Marriage Preferences
            </h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Age Range</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {customer.preferences.ageMin} - {customer.preferences.ageMax} yrs
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Relocate Willingness</span>
                <span className="font-semibold text-slate-800 dark:text-white">{customer.preferences.openToRelocate}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Horoscope Req.</span>
                <span className="font-semibold text-slate-800 dark:text-white">{customer.preferences.horoscopeRequired ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Manglik Status</span>
                <span className="font-semibold text-slate-800 dark:text-white">{customer.preferences.manglikStatus}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Preferred Locations</span>
                <span className="font-semibold text-slate-800 dark:text-white block">
                  {customer.preferences.locations.join(', ')}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Preferred Religions</span>
                <span className="font-semibold text-slate-800 dark:text-white block">
                  {customer.preferences.religions.join(', ')}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5">Preferred Castes</span>
                <span className="font-semibold text-slate-800 dark:text-white block">
                  {customer.preferences.castes.join(', ')}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Work Area (AI Matches and Timeline Notes) */}
        <div className="lg:col-span-2 space-y-6 no-print">
          
          {/* Work Area Tabs Header */}
          <div className="flex border-b border-border gap-4">
            <button
              onClick={() => setActiveTab('recs')}
              className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'recs'
                  ? 'border-primary text-primary dark:text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-4.5 w-4.5" />
              AI Match Recommendations
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'border-primary text-primary dark:text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Activity className="h-4.5 w-4.5" />
              Notes & Activity Timeline ({customer.notes.length + customer.timeline.length})
            </button>
          </div>

          {/* TAB CONTENT: RECOMMENDATIONS */}
          {activeTab === 'recs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI-Scored Matching Pool</h3>
                  <p className="text-xs text-slate-400">Top 10 candidates sorted by compatibility logic</p>
                </div>
                <button
                  onClick={fetchRecommendations}
                  disabled={recsLoading}
                  className="text-xs font-semibold text-primary dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  {recsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  Refresh Matches
                </button>
              </div>

              {recsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <span className="text-xs font-medium text-slate-400 animate-pulse">Running compatibility heuristics and queries...</span>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="glass-panel p-10 text-center text-xs text-slate-400">
                  No compatible matches found. Verify customer preference criteria bounds.
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => {
                    const match = rec.profile;
                    const isRejected = rec.status === 'rejected';
                    const isSaved = rec.status === 'saved';
                    const isSent = rec.status === 'sent';

                    return (
                      <div
                        key={match.id}
                        className={`glass-panel rounded-2xl p-5 border transition-all duration-300 relative flex flex-col gap-4.5 ${
                          isRejected 
                            ? 'opacity-40 border-slate-200 dark:border-slate-800 scale-[0.99]' 
                            : isSent 
                            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-500/[0.02]'
                            : isSaved
                            ? 'border-amber-300 dark:border-amber-800 bg-amber-500/[0.02]'
                            : 'border-border hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {/* Upper Section (Score and core match info) */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5">
                            {/* Dummy Profile Photo Placeholder */}
                            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center shrink-0 border border-border">
                              <span className="text-xs font-black text-slate-400 uppercase">
                                {match.firstName[0]}{match.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                {match.firstName} {match.lastName}
                                {isSent && (
                                  <span className="text-[9px] px-2 py-0.5 font-bold uppercase rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    Proposal Sent
                                  </span>
                                )}
                                {isSaved && (
                                  <span className="text-[9px] px-2 py-0.5 font-bold uppercase rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    Saved Match
                                  </span>
                                )}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {match.age} yrs • {match.city} • {match.religion} ({match.caste})
                              </p>
                              <p className="text-xs text-slate-400 font-semibold truncate max-w-[280px]">
                                {match.profession.designation} ({match.profession.company}) • ₹{match.profession.income} LPA
                              </p>
                            </div>
                          </div>

                          {/* Compatibility Score with Tooltip breakdown */}
                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            
                            {/* Hoverable Breakdown */}
                            <div className="group relative">
                              <div className="flex items-center gap-1.5 cursor-help px-2.5 py-1.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">
                                <Info className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-[10px] text-slate-400 font-medium">Breakdown</span>
                              </div>
                              
                              {/* Hover tooltip panel */}
                              <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-50 w-56 p-4 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-lg text-[10px] space-y-1.5 font-medium">
                                <p className="font-bold text-xs uppercase border-b border-border pb-1 mb-2">Metrics Weight</p>
                                <div className="flex justify-between"><span>Age Match (15)</span><span className="font-bold text-slate-700 dark:text-slate-300">{rec.scoreBreakdown.age}/15</span></div>
                                <div className="flex justify-between"><span>Education Match (15)</span><span className="font-bold text-slate-700 dark:text-slate-300">{rec.scoreBreakdown.education}/15</span></div>
                                <div className="flex justify-between"><span>Career Stability (15)</span><span className="font-bold text-slate-700 dark:text-slate-300">{rec.scoreBreakdown.career}/15</span></div>
                                <div className="flex justify-between"><span>Religion & Caste (15)</span><span className="font-bold text-slate-700 dark:text-slate-300">{rec.scoreBreakdown.religion}/15</span></div>
                                <div className="flex justify-between"><span>Family Structure (10)</span><span className="font-bold text-slate-700 dark:text-slate-300">{rec.scoreBreakdown.family}/10</span></div>
                                <div className="flex justify-between"><span>Lifestyle Diet (10)</span><span className="font-bold text-slate-700 dark:text-slate-300">{rec.scoreBreakdown.lifestyle}/10</span></div>
                                <div className="flex justify-between"><span>Relocation open (10)</span><span className="font-bold text-slate-700 dark:text-slate-300">{rec.scoreBreakdown.relocation}/10</span></div>
                                <div className="flex justify-between"><span>Children preference (10)</span><span className="font-bold text-slate-700 dark:text-slate-300">{rec.scoreBreakdown.children}/10</span></div>
                              </div>
                            </div>

                            {/* Main Score Ring / Text */}
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Score</span>
                              <span className="text-2xl font-black text-primary dark:text-rose-400 tracking-tight">
                                {rec.score}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mid Section - AI Explanation */}
                        {!isRejected && (
                          <div className="bg-slate-100/40 dark:bg-slate-900/40 border border-border p-4 rounded-xl space-y-1.5">
                            <span className="text-[10px] font-bold text-primary dark:text-rose-400 uppercase tracking-widest flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5 fill-current" /> AI Compatibility Insight
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                              "{rec.aiExplanation}"
                            </p>
                          </div>
                        )}

                        {/* Lower Section (Action Buttons) */}
                        <div className="flex items-center justify-between border-t border-border pt-4 gap-3">
                          {/* Reject Match */}
                          <button
                            onClick={() => handleMatchAction(match.id, 'rejected', rec)}
                            disabled={isRejected}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer ${
                              isRejected ? 'text-slate-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            title="Reject Match"
                          >
                            <X className="h-4 w-4" />
                            {isRejected ? 'Rejected' : 'Reject'}
                          </button>

                          <div className="flex items-center gap-3">
                            {/* Save Match */}
                            <button
                              onClick={() => handleMatchAction(match.id, 'saved', rec)}
                              disabled={isSaved || isSent}
                              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                isSaved
                                  ? 'bg-amber-500/10 border-amber-300 text-amber-700 dark:text-amber-300'
                                  : 'bg-background border-border text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                              }`}
                            >
                              <Check className="h-4 w-4" />
                              {isSaved ? 'Saved' : 'Save Match'}
                            </button>

                            {/* Send Match (Triggers preview modal) */}
                            <button
                              onClick={() => {
                                setSelectedMatch(rec);
                                setShowEmailPreview(false);
                              }}
                              disabled={isSent}
                              className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
                                isSent
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 cursor-not-allowed'
                                  : 'bg-primary hover:bg-primary/95 text-white shadow-primary/10 active:scale-[0.98]'
                              }`}
                            >
                              <Mail className="h-4 w-4" />
                              {isSent ? 'Sent' : 'Send Match'}
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: TIMELINE & NOTES */}
          {activeTab === 'timeline' && (
            <div className="space-y-8">
              
              {/* Notes submission form */}
              <div className="glass-panel p-5 rounded-2xl border border-border space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Interaction Note</h3>
                <form onSubmit={handleAddNote} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Author (Matchmaker)
                      </label>
                      <input
                        type="text"
                        value={noteAuthor}
                        onChange={(e) => setNoteAuthor(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Select Journey Status Update
                      </label>
                      <select
                        value={noteStatusUpdate}
                        onChange={(e) => setNoteStatusUpdate(e.target.value as JourneyStatus | '')}
                        className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-slate-700 dark:text-slate-300"
                      >
                        <option value="">No Status Change</option>
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

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Note Details / Conversation Summary
                    </label>
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="e.g., Conducted phone screen. Customer is willing to relocate to Bangalore but insists on a nuclear family setup..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingNote || !noteContent.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary/95 disabled:opacity-50 cursor-pointer transition-all ml-auto"
                  >
                    {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Save Event Log
                  </button>
                </form>
              </div>

              {/* CRM Activity Timeline */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer History Log</h3>
                
                <div className="relative border-l-2 border-border pl-6 ml-3.5 space-y-6">
                  {customer.timeline.map((evt) => {
                    
                    // Pick icons based on event type
                    let iconBg = 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
                    let icon = <Info className="h-3.5 w-3.5" />;
                    
                    if (evt.type === 'lead_created') {
                      iconBg = 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900';
                      icon = <User className="h-3.5 w-3.5" />;
                    } else if (evt.type === 'profile_verified') {
                      iconBg = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900';
                      icon = <Check className="h-3.5 w-3.5" />;
                    } else if (evt.type === 'match_sent') {
                      iconBg = 'bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300 border border-pink-200 dark:border-pink-900';
                      icon = <Mail className="h-3.5 w-3.5" />;
                    } else if (evt.type === 'meeting_scheduled') {
                      iconBg = 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200 dark:border-violet-900';
                      icon = <Calendar className="h-3.5 w-3.5" />;
                    } else if (evt.type === 'call_completed') {
                      iconBg = 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900';
                      icon = <Phone className="h-3.5 w-3.5" />;
                    } else if (evt.type === 'success') {
                      iconBg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900';
                      icon = <Heart className="h-3.5 w-3.5" fill="currentColor" />;
                    } else if (evt.type === 'note_added') {
                      iconBg = 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300 border border-border';
                      icon = <MessageSquare className="h-3.5 w-3.5" />;
                    }

                    return (
                      <div key={evt.id} className="relative group">
                        
                        {/* Bullet Icon */}
                        <div className={`absolute -left-10 top-0.5 flex h-7 w-7 items-center justify-center rounded-full ${iconBg} shadow-xs`}>
                          {icon}
                        </div>

                        {/* Title and Date */}
                        <div className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <h4 className="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">
                              {evt.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              {new Date(evt.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                            {evt.description}
                          </p>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

      {/* 4. Send Match Proposal Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4.5 w-4.5" fill="currentColor" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Send Match Proposal</h3>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Proposal summary panel */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-border">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Candidate: {selectedMatch.profile.firstName} {selectedMatch.profile.lastName}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedMatch.profile.age} yrs • {selectedMatch.profile.city} • {selectedMatch.profile.profession.designation}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Compatibility</span>
                  <span className="font-black text-xl text-primary">{selectedMatch.score}%</span>
                </div>
              </div>

              {/* Toggle switch for preview modes */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setShowEmailPreview(false)}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    !showEmailPreview
                      ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  AI Matchmaker pitch
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailPreview(true)}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    showEmailPreview
                      ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  Email Draft Preview
                </button>
              </div>

              {/* Content Panel based on toggle state */}
              {!showEmailPreview ? (
                <div className="space-y-2.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Personalized Client Introduction (Written by AI)
                  </label>
                  <div className="p-4 border border-border bg-slate-50 dark:bg-slate-950/30 rounded-xl leading-relaxed text-xs text-slate-600 dark:text-slate-300 min-h-[100px] italic">
                    "{selectedMatch.aiIntroduction}"
                  </div>
                  <p className="text-[10px] text-slate-400">
                    This message will be injected directly as the opening hook of the matchmaker proposal template.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border border-border rounded-2xl overflow-hidden text-xs">
                    
                    {/* Mock Mail Headers */}
                    <div className="bg-slate-100/60 dark:bg-slate-900/40 p-3 border-b border-border space-y-1 text-slate-400 font-medium">
                      <div><strong className="text-slate-600 dark:text-slate-300">From:</strong> matchmaker@tdc.com (TDC Elite Matchmaking)</div>
                      <div><strong className="text-slate-600 dark:text-slate-300">To:</strong> {customer.email}</div>
                      <div><strong className="text-slate-600 dark:text-slate-300">Subject:</strong> A Premium Matchmaker Recommendation: {selectedMatch.profile.firstName}</div>
                    </div>
                    
                    {/* Mock Mail Body */}
                    <div className="p-4 bg-white dark:bg-slate-950 font-sans text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed">
                      <p>Dear {customer.firstName},</p>
                      
                      <p>{selectedMatch.aiIntroduction}</p>
                      
                      <p>
                        Based on your profile, {selectedMatch.profile.firstName} is a highly compatible partner choice. Both of you reside in {customer.city === selectedMatch.profile.city ? customer.city : 'top tier metropolitan centers'} and share complementary values regarding family structures ({selectedMatch.profile.family.familyType.toLowerCase()} family setup) and lifestyles.
                      </p>
                      
                      <p>
                        <strong>Profile Highlights:</strong><br />
                        • Education: {selectedMatch.profile.education.degree} ({selectedMatch.profile.education.undergradCollege})<br />
                        • Designation: {selectedMatch.profile.profession.designation} ({selectedMatch.profile.profession.company})<br />
                        • Height & Diet: {selectedMatch.profile.height} cm • {selectedMatch.profile.lifestyle.diet}
                      </p>

                      <p>
                        Please let us know if you would like us to coordinate an introductory Zoom call or share their detailed contact information.
                      </p>

                      <p>
                        Warm regards,<br />
                        <strong>Maya</strong><br />
                        Senior Matchmaking Architect, TDC Elite
                      </p>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="px-4.5 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendMatchConfirm}
                disabled={sendingMatch}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/10 hover:bg-primary/95 disabled:opacity-75 cursor-pointer transition-all"
              >
                {sendingMatch ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Confirm & Send Email
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. Printable Offline Dossier view (used for window.print() exports) */}
      <div className="hidden print:block font-serif text-black p-8 space-y-8">
        <div className="border-b-4 border-black pb-4 text-center">
          <h1 className="text-3xl font-black uppercase tracking-widest">TDC Elite Matchmaking Services</h1>
          <p className="text-sm italic">Confidential Client Dossier & AI Compatibility Assessment</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong>Primary Account Client:</strong> {customer.firstName} {customer.lastName}</div>
          <div><strong>Registration Date:</strong> {new Date(customer.timeline[0].createdAt).toLocaleDateString()}</div>
          <div><strong>Gender & Age:</strong> {customer.gender} • {customer.age} years old</div>
          <div><strong>City & Region:</strong> {customer.city}, India</div>
          <div><strong>Religion & Caste:</strong> {customer.religion} ({customer.caste})</div>
          <div><strong>LPA Bracket:</strong> ₹{customer.profession.income} LPA</div>
        </div>

        <div className="border-t border-black pt-6">
          <h2 className="text-xl font-bold uppercase mb-3">Academic & Career Background</h2>
          <p className="text-sm">
            The client holds a {customer.education.degree} degree from {customer.education.undergradCollege}.
            {customer.education.postgradDegree ? ` Additionally, they hold a postgraduate degree in ${customer.education.postgradDegree}.` : ''} 
            Currently, they operate as a {customer.profession.designation} within the {customer.profession.industry} sector at {customer.profession.company}.
          </p>
        </div>

        <div className="border-t border-black pt-6">
          <h2 className="text-xl font-bold uppercase mb-3">Lifestyle Details</h2>
          <p className="text-sm">
            Living in a {customer.family.familyType.toLowerCase()} family arrangement. Identifies as a {customer.lifestyle.diet.toLowerCase()} on diet guidelines.
            In regards to habits: Smoking status is "{customer.lifestyle.smoking}" and social drinking habits is "{customer.lifestyle.drinking}".
          </p>
        </div>

        <div className="border-t border-black pt-6">
          <h2 className="text-xl font-bold uppercase mb-3">Marriage Partner Preference Guidelines</h2>
          <p className="text-sm">
            Searching for a partner within the age boundary of {customer.preferences.ageMin} and {customer.preferences.ageMax}.
            Preferred locations for the match are: {customer.preferences.locations.join(', ')}.
            Preferred religions: {customer.preferences.religions.join(', ')}. Preferred castes: {customer.preferences.castes.join(', ')}.
            Willingness to relocate: "{customer.preferences.openToRelocate}". Horoscope matches: {customer.preferences.horoscopeRequired ? 'Required' : 'Not required'}.
          </p>
        </div>

        <div className="border-t border-black pt-6">
          <h2 className="text-xl font-bold uppercase mb-3">Activity & Notes Timeline</h2>
          <div className="space-y-2 text-xs">
            {customer.timeline.map((evt) => (
              <div key={evt.id}>
                <strong>[{new Date(evt.createdAt).toLocaleDateString()}] {evt.title}:</strong> {evt.description}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-black pt-4 text-[10px] text-center text-slate-500 italic mt-20">
          This document contains highly confidential biodata. Unauthorized circulation is prohibited. © TDC Elite.
        </div>
      </div>

    </div>
  );
}
