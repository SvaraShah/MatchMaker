'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { MOCK_PROFILES } from '@/lib/mockData';
import { getRankedMatches, CompatibilityResult } from '@/lib/deterministicMatcher';
import {
  Heart,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowRightLeft,
  X
} from 'lucide-react';

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('client') || 'client-1';
  const showCompareInitial = searchParams.get('compare') === 'true';

  // Active Target Client
  const client = useMemo(() => {
    return MOCK_PROFILES.find(p => p.id === clientId) || MOCK_PROFILES[0];
  }, [clientId]);

  // Ranked Candidate Recommendations (Gender pre-filtered inside getRankedMatches)
  const candidateMatches = useMemo(() => {
    return getRankedMatches(client, MOCK_PROFILES);
  }, [client]);

  // Compare Modal / State
  const [selectedCandidate, setSelectedCandidate] = useState<CompatibilityResult | null>(
    showCompareInitial && candidateMatches.length > 0 ? candidateMatches[0] : null
  );
  const [isCompareOpen, setIsCompareOpen] = useState(showCompareInitial);

  // Shortlisted state
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [suggestedIds, setSuggestedIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSuggestMatch = (candId: string, candName: string) => {
    if (!suggestedIds.includes(candId)) {
      setSuggestedIds([...suggestedIds, candId]);
    }
    showToast(`Match suggestion sent to ${client.firstName} & ${candName}!`);
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-stone-700 animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-rose-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Selector Section */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-700 font-medium text-xs mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Deterministic 12-Dimension Match Engine</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Finding Matches for {client.firstName} {client.lastName}
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Client: <strong className="text-stone-800">{client.age} yrs • {client.city} • {client.religion} ({client.jainSect || client.caste})</strong>. Looking for: <strong className="text-rose-700">{client.preferences.preferredGender} ({client.preferences.ageMin}–{client.preferences.ageMax} yrs)</strong>.
            </p>
          </div>

          {/* Client Selector Dropdown */}
          <div className="shrink-0 space-y-1">
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Select Client Profile</label>
            <select
              value={client.id}
              onChange={(e) => router.push(`/admin/matches?client=${e.target.value}`)}
              className="text-xs font-bold py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-stone-900 cursor-pointer"
            >
              {MOCK_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.gender}, {p.age} yrs - {p.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hard Gender Eligibility Banner */}
        <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/60 flex items-center justify-between text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-rose-700 shrink-0" />
            <span>
              <strong>Hard Gender Filter Enforced:</strong> Showing <strong>{client.preferences.preferredGender} candidates only</strong>. Same-gender profiles are 100% excluded.
            </span>
          </div>
          <span className="font-bold text-rose-800 px-2.5 py-0.5 rounded-full bg-rose-100 text-[11px]">
            {candidateMatches.length} Eligible Candidates
          </span>
        </div>
      </div>

      {/* Candidate Profile Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-stone-900">
            Top Candidate Matches ({candidateMatches.length})
          </h2>
          <span className="text-xs text-stone-500 font-medium">Sorted deterministically by compatibility score</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidateMatches.map((res) => {
            const cand = res.candidate;
            const isSuggested = suggestedIds.includes(cand.id);

            return (
              <div
                key={cand.id}
                className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                
                {/* Header Banner & Photo */}
                <div className="relative h-56 w-full bg-stone-100">
                  <img src={cand.photoUrl} alt={cand.firstName} className="h-full w-full object-cover" />
                  
                  {/* Score Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{res.totalScore}% Compatibility</span>
                  </div>

                  {/* Label Badge */}
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-xs text-white font-semibold text-[10px]">
                    {res.label}
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="p-5 flex-1 space-y-4">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-stone-900 leading-tight">
                      {cand.firstName} {cand.lastName}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      {cand.age} yrs • {cand.city}, {cand.state} • {cand.height} cm
                    </p>
                  </div>

                  <div className="text-xs space-y-1.5 text-stone-600 border-t border-stone-100 pt-3">
                    <p className="font-semibold text-stone-800">{cand.profession.designation} ({cand.profession.company})</p>
                    <p className="text-stone-500">{cand.education.degree} {cand.education.postgradDegree ? `• ${cand.education.postgradDegree}` : ''}</p>
                    <p className="text-rose-700 font-semibold">{cand.religion} {cand.jainSect ? `(${cand.jainSect})` : ''} • {cand.caste}</p>
                    <p className="text-stone-500 font-medium">Income: ₹{cand.profession.income} LPA • {cand.maritalStatus}</p>
                  </div>

                  {/* Why this match summary */}
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs space-y-1">
                    <span className="font-bold text-stone-500 uppercase text-[9px] block tracking-wider">Why this match?</span>
                    <p className="text-stone-700 leading-relaxed text-[11px]">{res.matchReason}</p>
                  </div>

                  {/* Score Breakdown Bars */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-100">
                    <div className="flex justify-between text-[10px] font-bold text-stone-500">
                      <span>Compatibility Breakdown</span>
                      <span>{res.totalScore} / 100</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-[9px] font-semibold text-center text-stone-600">
                      <div className="bg-stone-100 py-1 rounded">Age: {res.scoreBreakdown.age}/10</div>
                      <div className="bg-stone-100 py-1 rounded">Loc: {res.scoreBreakdown.location}/10</div>
                      <div className="bg-stone-100 py-1 rounded">Rel: {res.scoreBreakdown.religion}/10</div>
                      <div className="bg-stone-100 py-1 rounded">Edu: {res.scoreBreakdown.education}/10</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedCandidate(res);
                        setIsCompareOpen(true);
                      }}
                      className="w-full py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5 text-stone-600" />
                      <span>Compare</span>
                    </button>

                    <button
                      onClick={() => handleSuggestMatch(cand.id, cand.firstName)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${
                        isSuggested
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-700 hover:bg-rose-800 text-white'
                      }`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isSuggested ? 'Suggested ✓' : 'Suggest Match'}</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DEDICATED SIDE-BY-SIDE CANDIDATE COMPARISON MODAL */}
      {isCompareOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl border border-stone-200 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-stone-900">Side-by-Side Matchmaker Comparison</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Detailed compatibility evaluation between {client.firstName} Sharma and candidate {selectedCandidate.candidate.firstName} {selectedCandidate.candidate.lastName}
                </p>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-2 rounded-xl border border-stone-200 text-stone-400 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Score & Verdict Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 to-rose-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">Match Verdict</span>
                <h4 className="font-serif text-lg font-bold">{selectedCandidate.totalScore}% — {selectedCandidate.label}</h4>
                <p className="text-xs text-stone-300 mt-0.5">{selectedCandidate.matchReason}</p>
              </div>
              <button
                onClick={() => {
                  handleSuggestMatch(selectedCandidate.candidate.id, selectedCandidate.candidate.firstName);
                  setIsCompareOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer shrink-0"
              >
                Suggest This Match
              </button>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-bold text-stone-700 bg-stone-50">
                    <th className="p-3 w-1/4">Attribute</th>
                    <th className="p-3 w-1/3 text-stone-900 font-bold">{client.firstName} (Client)</th>
                    <th className="p-3 w-1/3 text-rose-900 font-bold">{selectedCandidate.candidate.firstName} (Candidate)</th>
                    <th className="p-3 text-right">Alignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  
                  <tr>
                    <td className="p-3 font-semibold text-stone-500">Gender Eligibility</td>
                    <td className="p-3 font-medium text-stone-900">{client.gender}</td>
                    <td className="p-3 font-medium text-stone-900">{selectedCandidate.candidate.gender}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">✓ Eligible</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-stone-500">Age & Preference</td>
                    <td className="p-3 font-medium text-stone-900">{client.age} yrs (Prefers {client.preferences.ageMin}–{client.preferences.ageMax})</td>
                    <td className="p-3 font-medium text-stone-900">{selectedCandidate.candidate.age} yrs</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">✓ Strong Match</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-stone-500">Location</td>
                    <td className="p-3 font-medium text-stone-900">{client.city}</td>
                    <td className="p-3 font-medium text-stone-900">{selectedCandidate.candidate.city}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        client.city === selectedCandidate.candidate.city ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {client.city === selectedCandidate.candidate.city ? '✓ Same City' : '⚠ Partial'}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-stone-500">Religion & Sect</td>
                    <td className="p-3 font-medium text-stone-900">{client.religion} ({client.jainSect || 'N/A'})</td>
                    <td className="p-3 font-medium text-stone-900">{selectedCandidate.candidate.religion} ({selectedCandidate.candidate.jainSect || 'N/A'})</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">✓ Strong Match</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-stone-500">Caste</td>
                    <td className="p-3 font-medium text-stone-900">{client.caste}</td>
                    <td className="p-3 font-medium text-stone-900">{selectedCandidate.candidate.caste}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">✓ Strong Match</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-stone-500">Occupation</td>
                    <td className="p-3 font-medium text-stone-900">{client.profession.designation}</td>
                    <td className="p-3 font-medium text-stone-900">{selectedCandidate.candidate.profession.designation}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">✓ High Professional</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-stone-500">Education</td>
                    <td className="p-3 font-medium text-stone-900">{client.education.degree}</td>
                    <td className="p-3 font-medium text-stone-900">{selectedCandidate.candidate.education.degree}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">✓ Degree Match</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-stone-500">Income (LPA)</td>
                    <td className="p-3 font-medium text-stone-900">₹{client.profession.income} LPA</td>
                    <td className="p-3 font-medium text-stone-900">₹{selectedCandidate.candidate.profession.income} LPA</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">✓ Target Met</span>
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-stone-500">Diet & Lifestyle</td>
                    <td className="p-3 font-medium text-stone-900">{client.lifestyle.diet}</td>
                    <td className="p-3 font-medium text-stone-900">{selectedCandidate.candidate.lifestyle.diet}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">✓ Diet Match</span>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Strengths & Concerns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 space-y-1">
                <span className="font-bold text-emerald-900 text-xs block">Key Match Strengths</span>
                <ul className="list-disc list-inside space-y-1 text-emerald-800 text-[11px]">
                  {selectedCandidate.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-1">
                <span className="font-bold text-amber-900 text-xs block">Potential Considerations</span>
                {selectedCandidate.concerns.length === 0 ? (
                  <p className="text-amber-800 text-[11px]">No major preference mismatches identified.</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-amber-800 text-[11px]">
                    {selectedCandidate.concerns.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default function MatchesPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div className="p-6 text-xs text-stone-500">Loading Candidate Matches...</div>}>
        <MatchesContent />
      </Suspense>
    </AdminLayout>
  );
}
