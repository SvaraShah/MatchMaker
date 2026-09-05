'use strict';
'use client';

import { Settings, ShieldCheck, Database, Server } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Matchmaker System Settings
          </h1>
          <p className="text-xs text-slate-500">Platform configuration, database parameters, and environment controls.</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-bold text-sm">Database Engine</h3>
              <p className="text-xs text-slate-400">PostgreSQL + Prisma ORM (Embedded/Production)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-border pb-4">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="font-bold text-sm">Authentication Architecture</h3>
              <p className="text-xs text-slate-400">HTTP-Only JWT Session Cookies with Bcrypt Password Hashing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-rose-500" />
            <div>
              <h3 className="font-bold text-sm">AI Engine Integration</h3>
              <p className="text-xs text-slate-400">Server-Side OpenAI SDK (`gpt-4o-mini`) with Safe Fallbacks</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
