'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgent } from '@/lib/agent-context';
import { Conversation } from '@/lib/agents/types';
import { INTENT_LABELS, INTENT_COLORS } from '@/lib/agents/types';
import {
  MessageCircle, Search, Send, User,
  CheckCircle, AlertOctagon, Clock, Bot, ChevronRight,
} from 'lucide-react';

const STATUS_CONFIG = {
  active: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', label: 'Active' },
  resolved: { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600', label: 'Resolved' },
  escalated: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700', label: 'Escalated' },
  waiting_human: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Waiting' },
};

const SENTIMENT_ICON = {
  positive: '😊',
  neutral: '😐',
  negative: '😠',
};

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'escalated', label: 'Escalated' },
  { id: 'waiting_human', label: 'Waiting' },
  { id: 'resolved', label: 'Resolved' },
] as const;

type TabId = 'all' | 'active' | 'escalated' | 'waiting_human' | 'resolved';

export default function ConversationsPage() {
  const router = useRouter();
  const { conversations, simulateIncomingMessage, resolveConversation, takeOverConversation } = useAgent();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Conversation | null>(conversations[0] ?? null);
  const [replyText, setReplyText] = useState('');
  const [simPhone, setSimPhone] = useState('');
  const [simMessage, setSimMessage] = useState('');
  const [showSim, setShowSim] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const filtered = conversations.filter(c => {
    const matchTab = activeTab === 'all' || c.status === activeTab;
    const matchSearch = !search || (c.customerName ?? c.customerPhone).toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleSimulate = () => {
    if (!simPhone.trim() || !simMessage.trim()) return;
    simulateIncomingMessage(simPhone.trim(), simMessage.trim(), 'Simulated Customer');
    setSimMessage('');
    setSimPhone('');
    setShowSim(false);
    showToast('Message simulated — agent processed it in real-time');
  };

  const handleReply = () => {
    if (!selected || !replyText.trim()) return;
    setReplyText('');
    showToast('Reply sent (human takeover mode)');
  };

  const selectedConv = conversations.find(c => c.id === selected?.id) ?? selected;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Left panel — conversation list */}
      <div className="w-full md:w-80 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900">Conversations</h1>
            <button onClick={() => setShowSim(!showSim)}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
              + Simulate
            </button>
          </div>

          {showSim && (
            <div className="mb-3 p-3 bg-pink-50 rounded-xl border border-pink-100 space-y-2">
              <p className="text-[10px] font-bold text-pink-700 uppercase tracking-wide">Simulate WhatsApp Message</p>
              <input value={simPhone} onChange={e => setSimPhone(e.target.value)}
                placeholder="+971 50 XXX XXXX"
                className="w-full text-xs border border-pink-200 rounded-lg px-2.5 py-1.5 outline-none" />
              <input value={simMessage} onChange={e => setSimMessage(e.target.value)}
                placeholder="Customer message..."
                className="w-full text-xs border border-pink-200 rounded-lg px-2.5 py-1.5 outline-none" />
              <button onClick={handleSimulate}
                className="w-full text-xs font-bold py-1.5 rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                Send to Agent
              </button>
            </div>
          )}

          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-pink-200" />
          </div>
        </div>

        <div className="flex gap-1.5 px-3 py-2 border-b border-gray-50 overflow-x-auto">
          {STATUS_TABS.map(({ id, label }) => {
            const cnt = id === 'all' ? conversations.length : conversations.filter(c => c.status === id).length;
            return (
              <button key={id} onClick={() => setActiveTab(id as TabId)}
                className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-full border transition-all ${
                  activeTab === id ? 'text-white border-transparent' : 'bg-white text-gray-500 border-gray-100'
                }`}
                style={activeTab === id ? { background: 'linear-gradient(135deg, #c2185b, #e91e8c)' } : {}}>
                {label} {cnt > 0 && cnt}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map(conv => {
            const stCfg = STATUS_CONFIG[conv.status];
            const lastMsg = conv.messages[conv.messages.length - 1];
            const isSelected = selected?.id === conv.id;

            return (
              <button key={conv.id} onClick={() => setSelected(conv)}
                className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-colors hover:bg-gray-50 ${isSelected ? 'bg-pink-50 border-l-2 border-l-pink-400' : ''}`}>
                <div className="flex items-start gap-2.5">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-gray-500" />
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${stCfg.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-bold text-gray-900 truncate max-w-[130px]">
                        {conv.customerName ?? conv.customerPhone}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{SENTIMENT_ICON[conv.sentiment]}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate leading-relaxed">
                      {lastMsg?.content.slice(0, 50) ?? 'No messages'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {conv.intent && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${INTENT_COLORS[conv.intent]}`}>
                          {INTENT_LABELS[conv.intent]}
                        </span>
                      )}
                      {conv.activeOrderId && (
                        <span className="text-[9px] text-gray-400">{conv.activeOrderId}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right panel — conversation detail */}
      {selectedConv ? (
        <div className="hidden md:flex flex-1 flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="font-bold text-gray-900">{selectedConv.customerName ?? selectedConv.customerPhone}</h2>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_CONFIG[selectedConv.status].badge}`}>
                  {STATUS_CONFIG[selectedConv.status].label}
                </span>
                {selectedConv.activeOrderId && (
                  <button onClick={() => router.push(`/admin/orders/${selectedConv.activeOrderId}`)}
                    className="text-[10px] font-bold text-pink-600 hover:underline">
                    {selectedConv.activeOrderId}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">{selectedConv.customerPhone}</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedConv.status !== 'resolved' && (
                <>
                  <button onClick={() => { takeOverConversation(selectedConv.id); showToast('Human takeover activated'); }}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600">
                    <User size={12} /> Take Over
                  </button>
                  <button onClick={() => { resolveConversation(selectedConv.id); showToast('Conversation resolved'); }}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                    <CheckCircle size={12} /> Resolve
                  </button>
                </>
              )}
              <button onClick={() => router.push(`/admin/conversations/${selectedConv.id}`)}
                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-pink-600 px-2 py-1.5">
                Full View <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Summary bar */}
          {selectedConv.summary && (
            <div className="bg-blue-50 border-b border-blue-100 px-5 py-2 flex items-start gap-2">
              <Bot size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">{selectedConv.summary}</p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {selectedConv.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'customer' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                  msg.role === 'customer'
                    ? 'bg-white border border-gray-100 text-gray-800'
                    : 'text-white'
                }`} style={msg.role !== 'customer' ? { background: 'linear-gradient(135deg, #c2185b, #e91e8c)' } : {}}>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  {msg.agentName && (
                    <div className="flex items-center gap-1 mt-1.5 opacity-70">
                      <Bot size={9} />
                      <span className="text-[9px] font-semibold">{msg.agentName}</span>
                    </div>
                  )}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.toolCalls.map((tc, i) => (
                        <div key={i} className="bg-white/20 rounded-lg px-2 py-1">
                          <span className="text-[9px] font-mono opacity-80">⚙ {tc.name} · {tc.durationMs}ms</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[9px] opacity-60 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply box */}
          <div className="bg-white border-t border-gray-100 px-5 py-3">
            {selectedConv.status === 'waiting_human' ? (
              <div className="flex items-center gap-2">
                <input value={replyText} onChange={e => setReplyText(e.target.value)}
                  placeholder="Type a manual reply…"
                  className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-pink-200"
                  onKeyDown={e => e.key === 'Enter' && handleReply()} />
                <button onClick={handleReply}
                  className="p-2 rounded-xl text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                  <Send size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Bot size={13} className="text-pink-400" />
                <span>Agent is handling this conversation. Click &ldquo;Take Over&rdquo; to send manual replies.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-300">
          <div className="text-center">
            <MessageCircle size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">Select a conversation to view</p>
          </div>
        </div>
      )}
    </div>
  );
}
