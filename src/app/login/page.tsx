'use strict';
'use client';

import { useState } from 'react';
import { Heart, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password) {
      setError('Invalid email or password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const targetRoute = data.user?.role === 'ADMIN' ? '/admin' : '/app';
        window.location.replace(targetRoute);
      } else {
        setError(data.error || 'Invalid email or password.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setError('Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 p-4 dark:bg-slate-950 transition-colors duration-300">
      {/* Background blurs */}
      <div className="absolute top-[-20%] left-[-20%] h-[60%] w-[60%] rounded-full bg-primary/5 blur-[120px] dark:bg-primary/10" />
      <div className="absolute bottom-[-20%] right-[-20%] h-[60%] w-[60%] rounded-full bg-rose-400/5 blur-[120px] dark:bg-rose-400/10" />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 ring-4 ring-primary/10">
            <Heart className="h-6 w-6 text-white animate-pulse" fill="currentColor" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            TDC Matrimony Platform
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Two-Sided Matchmaking Platform & CRM Engine
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-3xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Sign In</h2>
          <p className="mb-6 text-xs text-slate-500">Access your registered matrimonial account or matchmaker portal.</p>

          {error && (
            <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-primary/10 hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98] transition-all disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Two-Sided Platform • Secure HTTP-Only Sessions
        </p>
      </div>
    </main>
  );
}

