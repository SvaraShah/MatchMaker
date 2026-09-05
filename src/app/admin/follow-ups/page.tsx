'use strict';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  User,
  Plus,
  Loader2,
  Eye,
  Filter,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

export default function FollowUpsPage() {
  const router = useRouter();

  const [filter, setFilter] = useState<'today' | 'overdue' | 'upcoming' | 'completed'>('today');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/follow-ups?filter=${filter}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) setTasks(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleComplete = async (id: string, currentStatus: string) => {
    if (updatingId) return;
    setUpdatingId(id);

    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

    try {
      const res = await fetch('/api/admin/follow-ups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Matchmaker Task & Follow-up Center
          </h1>
          <p className="text-xs text-slate-500">
            Schedule, track, and complete operational client follow-ups and match review reminders.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1 text-xs font-bold">
          {[
            { id: 'today', label: 'Due Today', color: 'text-amber-500' },
            { id: 'overdue', label: 'Overdue Tasks', color: 'text-rose-500' },
            { id: 'upcoming', label: 'Upcoming Tasks', color: 'text-primary' },
            { id: 'completed', label: 'Completed Tasks', color: 'text-emerald-500' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filter === tab.id
                  ? 'border-b-2 border-primary text-primary bg-primary/5 font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-slate-500 mt-2 font-medium">Loading task list...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl space-y-3 border border-border">
            <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">All Caught Up!</h3>
            <p className="text-xs text-slate-500">No {filter} follow-up tasks registered in this view.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isOverdue = filter === 'overdue' || new Date(task.dueDate) < new Date();
              return (
                <div
                  key={task.id}
                  className={`glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-all ${
                    task.status === 'completed'
                      ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/30'
                      : isOverdue
                      ? 'border-rose-200 bg-rose-50/30 dark:border-rose-900/30'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleComplete(task.id, task.status)}
                      disabled={updatingId === task.id}
                      className={`mt-1 h-5 w-5 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                        task.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-border bg-background hover:border-primary'
                      }`}
                    >
                      {task.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-xs font-bold ${
                            task.status === 'completed'
                              ? 'line-through text-slate-400'
                              : 'text-slate-950 dark:text-white'
                          }`}
                        >
                          {task.title}
                        </h4>

                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            task.priority === 'high'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                          }`}
                        >
                          {task.priority} priority
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>
                          Client: <strong>{task.customer.firstName} {task.customer.lastName}</strong> ({task.customer.city})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Calendar className="h-3 w-3 text-primary" /> Due: {task.dueDate}
                        </span>
                      </p>

                      {task.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic pt-1">"{task.notes}"</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => router.push(`/admin/clients/${task.customer.id}`)}
                      className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Client Dossier</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
