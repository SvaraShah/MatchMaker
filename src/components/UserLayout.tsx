'use strict';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Heart,
  LogOut,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { getTimeGreeting } from '@/lib/time';

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [greeting, setGreeting] = useState('Good morning');
  const [userSession, setUserSession] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shortlistCount, setShortlistCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const fetchUserData = useCallback(async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const json = await meRes.json();
        if (json.success) setUserSession(json.user);
      }

      const shortRes = await fetch('/api/me/shortlist');
      if (shortRes.ok) {
        const sJson = await shortRes.json();
        if (sJson.success) setShortlistCount(sJson.data.length);
      }

      const reqRes = await fetch('/api/me/requests');
      if (reqRes.ok) {
        const rJson = await reqRes.json();
        if (rJson.success) {
          const recPending = rJson.data.received.filter((r: any) => r.status === 'pending').length;
          setPendingRequestsCount(recPending);
        }
      }
    } catch (e) {
      console.error('Failed to load user session layout data:', e);
    }
  }, []);

  useEffect(() => {
    setGreeting(getTimeGreeting());
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    }
    fetchUserData();
  }, [fetchUserData]);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.refresh();
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const firstName = userSession?.name?.split(' ')[0] || 'User';

  const navItems = [
    { label: 'Home', href: '/app' },
    { label: 'Discover Matches', href: '/app/matches' },
    { label: 'Shortlist', href: '/app/shortlist', badge: shortlistCount },
    { label: 'Requests', href: '/app/requests', badge: pendingRequestsCount },
    { label: 'Chat', href: '/app/chat' },
    { label: 'Notifications', href: '/app/notifications' },
    { label: 'My Profile', href: '/app/profile' },
    { label: 'Preferences', href: '/app/preferences' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* Top Banner Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              onClick={() => router.push('/app')}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-primary text-white shadow-md shadow-rose-500/20 cursor-pointer"
            >
              <Heart className="h-5 w-5" fill="currentColor" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-rose-600 dark:from-white dark:to-rose-400">
                TDC Matrimony
              </span>
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Platform
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`relative hover:text-rose-500 transition-colors cursor-pointer ${
                    isActive ? 'text-rose-500 font-bold' : ''
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              {greeting}, <strong className="text-slate-800 dark:text-white">{firstName}!</strong>
            </span>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-background hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-border text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-semibold cursor-pointer transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end">
          <div className="w-64 bg-white dark:bg-slate-900 h-full p-4 space-y-4 shadow-xl border-l border-border animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-extrabold text-sm text-rose-500">Matrimonial Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-500 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-white text-rose-500 text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-border pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-destructive/20 text-destructive text-xs font-semibold cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Layout Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 lg:pb-8 space-y-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-border px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => router.push('/app')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            pathname === '/app' ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Heart className="h-4.5 w-4.5" fill={pathname === '/app' ? 'currentColor' : 'none'} />
          <span>Home</span>
        </button>

        <button
          onClick={() => router.push('/app/matches')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            pathname === '/app/matches' ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Sun className="h-4.5 w-4.5" />
          <span>Matches</span>
        </button>

        <button
          onClick={() => router.push('/app/shortlist')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold relative ${
            pathname === '/app/shortlist' ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Moon className="h-4.5 w-4.5" />
          <span>Shortlist</span>
          {shortlistCount > 0 && (
            <span className="absolute -top-1 right-1 h-3.5 w-3.5 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center">
              {shortlistCount}
            </span>
          )}
        </button>

        <button
          onClick={() => router.push('/app/requests')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold relative ${
            pathname === '/app/requests' ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LogOut className="h-4.5 w-4.5 rotate-180" />
          <span>Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1 right-1 h-3.5 w-3.5 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center">
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
}
