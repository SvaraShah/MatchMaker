'use strict';
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Lock, Mail, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoFill = () => {
    setEmail('matchmaker@tdc.com');
    setPassword('password123');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to dashboard
        router.refresh();
        router.push('/dashboard');
      } else {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setError('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 p-4 dark:bg-slate-950 transition-colors duration-300">
      {/* Decorative background blurs */}
      <div className="absolute top-[-20%] left-[-20%] h-[60%] w-[60%] rounded-full bg-primary/5 blur-[120px] dark:bg-primary/10" />
      <div className="absolute bottom-[-20%] right-[-20%] h-[60%] w-[60%] rounded-full bg-rose-400/5 blur-[120px] dark:bg-rose-400/10" />

      <div className="w-full max-w-md">
        {/* Portal Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 ring-4 ring-primary/10">
            <Heart className="h-6 w-6 text-white animate-pulse" fill="currentColor" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            TDC Matchmaker Portal
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            AI-Powered CRM & Matchmaking Engine
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel rounded-3xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="mb-6 text-xs text-slate-400">Sign in to manage client relations and explore AI pairings.</p>

          {error && (
            <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive animate-pulse-slow">
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
                  placeholder="matchmaker@tdc.com"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-primary/10 hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98] transition-all disabled:opacity-75 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                'Access Portal'
              )}
            </button>
          </form>

          {/* Demo Credentials Helper */}
          <div className="mt-6 border-t border-border pt-6">
            <button
              type="button"
              onClick={handleDemoFill}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-slate-100/30 dark:bg-slate-900/30 hover:bg-slate-100/70 dark:hover:bg-slate-900/70 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white py-3.5 px-4 font-medium transition-all"
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span>Use Demo Credentials</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          Authorized personnel only. Logs monitored.
        </p>
      </div>
    </main>
  );
}
