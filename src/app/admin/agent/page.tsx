'use strict';
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Send, Sparkles, User, RefreshCw, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface Message {
  sender: 'user' | 'agent';
  text: string;
  isFallback?: boolean;
  targetCustomerId?: string | null;
  targetCustomerName?: string | null;
}

export default function AdminAgentPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      text: `### Welcome to your AI Matchmaker Copilot!\n\nI am connected directly to your PostgreSQL database and deterministic 8-dimension matching engine.\n\n**Ask me anything about your client portfolio:**\n- *"Find the best matches for Ruksana."*\n- *"Show me top 5 candidates for David."*\n- *"Why is the top candidate a strong match for Ruksana?"*\n- *"Compare David and candidate."*`,
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [activeCustomerName, setActiveCustomerName] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking]);

  const handleSend = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || thinking) return;

    if (!textToSend) setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setThinking(true);

    try {
      const res = await fetch('/api/admin/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          activeCustomerId,
        }),
      });

      const json = await res.json();

      if (json.targetCustomerId) {
        setActiveCustomerId(json.targetCustomerId);
        setActiveCustomerName(json.targetCustomerName || 'Client');
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: json.reply || json.error || 'Request completed.',
          isFallback: Boolean(json.isFallback),
          targetCustomerId: json.targetCustomerId,
          targetCustomerName: json.targetCustomerName,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: 'Error connecting to the AI matchmaker service. Please check server connectivity.',
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        sender: 'agent',
        text: 'Chat history cleared. How can I assist you with your client portfolio today?',
      },
    ]);
    setActiveCustomerId(null);
    setActiveCustomerName(null);
  };

  // Basic Markdown Formatter Helper for Chat Output
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      const content = line;

      // Headers
      if (content.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm font-black text-slate-950 dark:text-white mt-3 mb-1">
            {content.replace('### ', '')}
          </h3>
        );
      }
      if (content.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-xs font-bold text-primary dark:text-rose-400 mt-2 mb-1">
            {content.replace('#### ', '')}
          </h4>
        );
      }

      // Horizontal Rule
      if (content.trim() === '---') {
        return <hr key={idx} className="my-2 border-border" />;
      }

      // Simple Bold Formatter (**text**)
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-slate-950 dark:text-slate-100">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Bullet points
      if (content.trim().startsWith('- ') || content.trim().startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-2 my-0.5">
            <span className="text-primary font-bold">•</span>
            <span>{formattedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={content.trim() === '' ? 'h-2' : 'my-0.5'}>
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              AI Matchmaker Agent Copilot
            </h1>
            <p className="text-xs text-slate-500">
              Staff decision-support assistant powered by PostgreSQL real DB records & deterministic 8-dimension score engine.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeCustomerName && (
              <span className="text-xs bg-primary/10 text-primary border border-primary/20 font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Active Context: {activeCustomerName}
              </span>
            )}
            <button
              onClick={handleClear}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl border border-border bg-background transition-all"
              title="Reset Chat"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat Canvas */}
        <div className="glass-panel rounded-3xl h-[620px] flex flex-col shadow-sm border border-border">
          {/* Scrollable Message History */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl max-w-[88%] text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-primary text-white font-medium shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-border'
                  }`}
                >
                  {m.sender === 'agent' ? renderFormattedText(m.text) : m.text}
                </div>

                {/* Optional Fallback Warning Badge */}
                {m.isFallback && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    <AlertCircle className="h-3 w-3" />
                    <span>Calculated offline via deterministic engine fallback</span>
                  </div>
                )}

                {/* Action button if customer referenced */}
                {m.targetCustomerId && m.sender === 'agent' && (
                  <button
                    onClick={() => router.push(`/admin/customer/${m.targetCustomerId}`)}
                    className="mt-2 text-[11px] text-primary hover:underline font-bold flex items-center gap-1"
                  >
                    View full dossier for {m.targetCustomerName || 'Client'} →
                  </button>
                )}
              </div>
            ))}

            {thinking && (
              <div className="p-4 rounded-2xl mr-auto bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs animate-pulse flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-spin" />
                <span>Running database queries & deterministic match calculations...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Starter Prompt Chips */}
          <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-border flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Prompts:</span>
            <button
              onClick={() => handleSend('Find the best matches for Ruksana.')}
              disabled={thinking}
              className="text-[11px] px-3 py-1.5 rounded-full bg-background border border-border text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-all whitespace-nowrap cursor-pointer"
            >
              Matches for Ruksana
            </button>
            <button
              onClick={() => handleSend('Show the top 5 matches for David.')}
              disabled={thinking}
              className="text-[11px] px-3 py-1.5 rounded-full bg-background border border-border text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-all whitespace-nowrap cursor-pointer"
            >
              Top 5 for David
            </button>
            <button
              onClick={() => handleSend('Why is the top match compatible?')}
              disabled={thinking}
              className="text-[11px] px-3 py-1.5 rounded-full bg-background border border-border text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-all whitespace-nowrap cursor-pointer"
            >
              Compatibility breakdown
            </button>
            <button
              onClick={() => handleSend('Compare candidates for active client.')}
              disabled={thinking}
              className="text-[11px] px-3 py-1.5 rounded-full bg-background border border-border text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-all whitespace-nowrap cursor-pointer"
            >
              Compare candidates
            </button>
          </div>

          {/* Input Bar */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t border-border flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about candidate pairings, profile compatibility, or client advice..."
              className="flex-1 px-4 py-3 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={thinking || !input.trim()}
              className="px-5 py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
