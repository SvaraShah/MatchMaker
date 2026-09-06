'use strict';
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Lock, Mail, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Invalid email or password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
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
      <div className="absolute top-[-20%] left-[-20%] h-[60%] w-[60%] rounded-full bg-rose-500/5 blur-[120px] dark:bg-rose-500/10" />
      <div className="absolute bottom-[-20%] right-[-20%] h-[60%] w-[60%] rounded-full bg-amber-500/5 blur-[120px] dark:bg-amber-500/10" />

      <div className="w-full max-w-md z-10">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 shadow-xl shadow-rose-600/20 ring-4 ring-rose-500/10">
            <Heart className="h-7 w-7 text-white animate-pulse" fill="currentColor" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            TDC Matrimony
          </h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Premium Matchmaking & Bureau Engine
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="mb-6 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sign in to continue your matchmaking journey.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label 
                htmlFor="login-email" 
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 hover:from-rose-500 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 active:scale-[0.99] transition-all disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
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

          {/* Navigation to Sign Up */}
          <div className="mt-6 border-t border-slate-200/80 dark:border-slate-800/80 pt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don&apos;t have an account?{' '}
              <Link 
                href="/register" 
                className="font-semibold text-rose-600 dark:text-rose-400 hover:underline transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Encrypted 256-bit HTTP-Only Session Security</span>
        </div>
      </div>
    </main>
  );
}
