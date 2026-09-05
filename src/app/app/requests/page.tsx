'use strict';
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Check, X, Loader2 } from 'lucide-react';
import UserLayout from '@/components/UserLayout';

export default function RequestsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [requests, setRequests] = useState<{ received: any[]; sent: any[] }>({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/me/requests');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setRequests(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      const res = await fetch(`/api/me/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRequests(prev => ({
          ...prev,
          received: prev.received.map(r => (r.id === requestId ? { ...r, status } : r)),
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Send className="h-6 w-6 text-emerald-500" />
            Interest Requests
          </h1>
          <p className="text-xs text-slate-500">Track and respond to matrimonial introduction requests.</p>
        </div>

        <div className="flex border-b border-border gap-6">
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'received' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'
            }`}
          >
            Received Interests ({requests.received.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'sent' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400'
            }`}
          >
            Sent Interests ({requests.sent.length})
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            <span>Loading requests...</span>
          </div>
        ) : activeTab === 'received' ? (
          requests.received.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center text-slate-400">
              No received interest requests.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.received.map((r) => {
                const p = r.senderProfile;
                return (
                  <div key={r.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                        {p?.firstName ? p.firstName[0] : 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {p?.firstName} {p?.lastName}
                        </h3>
                        <p className="text-xs text-slate-400">{p?.age} yrs • {p?.city} • {p?.profession?.designation}</p>
                        {r.message && <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1 font-serif">"{r.message}"</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {r.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'accepted')}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                          >
                            <Check className="h-4 w-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'declined')}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/10 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                            <span>Decline</span>
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          r.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {r.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          requests.sent.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center text-slate-400">
              No sent interest requests.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.sent.map((r) => {
                const p = r.receiverProfile;
                return (
                  <div key={r.id} className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center">
                        {p?.firstName ? p.firstName[0] : 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {p?.firstName} {p?.lastName}
                        </h3>
                        <p className="text-xs text-slate-400">{p?.age} yrs • {p?.city}</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Status: {r.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </UserLayout>
  );
}
