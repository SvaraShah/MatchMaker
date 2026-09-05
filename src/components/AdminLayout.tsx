'use strict';
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  Heart,
  Bot,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Zap,
  Search,
  ArrowRight,
} from 'lucide-react';
import { getTimeGreeting } from '@/lib/time';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [greeting, setGreeting] = useState('Good morning');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    setGreeting(getTimeGreeting());
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setSearchResults(json.results);
            setShowSearchDropdown(true);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const navItems = [
    { label: 'Command Center', icon: LayoutDashboard, href: '/admin' },
    { label: 'Client Directory 2.0', icon: Users, href: '/admin/clients' },
    { label: 'Kanban Pipeline', icon: Kanban, href: '/admin/pipeline' },
    { label: 'Task Follow-ups', icon: CheckSquare, href: '/admin/follow-ups' },
    { label: 'Match Reviews', icon: Heart, href: '/admin/matches' },
    { label: 'AI Matchmaker Agent', icon: Bot, href: '/admin/agent' },
    { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { label: 'Audit Trail', icon: ShieldCheck, href: '/admin/audit' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
            <Zap className="h-5 w-5" fill="currentColor" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-primary dark:from-white dark:to-primary">
              TDC Matchmaker
            </span>
            <span className="block text-[9px] font-bold uppercase tracking-widest text-primary">
              CRM Workspace
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] space-y-1">
            <span className="text-slate-400 block font-semibold">Active Session</span>
            <strong className="text-slate-800 dark:text-slate-200 block truncate">Matchmaker Admin</strong>
            <span className="text-[10px] text-emerald-500 font-bold">● CRM Active</span>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar with Global Search */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border shadow-xs h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-border text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Global Search Input */}
            <div className="relative w-full">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                  placeholder="Global Search (Client, Match, Follow-up, Note)..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                />
              </div>

              {/* Search Results Dropdown */}
              {showSearchDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2 border-b border-border flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                    <span>Search Results ({searchResults.length})</span>
                    <button onClick={() => setShowSearchDropdown(false)} className="hover:text-slate-600">Close</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                    {searching ? (
                      <div className="p-4 text-xs text-center text-slate-400">Searching CRM records...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-xs text-center text-slate-400">No matching CRM records found.</div>
                    ) : (
                      searchResults.map((res, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                            router.push(res.link);
                          }}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                                {res.type}
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{res.title}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{res.subtitle}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 ml-4 shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden xl:inline-block">
              {greeting}, <strong className="text-slate-900 dark:text-white">Admin!</strong>
            </span>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-background hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-semibold cursor-pointer transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex">
            <div className="w-64 bg-white dark:bg-slate-900 h-full p-4 space-y-4 shadow-xl border-r border-border animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="font-extrabold text-sm text-primary">Admin CRM Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
