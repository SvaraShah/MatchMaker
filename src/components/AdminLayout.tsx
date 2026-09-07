'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Search,
  Kanban,
  CheckSquare,
  Heart,
  BarChart3,
  MessageSquare,
  FileText,
  Settings,
  Bell,
  Menu,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { MOCK_PROFILES, TODAY_FOLLOWUPS } from '@/lib/mockData';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const clientMatches = MOCK_PROFILES.filter(
      p =>
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.profession.designation.toLowerCase().includes(query) ||
        p.religion.toLowerCase().includes(query) ||
        p.caste.toLowerCase().includes(query)
    ).map(p => ({
      type: 'Client',
      title: `${p.firstName} ${p.lastName}`,
      subtitle: `${p.age} • ${p.city} • ${p.profession.designation}`,
      link: `/admin/clients/${p.id}`
    }));

    const taskMatches = TODAY_FOLLOWUPS.filter(
      t => t.task.toLowerCase().includes(query) || t.clientName.toLowerCase().includes(query)
    ).map(t => ({
      type: 'Follow-up',
      title: t.task,
      subtitle: `Client: ${t.clientName} (${t.dueTime})`,
      link: `/admin/follow-ups`
    }));

    const results = [...clientMatches, ...taskMatches];
    setSearchResults(results);
    setShowSearchDropdown(true);
  }, [searchQuery]);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Clients', icon: Users, href: '/admin/clients' },
    { label: 'Find Matches', icon: Heart, href: '/admin/matches' },
    { label: 'Pipeline', icon: Kanban, href: '/admin/pipeline' },
    { label: 'Follow-ups', icon: CheckSquare, href: '/admin/follow-ups' },
    { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { label: 'Messages', icon: MessageSquare, href: '/admin/messages', badge: 3 },
    { label: 'Notes', icon: FileText, href: '/admin/notes' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col lg:flex-row font-sans selection:bg-rose-100 selection:text-rose-900">
      
      {/* Quiet Light Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-stone-200/80 bg-[#FAF9F6] sticky top-0 h-screen z-30 shrink-0 select-none">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-stone-200/60">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/admin')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-sm shadow-rose-500/20">
              <Heart className="h-5 w-5 fill-white/20 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-stone-900 tracking-tight block leading-tight">
                MatchMaker
              </span>
              <span className="text-[10px] font-medium text-stone-500 block tracking-wide">
                People • Profiles • Possibilities
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-50/90 text-rose-950 font-semibold border-l-2 border-rose-600 shadow-xs'
                    : 'text-stone-600 font-medium hover:bg-stone-100/70 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-rose-700 stroke-[2.2]' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Quote */}
        <div className="p-4 border-t border-stone-200/60 bg-stone-100/40">
          <div className="p-3 rounded-xl bg-white border border-stone-200/60 shadow-2xs text-center space-y-1">
            <Sparkles className="h-3.5 w-3.5 text-rose-500 mx-auto" />
            <p className="font-serif italic text-[11px] text-stone-700 leading-snug">
              "Meaningful Matches,<br />Brighter Futures."
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/70 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 cursor-pointer shrink-0"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Global Search Bar */}
            <div className="relative w-full">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                  placeholder="Search clients, matches, follow-ups..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/70 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-stone-900 placeholder:text-stone-400 transition-all"
                />
              </div>

              {/* Global Search Dropdown */}
              {showSearchDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2.5 border-b border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                    <span>Search Results ({searchResults.length})</span>
                    <button onClick={() => setShowSearchDropdown(false)} className="hover:text-stone-600">Close</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-xs text-center text-stone-400">No matching records found.</div>
                    ) : (
                      searchResults.map((res, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                            router.push(res.link);
                          }}
                          className="p-3 hover:bg-stone-50 flex items-center justify-between cursor-pointer transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
                                {res.type}
                              </span>
                              <span className="text-xs font-semibold text-stone-900">{res.title}</span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5">{res.subtitle}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4 ml-4 shrink-0">
            
            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-all cursor-pointer" title="Notifications">
              <Bell className="h-4.5 w-4.5 text-stone-600" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-600 ring-2 ring-white"></span>
            </button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-stone-800 to-stone-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                M
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-stone-900 leading-tight">Matchmaker Admin</span>
                <span className="block text-[10px] text-stone-500 font-medium">Senior Bureau Admin</span>
              </div>
            </div>

          </div>

        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex">
            <div className="w-64 bg-[#FAF9F6] h-full p-4 space-y-4 shadow-2xl border-r border-stone-200 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-600 fill-rose-600/20" />
                  <span className="font-serif font-bold text-base text-stone-900">MatchMaker</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1">
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
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-rose-50 text-rose-950 font-semibold border-l-2 border-rose-600'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
          {children}
        </main>
      </div>
    </div>
  );
}
