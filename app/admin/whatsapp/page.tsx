'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Send, User, Bot, CheckCircle,
  AlertOctagon, Clock, MessageCircle, Phone,
  UserCog, ChevronRight, ChevronLeft, Truck, Package, Star,
  StickyNote, Zap, type LucideIcon,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

type Sentiment = 'positive' | 'neutral' | 'negative';
type Priority = 'high' | 'medium' | 'low';
type ConvStatus = 'active' | 'escalated' | 'waiting_human' | 'resolved';

interface WaMessage {
  id: string;
  role: 'customer' | 'agent' | 'human';
  content: string;
  time: string;
  read?: boolean;
}

interface WaConversation {
  id: string;
  customer: string;
  phone: string;
  lastMsg: string;
  time: string;
  intent: string;
  sentiment: Sentiment;
  priority: Priority;
  status: ConvStatus;
  orderId?: string;
  unread?: number;
  messages: WaMessage[];
  customerProfile: {
    joinedAt: string;
    totalOrders: number;
    totalSpent: number;
    tier: string;
    location: string;
  };
  activeOrder?: {
    id: string;
    service: string;
    status: string;
    driver?: string;
    eta: string;
    amount: number;
  };
}

// ── Mock data ──────────────────────────────────────────────────────────────

const CONVERSATIONS: WaConversation[] = [
  {
    id: 'c1',
    customer: 'Humaid Al Mansoori',
    phone: '+971 50 XXX 5566',
    lastMsg: 'Yes, confirm the 6PM pickup please',
    time: '2:32 PM',
    intent: 'New Order',
    sentiment: 'positive',
    priority: 'medium',
    status: 'active',
    orderId: 'LK-AE-1024',
    unread: 0,
    customerProfile: { joinedAt: 'Jun 2023', totalOrders: 12, totalSpent: 1890, tier: 'VIP', location: 'Dubai Marina' },
    activeOrder: { id: 'LK-AE-1024', service: 'Wash & Fold + Dry Cleaning', status: 'Driver Assigned', driver: 'Ahmed Khan', eta: 'Today 6–8 PM', amount: 145 },
    messages: [
      { id: 'm1', role: 'customer', content: 'Hi, I need laundry pickup today.', time: '2:28 PM' },
      { id: 'm2', role: 'agent', content: 'Hi Humaid! Welcome to LaundryKhalas 👋\n\nWhich service do you need today?\n• Wash & Fold (AED 8/kg)\n• Dry Cleaning (AED 15/item)\n• Ironing (AED 7/item)\n• Blankets & Duvets (AED 45/item)', time: '2:28 PM' },
      { id: 'm3', role: 'customer', content: 'Wash and fold plus dry cleaning.', time: '2:29 PM' },
      { id: 'm4', role: 'agent', content: 'Great choice! What items would you like us to collect?', time: '2:29 PM' },
      { id: 'm5', role: 'customer', content: '6 shirts, 3 trousers, 1 suit, and 1 duvet.', time: '2:30 PM' },
      { id: 'm6', role: 'agent', content: 'Got it! Please confirm your pickup address.', time: '2:30 PM' },
      { id: 'm7', role: 'customer', content: 'Marina Heights, Apartment 1204, Dubai Marina.', time: '2:31 PM' },
      { id: 'm8', role: 'agent', content: 'When would you like us to collect?\n• Today 4:00 PM – 6:00 PM\n• Today 6:00 PM – 8:00 PM', time: '2:31 PM' },
      { id: 'm9', role: 'customer', content: 'Yes, confirm the 6PM pickup please', time: '2:32 PM' },
      { id: 'm10', role: 'agent', content: '✅ Order Confirmed!\n\nOrder ID: LK-AE-1024\nService: Wash & Fold + Dry Cleaning\nPickup: Apt 1204, Marina Heights, Dubai Marina\nSlot: Today 6:00 PM – 8:00 PM\nEstimated: AED 145\n\nDriver Ahmed Khan will be with you shortly! 🚐', time: '2:32 PM' },
    ],
  },
  {
    id: 'c2',
    customer: 'Omar Farhan',
    phone: '+971 52 XXX 3310',
    lastMsg: 'My order was supposed to arrive 3 hours ago!',
    time: '1:15 PM',
    intent: 'Complaint',
    sentiment: 'negative',
    priority: 'high',
    status: 'escalated',
    orderId: 'LK-AE-1020',
    unread: 1,
    customerProfile: { joinedAt: 'Jan 2024', totalOrders: 3, totalSpent: 285, tier: 'Standard', location: 'Business Bay' },
    activeOrder: { id: 'LK-AE-1020', service: 'Dry Cleaning', status: 'Delayed', eta: 'Overdue by 3h', amount: 95 },
    messages: [
      { id: 'm1', role: 'customer', content: 'My order LK-AE-1020 was supposed to arrive 3 hours ago. This is completely unacceptable!', time: '1:15 PM' },
      { id: 'm2', role: 'agent', content: 'We sincerely apologize for the inconvenience. A member of our team will review your case and contact you personally within the next 30 minutes. We take every complaint seriously and will make this right.', time: '1:15 PM' },
      { id: 'm3', role: 'customer', content: 'My order was supposed to arrive 3 hours ago!', time: '1:18 PM' },
    ],
  },
  {
    id: 'c3',
    customer: 'Jumeirah Grand Hotel',
    phone: '+971 4 XXX 5500',
    lastMsg: 'Perfect, thank you.',
    time: '6:56 AM',
    intent: 'B2B Order',
    sentiment: 'positive',
    priority: 'medium',
    status: 'resolved',
    orderId: 'LK-AE-1026',
    unread: 0,
    customerProfile: { joinedAt: 'Feb 2023', totalOrders: 89, totalSpent: 112000, tier: 'Enterprise', location: 'Jumeirah Beach Road' },
    activeOrder: { id: 'LK-AE-1026', service: 'Business Laundry (400 items)', status: 'Collected', driver: 'Team Driver 03', eta: 'Delivery by 6AM', amount: 2800 },
    messages: [
      { id: 'm1', role: 'customer', content: 'Good morning, this is the Jumeirah Grand Hotel. Weekly pickup as usual today.', time: '6:55 AM' },
      { id: 'm2', role: 'agent', content: 'Good morning! Weekly pickup confirmed for Jumeirah Grand Hotel. Today 7:00 AM – 9:00 AM. Order LK-AE-1026 created.\n\nNote: Premium fragrance on all linen per standing instruction. Driver will be with your team shortly.', time: '6:55 AM' },
      { id: 'm3', role: 'customer', content: 'Perfect, thank you.', time: '6:56 AM' },
    ],
  },
  {
    id: 'c4',
    customer: 'Priya Kumar',
    phone: '+971 55 XXX 9912',
    lastMsg: 'Yes please, can I book for tomorrow morning?',
    time: '9:08 AM',
    intent: 'Pricing Inquiry',
    sentiment: 'neutral',
    priority: 'low',
    status: 'active',
    unread: 2,
    customerProfile: { joinedAt: 'Nov 2023', totalOrders: 2, totalSpent: 140, tier: 'Standard', location: 'Downtown Dubai' },
    messages: [
      { id: 'm1', role: 'customer', content: 'Hi, how much does dry cleaning cost? I have a formal gown and 2 suits.', time: '9:05 AM' },
      { id: 'm2', role: 'agent', content: 'Hi! Our dry cleaning prices:\n\n• Gown / formal dress: AED 35–55\n• Suit (2-piece): AED 30\n• Suit (3-piece): AED 40\n\nAll include free pickup and delivery. Turnaround: 24–48 hours.\n\nWould you like to book a pickup?', time: '9:05 AM' },
      { id: 'm3', role: 'customer', content: 'Yes please, can I book for tomorrow morning?', time: '9:08 AM' },
    ],
  },
];

const FILTERS: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: 'all', label: 'All', icon: MessageCircle },
  { id: 'active', label: 'Active', icon: Zap },
  { id: 'escalated', label: 'Escalated', icon: AlertOctagon },
  { id: 'waiting_human', label: 'Human Queue', icon: UserCog },
  { id: 'resolved', label: 'Resolved', icon: CheckCircle },
];

const SENTIMENT_CFG: Record<Sentiment, { bg: string; text: string; emoji: string }> = {
  positive: { bg: 'bg-green-100', text: 'text-green-700', emoji: '😊' },
  neutral: { bg: 'bg-gray-100', text: 'text-gray-600', emoji: '😐' },
  negative: { bg: 'bg-red-100', text: 'text-red-700', emoji: '😠' },
};

const STATUS_CFG: Record<ConvStatus, { dot: string; badge: string; label: string }> = {
  active: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', label: 'Active' },
  escalated: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700', label: 'Escalated' },
  waiting_human: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Human Queue' },
  resolved: { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500', label: 'Resolved' },
};

const PRIORITY_CFG: Record<Priority, string> = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low: 'bg-gray-100 text-gray-500',
};

// ── Mock send function (replace with real API later) ─────────────────────

function sendWhatsAppHumanReply(conversationId: string, message: string): Promise<{ sent: boolean }> {
  console.log(`[WhatsApp] Human reply to ${conversationId}: ${message}`);
  return Promise.resolve({ sent: true });
}

// ── Component ──────────────────────────────────────────────────────────────

export default function WhatsAppAgentPage() {
  const router = useRouter();
  const [convs, setConvs] = useState<WaConversation[]>(CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>(CONVERSATIONS[0].id);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [note, setNote] = useState('');
  const [tab, setTab] = useState<'chat' | 'notes'>('chat');
  const [toast, setToast] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = convs.find(c => c.id === activeId) ?? convs[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, convs]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const filtered = convs.filter(c => {
    const matchFilter = filter === 'all' || c.status === filter;
    const matchSearch = !search || c.customer.toLowerCase().includes(search.toLowerCase()) || (c.orderId ?? '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleSendReply = async () => {
    if (!reply.trim() || !active) return;
    setSending(true);
    await sendWhatsAppHumanReply(active.id, reply);
    const newMsg: WaMessage = { id: `hm-${Date.now()}`, role: 'human', content: reply, time: new Date().toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' }) };
    setConvs(prev => prev.map(c => c.id === active.id ? { ...c, messages: [...c.messages, newMsg], status: 'waiting_human' } : c));
    setReply('');
    setSending(false);
    showToast('Reply sent via WhatsApp');
  };

  const handleTakeover = () => {
    setConvs(prev => prev.map(c => c.id === active.id ? { ...c, status: 'waiting_human' } : c));
    showToast('Human takeover enabled — replies will go directly to customer');
  };

  const handleResolve = () => {
    setConvs(prev => prev.map(c => c.id === active.id ? { ...c, status: 'resolved' } : c));
    showToast('Conversation resolved');
  };

  return (
    <div className="flex h-[calc(100vh-52px)] md:h-screen overflow-hidden bg-gray-50 relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-in fade-in">
          {toast}
        </div>
      )}

      {/* ── Left: Conversation Inbox ── */}
      <div className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex flex-1'} md:flex md:w-80 md:flex-shrink-0 md:flex-none bg-white border-r border-gray-100 flex-col h-full`}>
        {/* Inbox header */}
        <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-bold text-gray-900">WhatsApp Agent</h1>
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full border border-green-100">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Online
            </div>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-pink-200"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 px-3 py-2.5 border-b border-gray-50 overflow-x-auto flex-shrink-0">
          {FILTERS.map(({ id, label }) => {
            const count = id === 'all' ? convs.length : convs.filter(c => c.status === id).length;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                  filter === id ? 'text-white border-transparent' : 'bg-white text-gray-500 border-gray-100 hover:border-pink-100'
                }`}
                style={filter === id ? { background: 'linear-gradient(135deg, #FF4FA3, #D41472)' } : {}}
              >
                {label}{count > 0 && ` (${count})`}
              </button>
            );
          })}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.map(conv => {
            const stCfg = STATUS_CFG[conv.status];
            const sentCfg = SENTIMENT_CFG[conv.sentiment];
            const isActive = conv.id === activeId;
            return (
              <button
                key={conv.id}
                onClick={() => { setActiveId(conv.id); setMobileView('chat'); }}
                className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-gray-50 ${isActive ? 'bg-pink-50 border-l-2 border-[#FF4FA3]' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #128C7E, #075E54)' }}>
                      {conv.customer.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${stCfg.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-bold text-gray-900 truncate max-w-[140px]">{conv.customer}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {conv.unread && conv.unread > 0 ? (
                          <span className="text-[9px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }}>
                            {conv.unread}
                          </span>
                        ) : null}
                        <span className="text-[10px] text-gray-400">{conv.time}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mb-1.5">{conv.lastMsg}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sentCfg.bg} ${sentCfg.text}`}>
                        {sentCfg.emoji} {conv.sentiment}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_CFG[conv.priority]}`}>
                        {conv.priority}
                      </span>
                      {conv.orderId && (
                        <span className="text-[9px] text-pink-600 font-bold">{conv.orderId}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <MessageCircle size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Center: Chat Thread ── */}
      <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col h-full min-w-0 border-r border-gray-100`}>
        {/* Chat header */}
        <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600"
              onClick={() => setMobileView('list')}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #128C7E, #075E54)' }}>
              {active.customer.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900 text-sm">{active.customer}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_CFG[active.status].badge}`}>
                  {STATUS_CFG[active.status].label}
                </span>
                {active.intent && (
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {active.intent}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{active.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {active.status !== 'resolved' && (
              <>
                <button onClick={handleTakeover}
                  className="flex items-center gap-1.5 text-xs font-bold px-2 md:px-3 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                  <UserCog size={13} /> <span className="hidden sm:inline">Take Over</span>
                </button>
                <button onClick={handleResolve}
                  className="flex items-center gap-1.5 text-xs font-bold px-2 md:px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                  <CheckCircle size={13} /> <span className="hidden sm:inline">Resolve</span>
                </button>
              </>
            )}
            {active.orderId && (
              <button onClick={() => router.push(`/admin/orders/${active.orderId}`)}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200">
                <Package size={13} />
                {active.orderId}
              </button>
            )}
          </div>
        </div>

        {/* Suggested reply for escalated */}
        {active.sentiment === 'negative' && active.status !== 'resolved' && (
          <div className="bg-red-50 border-b border-red-100 px-5 py-2.5 flex items-start gap-2.5 flex-shrink-0">
            <AlertOctagon size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-700">Negative sentiment detected</p>
              <p className="text-[11px] text-red-600">Customer appears frustrated. Consider taking over and offering compensation.</p>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex bg-white border-b border-gray-100 px-5 flex-shrink-0">
          {(['chat', 'notes'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-semibold px-4 py-2.5 border-b-2 transition-colors capitalize ${
                tab === t
                  ? 'border-[#FF4FA3] text-[#D41472]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'chat' ? 'Chat Thread' : 'Internal Notes'}
            </button>
          ))}
        </div>

        {/* Messages */}
        {tab === 'chat' ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ background: '#f0f2f5' }}>
              {active.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  {msg.role === 'customer' && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold mr-2 mt-1 flex-shrink-0 self-end"
                      style={{ background: 'linear-gradient(135deg, #128C7E, #075E54)' }}>
                      {active.customer[0]}
                    </div>
                  )}
                  <div className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                    msg.role === 'customer'
                      ? 'bg-white text-gray-800 rounded-tl-sm'
                      : msg.role === 'human'
                      ? 'text-white rounded-tr-sm'
                      : 'text-white rounded-tr-sm'
                  }`}
                    style={msg.role === 'agent'
                      ? { background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }
                      : msg.role === 'human'
                      ? { background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }
                      : {}
                    }>
                    {(msg.role === 'agent' || msg.role === 'human') && (
                      <div className="flex items-center gap-1 mb-1 opacity-75">
                        {msg.role === 'agent' ? <Bot size={10} /> : <User size={10} />}
                        <span className="text-[9px] font-bold">{msg.role === 'agent' ? 'AI Agent' : 'Human Staff'}</span>
                      </div>
                    )}
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[9px] mt-1 text-right ${msg.role === 'customer' ? 'text-gray-400' : 'text-white/60'}`}>
                      {msg.time}
                      {msg.role !== 'customer' && <span className="ml-1">✓✓</span>}
                    </p>
                  </div>
                  {msg.role === 'agent' && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center ml-2 mt-1 flex-shrink-0 self-end"
                      style={{ background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }}>
                      <Bot size={12} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Reply box */}
            <div className="bg-white border-t border-gray-100 px-5 py-3.5 flex-shrink-0">
              {active.status === 'waiting_human' ? (
                <div className="flex items-center gap-3">
                  <input
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                    placeholder="Type a WhatsApp reply as team member…"
                    className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-pink-200"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!reply.trim() || sending}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Bot size={13} className="text-pink-400" />
                  <span>AI Agent is managing this conversation.</span>
                  <button
                    onClick={handleTakeover}
                    className="text-pink-600 font-semibold hover:underline"
                  >
                    Take Over
                  </button>
                  <span>to send manual replies.</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
              <StickyNote size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">Internal notes are visible only to team members. Not sent to customer.</p>
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add an internal note about this conversation…"
              rows={4}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 outline-none resize-none focus:border-pink-200 mb-2"
            />
            <button
              onClick={() => { showToast('Internal note saved'); setNote(''); }}
              className="text-xs font-bold px-4 py-2 rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }}
            >
              Save Note
            </button>
          </div>
        )}
      </div>

      {/* ── Right: Context Panel ── */}
      <div className="w-72 flex-shrink-0 bg-white border-l border-gray-100 flex flex-col h-full overflow-y-auto hidden xl:flex">
        <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Customer Profile</h3>
          <div className="flex items-center gap-2.5 mt-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }}>
              {active.customer.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{active.customer}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active.customerProfile.tier === 'VIP' ? 'bg-amber-100 text-amber-700' :
                  active.customerProfile.tier === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{active.customerProfile.tier}</span>
                <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
                  <Star size={10} fill="currentColor" /> 4.8
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { label: 'Total Orders', value: active.customerProfile.totalOrders },
              { label: 'Total Spent', value: `AED ${active.customerProfile.totalSpent.toLocaleString()}` },
              { label: 'Location', value: active.customerProfile.location },
              { label: 'Since', value: active.customerProfile.joinedAt },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-[10px] text-gray-400">{label}</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active order */}
        {active.activeOrder && (
          <div className="px-4 py-4 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <Package size={13} className="text-pink-500" /> Active Order
            </h3>
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-700">{active.activeOrder.id}</span>
                <button onClick={() => router.push(`/admin/orders/${active.activeOrder!.id}`)}
                  className="text-[10px] text-pink-600 hover:underline flex items-center gap-0.5">
                  View <ChevronRight size={10} />
                </button>
              </div>
              <p className="text-xs text-gray-700 font-medium">{active.activeOrder.service}</p>
              <div className="text-[11px] text-gray-500 space-y-1">
                <p>Status: <span className="font-semibold text-gray-700">{active.activeOrder.status}</span></p>
                {active.activeOrder.driver && <p>Driver: <span className="font-semibold text-gray-700">{active.activeOrder.driver}</span></p>}
                <p>ETA: <span className="font-semibold text-gray-700">{active.activeOrder.eta}</span></p>
                <p>Amount: <span className="font-bold text-pink-700">AED {active.activeOrder.amount}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Human handoff */}
        <div className="px-4 py-4 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <UserCog size={13} className="text-amber-500" /> Handoff Controls
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleTakeover}
              className="w-full flex items-center gap-2 text-xs font-bold px-3 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 justify-center"
            >
              <UserCog size={13} /> Enable Human Takeover
            </button>
            <button
              onClick={handleResolve}
              className="w-full flex items-center gap-2 text-xs font-bold px-3 py-2.5 rounded-xl text-white justify-center hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
            >
              <CheckCircle size={13} /> Mark Resolved
            </button>
            <button
              onClick={() => router.push('/admin/escalations')}
              className="w-full flex items-center gap-2 text-xs font-bold px-3 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 justify-center"
            >
              <AlertOctagon size={13} /> View Escalations
            </button>
          </div>
        </div>

        {/* Agent AI context */}
        <div className="px-4 py-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <Bot size={13} className="text-blue-500" /> AI Agent Context
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Intent', value: active.intent },
              { label: 'Sentiment', value: `${SENTIMENT_CFG[active.sentiment].emoji} ${active.sentiment}` },
              { label: 'Status', value: STATUS_CFG[active.status].label },
              { label: 'Priority', value: active.priority },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[11px] text-gray-500">{label}</span>
                <span className="text-[11px] font-semibold text-gray-700 capitalize">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 bg-blue-50 rounded-xl p-2.5">
            <Clock size={12} className="text-blue-500 flex-shrink-0" />
            <p className="text-[11px] text-blue-700">AI last responded at {active.messages[active.messages.length - 1]?.time ?? '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
