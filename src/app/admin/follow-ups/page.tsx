'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { TODAY_FOLLOWUPS } from '@/lib/mockData';
import { CheckSquare, Clock, AlertCircle, CheckCircle2, Eye, Calendar, Plus } from 'lucide-react';

export default function FollowUpsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'upcoming' | 'completed'>('today');
  const [tasks, setTasks] = useState(TODAY_FOLLOWUPS);

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' }
          : t
      )
    );
  };

  return (
    <AdminLayout>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Task Follow-ups Hub
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage scheduled calls, family discussions, and match reviews
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs">
          <Plus className="h-4 w-4" />
          <span>New Follow-up Task</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-6 text-xs font-semibold text-stone-500">
        {[
          { key: 'today', label: `Today's Tasks (${tasks.length})` },
          { key: 'overdue', label: 'Overdue (2)' },
          { key: 'upcoming', label: 'Upcoming (5)' },
          { key: 'completed', label: 'Completed (14)' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`pb-3 transition-all cursor-pointer ${
              activeTab === t.key
                ? 'border-b-2 border-rose-700 text-rose-900 font-bold'
                : 'hover:text-stone-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              task.status === 'Completed'
                ? 'bg-stone-50/70 border-stone-200 opacity-60'
                : 'bg-white border-stone-200/80 shadow-2xs hover:shadow-xs'
            }`}
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={task.status === 'Completed'}
                onChange={() => toggleTaskStatus(task.id)}
                className="h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <img src={task.avatar} alt="" className="h-10 w-10 rounded-full object-cover border border-stone-200 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span
                    onClick={() => router.push(`/admin/clients/${task.clientId}`)}
                    className="font-bold text-sm text-stone-900 hover:text-rose-700 cursor-pointer"
                  >
                    {task.clientName}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                    task.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {task.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-stone-600 font-medium mt-0.5">{task.task}</p>
                <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{task.dueTime}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => router.push(`/admin/clients/${task.clientId}`)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 cursor-pointer"
              >
                Open Client
              </button>
              <button
                onClick={() => toggleTaskStatus(task.id)}
                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer"
              >
                {task.status === 'Completed' ? 'Reopen' : 'Mark Done'}
              </button>
            </div>

          </div>
        ))}
      </div>

    </AdminLayout>
  );
}
