'use strict';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Kanban,
  Users,
  Loader2,
  ArrowRight,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

export default function PipelinePage() {
  const router = useRouter();
  const [stages, setStages] = useState<string[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pipeline');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStages(json.stages);
          setPipeline(json.pipeline);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const handleStageChange = async (customerId: string, newStage: string) => {
    if (updatingId) return;
    setUpdatingId(customerId);
    try {
      const res = await fetch('/api/admin/pipeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, stage: newStage }),
      });
      const json = await res.json();
      if (json.success) {
        fetchPipeline();
      } else {
        alert(json.error || 'Failed to update stage');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Kanban className="h-6 w-6 text-primary" />
            Matchmaker Client Kanban Pipeline
          </h1>
          <p className="text-xs text-slate-500">
            Track and advance clients across all 9 stages from initial lead through successful matrimony.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-slate-500 mt-2 font-medium">Loading matchmaker pipeline stages...</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-6 items-start">
            {stages.map((stage) => {
              const clientsInStage = pipeline[stage] || [];
              return (
                <div
                  key={stage}
                  className="w-72 shrink-0 glass-panel rounded-3xl p-4 border border-border bg-slate-100/50 dark:bg-slate-900/50 flex flex-col max-h-[750px]"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {stage}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {clientsInStage.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {clientsInStage.length === 0 ? (
                      <div className="p-6 text-center text-[11px] text-slate-400 border border-dashed border-border rounded-2xl">
                        No clients in stage
                      </div>
                    ) : (
                      clientsInStage.map((client) => (
                        <div
                          key={client.id}
                          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-border shadow-xs space-y-3 hover:border-primary/50 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-400 to-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {client.firstName.charAt(0)}
                              </div>
                              <div>
                                <h4
                                  onClick={() => router.push(`/admin/clients/${client.id}`)}
                                  className="text-xs font-bold text-slate-950 dark:text-white hover:text-primary transition-colors cursor-pointer truncate"
                                >
                                  {client.firstName} {client.lastName}
                                </h4>
                                <span className="text-[10px] text-slate-400 block">
                                  {client.gender}, {client.age} yrs • {client.city}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 border-t border-border/50 pt-2 space-y-1">
                            <p className="truncate">
                              <strong className="text-slate-700 dark:text-slate-300">Profession:</strong> {client.profession.designation}
                            </p>

                            {client.nextFollowUp && (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 pt-1">
                                <Clock className="h-3 w-3" />
                                <span>Task due: {client.nextFollowUp.dueDate}</span>
                              </div>
                            )}
                          </div>

                          {/* Stage selector dropdown */}
                          <div className="pt-2 border-t border-border flex items-center justify-between">
                            <select
                              value={stage}
                              disabled={updatingId === client.id}
                              onChange={(e) => handleStageChange(client.id, e.target.value)}
                              className="text-[10px] font-bold px-2 py-1 rounded-lg border border-border bg-slate-50 dark:bg-slate-900 cursor-pointer"
                            >
                              {stages.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => router.push(`/admin/clients/${client.id}`)}
                              className="p-1 text-slate-400 hover:text-primary cursor-pointer"
                              title="View Client Dossier"
                            >
                              <Eye className="h-4 w-4" />
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
        )}
      </div>
    </AdminLayout>
  );
}
