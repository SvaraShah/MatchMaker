'use strict';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminAuditTrailPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setLogs(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            System Audit Trail & Security Logs
          </h1>
          <p className="text-xs text-slate-500">Log of match actions, status changes, and user interest requests.</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Loading audit trail...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center text-slate-400">
            No audit logs recorded yet.
          </div>
        ) : (
          <div className="glass-panel rounded-3xl overflow-hidden shadow-xs border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-border text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Action</th>
                    <th className="p-4">Entity Type</th>
                    <th className="p-4">Entity ID</th>
                    <th className="p-4">User</th>
                    <th className="p-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-bold text-primary">{log.action}</td>
                      <td className="p-4">{log.entityType}</td>
                      <td className="p-4 text-slate-500">{log.entityId || 'N/A'}</td>
                      <td className="p-4">{log.user?.name || log.userId || 'System'}</td>
                      <td className="p-4 text-right text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
