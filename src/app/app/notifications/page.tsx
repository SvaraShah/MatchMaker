'use strict';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Heart, MessageSquare, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import UserLayout from '@/components/UserLayout';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setNotifications(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Notifications & Activity Alerts
            </h1>
            <p className="text-xs text-slate-500">Real-time alerts for interest requests, acceptances, and messages.</p>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-slate-500 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl text-center space-y-3 border border-border">
            <Bell className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Notifications Yet</h3>
            <p className="text-xs text-slate-500">Activity updates regarding your matrimonial interests will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today's Notifications */}
            {(() => {
              const startOfToday = new Date();
              startOfToday.setHours(0, 0, 0, 0);

              const todayItems = notifications.filter((n) => new Date(n.createdAt) >= startOfToday);
              const earlierItems = notifications.filter((n) => new Date(n.createdAt) < startOfToday);

              return (
                <>
                  {todayItems.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500">Today</h3>
                      {todayItems.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => n.link && router.push(n.link)}
                          className={`glass-panel p-5 rounded-2xl flex items-start gap-4 transition-all cursor-pointer border ${
                            !n.isRead
                              ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                              : 'border-border hover:border-primary'
                          }`}
                        >
                          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                            {n.type === 'new_message' ? (
                              <MessageSquare className="h-5 w-5" />
                            ) : n.type === 'interest_accepted' ? (
                              <CheckCircle className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <Heart className="h-5 w-5" />
                            )}
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-950 dark:text-white flex items-center gap-2">
                                {n.title}
                                {!n.isRead && (
                                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                                )}
                              </h4>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                          </div>

                          <ArrowRight className="h-4 w-4 text-slate-400 self-center" />
                        </div>
                      ))}
                    </div>
                  )}

                  {earlierItems.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Earlier</h3>
                      {earlierItems.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => n.link && router.push(n.link)}
                          className={`glass-panel p-5 rounded-2xl flex items-start gap-4 transition-all cursor-pointer border ${
                            !n.isRead
                              ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                              : 'border-border hover:border-primary'
                          }`}
                        >
                          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                            {n.type === 'new_message' ? (
                              <MessageSquare className="h-5 w-5" />
                            ) : n.type === 'interest_accepted' ? (
                              <CheckCircle className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <Heart className="h-5 w-5" />
                            )}
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-950 dark:text-white flex items-center gap-2">
                                {n.title}
                                {!n.isRead && (
                                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                                )}
                              </h4>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                          </div>

                          <ArrowRight className="h-4 w-4 text-slate-400 self-center" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
