'use strict';
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Send,
  Loader2,
  Lock,
  ArrowLeft,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  Wifi,
} from 'lucide-react';
import UserLayout from '@/components/UserLayout';

interface Partner {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  photoUrl?: string | null;
  profession: { designation: string; company: string };
}

interface ConversationItem {
  id: string;
  partner: Partner | null;
  partnerUserId: string;
  lastMessage: { id: string; content: string; senderId: string; createdAt: string } | null;
  updatedAt: string;
}

interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export default function UserChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const [showMobileList, setShowMobileList] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setUserSession(json.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setConversations(json.data);
          if (json.data.length > 0 && !activeConvId) {
            setActiveConvId(json.data[0].id);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
    } finally {
      setLoading(false);
    }
  }, [activeConvId]);

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setMessages(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to load messages:', e);
    }
  }, []);

  useEffect(() => {
    fetchSession();
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    }
  }, [activeConvId, fetchMessages]);

  // NATIVE SERVER-SENT EVENTS (SSE) REAL-TIME STREAMING
  useEffect(() => {
    if (!activeConvId) return;

    setSseConnected(false);
    const eventSource = new EventSource(`/api/conversations/${activeConvId}/sse`);

    eventSource.addEventListener('connected', () => {
      setSseConnected(true);
    });

    eventSource.addEventListener('message', (event: MessageEvent) => {
      try {
        const newMsg: MessageItem = JSON.parse(event.data);
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        fetchConversations();
      } catch (err) {
        console.error('SSE Message parsing error:', err);
      }
    });

    eventSource.onerror = () => {
      setSseConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [activeConvId, fetchConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConvId || sending) return;

    const content = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      const res = await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const json = await res.json();
      if (json.success) {
        // SSE will push the event to both User A and User B stream
        setMessages((prev) => {
          if (prev.some((m) => m.id === json.data.id)) return prev;
          return [...prev, json.data];
        });
        fetchConversations();
      } else {
        alert(json.error || 'Failed to send message.');
      }
    } catch {
      alert('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const selectConversation = (id: string) => {
    setActiveConvId(id);
    setShowMobileList(false);
  };

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Matrimonial Real-Time Messaging
            </h1>
            <p className="text-xs text-slate-500">
              Direct, end-to-end user communication unlocked upon mutual interest request acceptance.
            </p>
          </div>

          {activeConvId && (
            <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-border">
              <Wifi className={`h-3.5 w-3.5 ${sseConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
              <span className={sseConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>
                {sseConnected ? 'Real-Time SSE Stream Active' : 'Connecting Real-Time Stream...'}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] glass-panel rounded-3xl">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-slate-500 mt-2 font-medium">Connecting to secure messaging stream...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl text-center space-y-4 border border-rose-100 dark:border-rose-900/30 max-w-lg mx-auto">
            <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-950/50 text-primary flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">No Active Matrimonial Connections</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time messaging automatically unlocks when another member accepts your matrimonial interest request.
            </p>
            <button
              onClick={() => router.push('/app/matches')}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Explore Matches & Send Interest</span>
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl h-[650px] flex overflow-hidden border border-border shadow-sm">
            {/* Conversation List Panel */}
            <div
              className={`w-full md:w-80 border-r border-border flex flex-col bg-slate-50/50 dark:bg-slate-900/50 ${
                showMobileList ? 'flex' : 'hidden md:flex'
              }`}
            >
              <div className="p-4 border-b border-border">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accepted Connections</h3>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border/50">
                {conversations.map((conv) => {
                  const partner = conv.partner;
                  const isSelected = conv.id === activeConvId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={`w-full p-4 flex items-center gap-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-slate-800 shadow-sm border-l-4 border-primary'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-rose-400 to-rose-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {partner ? partner.firstName.charAt(0) : 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-950 dark:text-white truncate">
                            {partner ? `${partner.firstName} ${partner.lastName}` : 'Matrimonial User'}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {conv.lastMessage ? conv.lastMessage.content : 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Thread Panel */}
            <div
              className={`flex-1 flex flex-col bg-background ${
                !showMobileList ? 'flex' : 'hidden md:flex'
              }`}
            >
              {activeConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowMobileList(true)}
                        className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div className="h-9 w-9 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {activeConv.partner ? activeConv.partner.firstName.charAt(0) : 'U'}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                          {activeConv.partner ? `${activeConv.partner.firstName} ${activeConv.partner.lastName}` : 'Matrimonial User'}
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          {activeConv.partner ? `${activeConv.partner.profession.designation} • ${activeConv.partner.city}` : 'Connected Member'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-full">
                      Connection Active
                    </span>
                  </div>

                  {/* Message History */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-slate-400">
                        <MessageSquare className="h-8 w-8 text-slate-300" />
                        <p className="text-xs">Say hello to break the ice and start your conversation!</p>
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isMe = m.senderId === userSession?.id;
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`p-3.5 rounded-2xl max-w-[75%] text-xs leading-relaxed ${
                                isMe
                                  ? 'bg-primary text-white font-medium shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-border'
                              }`}
                            >
                              {m.content}
                            </div>
                            <span className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isMe && <CheckCheck className="h-3 w-3 text-primary" />}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={sending || !inputMessage.trim()}
                      className="px-5 py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-slate-400 text-xs">
                  Select a conversation to start messaging.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
