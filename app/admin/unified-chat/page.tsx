'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, Sparkles, Zap, MessageSquare,
  ShoppingBag, AlertOctagon, MessageCircle, Megaphone,
  FileText, BarChart2, Brain, ScrollText, TrendingUp,
  CheckCircle, ExternalLink, Info, AlertTriangle, type LucideIcon,
} from 'lucide-react';
import {
  askUnifiedAgent,
  type ChatMessage,
  type ResponseBlock,
  type UnifiedChatResponse,
} from '@/lib/unified-chat-service';

const QUICK_ACTIONS: Array<{ label: string; icon: LucideIcon; query: string; color: string }> = [
  { label: 'Orders', icon: ShoppingBag, query: 'Show me orders status today', color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { label: 'Escalations', icon: AlertOctagon, query: 'Which customers need human escalation?', color: 'bg-red-50 text-red-600 border-red-100' },
  { label: 'WhatsApp', icon: MessageCircle, query: 'What did the WhatsApp agent handle today?', color: 'bg-green-50 text-green-700 border-green-100' },
  { label: 'Marketing', icon: Megaphone, query: 'What campaigns are scheduled this week?', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { label: 'SEO', icon: FileText, query: 'Summarize SEO issues and opportunities', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { label: 'Paid Ads', icon: BarChart2, query: 'Show paid ads performance and ROAS', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { label: 'Intent Classifier', icon: Brain, query: 'How is the intent classifier performing?', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { label: 'Agent Logs', icon: ScrollText, query: 'Which agents are failing or slow?', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { label: 'Daily Summary', icon: TrendingUp, query: 'Give me a daily business summary', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
];

const SUGGESTED_PROMPTS = [
  'How many orders are delayed today?',
  'Which customers need human escalation?',
  'Show me angry customers from the last 24 hours.',
  'What campaigns are scheduled this week?',
  'Which marketing posts performed best?',
  'Which agents are failing or slow?',
  'Give me a daily business summary.',
  'Show paid ads performance.',
  'Summarize SEO issues.',
  'Which conversations were classified as complaints?',
];

type MetricItem = { label: string; value: string; trend?: string; color: string; bg: string };

function MetricsBlock({ items }: { items: MetricItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {items.map((m) => (
        <div key={m.label} className={`${m.bg} rounded-xl p-3`}>
          <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
          <p className="text-xs text-gray-600 font-medium mt-0.5">{m.label}</p>
          {m.trend && <p className="text-[10px] text-gray-400 mt-0.5">{m.trend}</p>}
        </div>
      ))}
    </div>
  );
}

function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {headers.map(h => (
              <th key={h} className="text-left px-3 py-2 font-semibold text-gray-500 text-[11px] uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-gray-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BulletsBlock({ heading, items }: { heading?: string; items: string[] }) {
  return (
    <div className="mt-3">
      {heading && <p className="text-xs font-bold text-gray-700 mb-2">{heading}</p>}
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 flex-shrink-0" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AlertBlock({ severity, message }: { severity: string; message: string }) {
  const cfg = {
    info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', Icon: Info },
    warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', Icon: AlertTriangle },
    error: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', Icon: AlertOctagon },
    success: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', Icon: CheckCircle },
  }[severity] ?? { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', Icon: Info };

  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-xl border mt-3 ${cfg.bg}`}>
      <cfg.Icon size={14} className={`${cfg.text} mt-0.5 flex-shrink-0`} />
      <p className={`text-xs ${cfg.text} leading-relaxed`}>{message}</p>
    </div>
  );
}

function ActionsBlock({ items, router }: { items: Array<{ label: string; href: string; variant?: string }>; router: ReturnType<typeof useRouter> }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {items.map(({ label, href, variant }) => (
        <button
          key={label}
          onClick={() => router.push(href)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
            variant === 'primary'
              ? 'text-white shadow-sm'
              : variant === 'danger'
              ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
          }`}
          style={variant === 'primary' ? { background: 'linear-gradient(135deg, #FF4FA3, #D41472)' } : {}}
        >
          {label}
          <ExternalLink size={11} />
        </button>
      ))}
    </div>
  );
}

function ResponseRenderer({ response, router }: { response: UnifiedChatResponse; router: ReturnType<typeof useRouter> }) {
  return (
    <div>
      <p className="text-sm text-gray-800 leading-relaxed">{response.summary}</p>
      {response.blocks.map((block, i) => {
        if (block.type === 'metrics') {
          return <MetricsBlock key={i} items={block.items as never} />;
        }
        if (block.type === 'table') {
          return <TableBlock key={i} headers={block.headers} rows={block.rows} />;
        }
        if (block.type === 'bullets') {
          return <BulletsBlock key={i} heading={block.heading} items={block.items} />;
        }
        if (block.type === 'alert') {
          return <AlertBlock key={i} severity={block.severity} message={block.message} />;
        }
        if (block.type === 'text') {
          return <p key={i} className="text-sm text-gray-700 mt-2 leading-relaxed">{block.content}</p>;
        }
        if (block.type === 'actions') {
          return <ActionsBlock key={i} items={block.items} router={router} />;
        }
        return null;
      })}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <span className="text-[10px] text-gray-400">Source: {response.agentSource}</span>
        <span className="text-[10px] text-gray-300">·</span>
        <span className="text-[10px] text-gray-400">Confidence: {response.confidence}%</span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-3 max-w-[80%]">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }}>
          <Sparkles size={14} className="text-white" />
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const response = await askUnifiedAgent(q);
    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: response.summary,
      timestamp: new Date(),
      response,
    };
    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-52px)] md:h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }}>
            <MessageSquare size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Unified Chat</h1>
            <p className="text-xs text-gray-500">Ask anything across all agents</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-100 rounded-full px-3 py-1.5 font-semibold">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Connected to all agents
          </div>
        </div>
      </div>

      {/* Quick action chips */}
      <div className="flex gap-2 px-6 py-3 overflow-x-auto flex-shrink-0 bg-white border-b border-gray-100">
        {QUICK_ACTIONS.map(({ label, icon: Icon, query, color }) => (
          <button
            key={label}
            onClick={() => sendMessage(query)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border flex-shrink-0 hover:opacity-80 transition-opacity ${color}`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }}>
              <Zap size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ask across all agents</h2>
            <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-8">
              Get instant insights about operations, customers, marketing, SEO, paid ads, conversations, and agent performance — all in one place.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
              {SUGGESTED_PROMPTS.slice(0, 6).map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-pink-200 hover:shadow-sm transition-all text-sm text-gray-600 hover:text-gray-900"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-6 max-w-3xl mx-auto">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-start gap-3 max-w-[90%] w-full">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }}>
                      <Sparkles size={14} className="text-white" />
                    </div>
                    <div className="flex-1 bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-4 shadow-sm">
                      {msg.response ? (
                        <ResponseRenderer response={msg.response} router={router} />
                      ) : (
                        <p className="text-sm text-gray-800">{msg.content}</p>
                      )}
                    </div>
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="max-w-[75%]">
                    <div className="px-4 py-3 rounded-2xl rounded-tr-sm text-white text-sm font-medium shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }}>
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-gray-400 text-right mt-1">
                      {msg.timestamp.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-pink-300 focus-within:bg-white transition-all shadow-sm">
            <Sparkles size={16} className="text-pink-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Ask anything about operations, customers, marketing, SEO, ads, conversations, or agent performance..."
              className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }}
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-2">
            Powered by all agents · Responses are AI-assisted mock data for demo purposes
          </p>
        </div>
      </div>
    </div>
  );
}
