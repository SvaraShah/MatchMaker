'use client';

import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { MessageSquare, Send, User } from 'lucide-react';
import { TODAY_FOLLOWUPS } from '@/lib/mockData';

export default function MessagesPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Matchmaker Messages</h1>
          <p className="text-xs text-stone-500 mt-0.5">Direct matchmaker communication channel with client families</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
        {/* Conversations List */}
        <div className="md:col-span-4 bg-white rounded-3xl border border-stone-200/80 p-4 shadow-xs space-y-3">
          <h3 className="font-serif font-bold text-sm text-stone-900 px-2">Active Conversations</h3>
          <div className="space-y-2">
            {TODAY_FOLLOWUPS.map((item) => (
              <div key={item.id} className="p-3 rounded-2xl bg-stone-50 border border-stone-100 hover:bg-stone-100/60 cursor-pointer transition-all flex items-center gap-3">
                <img src={item.avatar} alt="" className="h-9 w-9 rounded-full object-cover border border-stone-200" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-stone-900 truncate">{item.clientName}</span>
                    <span className="text-[10px] text-stone-400 font-medium">10:45 AM</span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">{item.task}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Chat Window */}
        <div className="md:col-span-8 bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <img src={TODAY_FOLLOWUPS[0].avatar} alt="" className="h-10 w-10 rounded-full object-cover border border-stone-200" />
              <div>
                <h4 className="font-bold text-sm text-stone-900">{TODAY_FOLLOWUPS[0].clientName}</h4>
                <p className="text-[11px] text-emerald-600 font-medium">● Online • Matrimonial Discussion</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 py-6">
            <div className="p-3 rounded-2xl bg-stone-100 text-xs text-stone-800 max-w-md">
              Hello Matchmaker Maya, we reviewed Arjun's profile. We would like to schedule a formal call this weekend.
            </div>
            <div className="p-3 rounded-2xl bg-rose-700 text-xs text-white max-w-md ml-auto">
              Namaste Priya! That is wonderful. I will arrange a joint call with Arjun's family for Saturday at 4 PM.
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-stone-100">
            <input
              type="text"
              placeholder="Type message to client..."
              className="flex-1 p-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-stone-900"
            />
            <button className="p-2.5 rounded-xl bg-rose-700 text-white font-bold cursor-pointer hover:bg-rose-800">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
