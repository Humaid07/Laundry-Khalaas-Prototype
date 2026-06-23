'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageCircle, CheckCircle, AlertTriangle, UserCog, Package,
  Truck, TrendingUp, Clock, BarChart2, Brain, Activity, type LucideIcon
} from 'lucide-react';
import { AGENT_CONVERSATION } from '@/lib/mock-data';
import { useApp } from '@/lib/app-context';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const CONVERSATIONS = [
  { id: 'conv1', customer: 'Humaid Al Mansoori', lastMsg: 'Yes, confirm pickup', intent: 'New booking', sentiment: 'Positive', orderId: 'LK-AE-1024', status: 'order_created', time: '2:32 PM', channel: 'WA' },
  { id: 'conv2', customer: 'Layla Ahmed', lastMsg: 'Can I reschedule my pickup?', intent: 'Reschedule', sentiment: 'Neutral', orderId: null, status: 'open', time: '1:48 PM', channel: 'WA' },
  { id: 'conv3', customer: 'Omar Farhan', lastMsg: 'My order is delayed!', intent: 'Complaint', sentiment: 'Negative', orderId: 'LK-AE-1020', status: 'escalated', time: '1:15 PM', channel: 'WA' },
  { id: 'conv4', customer: 'Jumeirah Hotel', lastMsg: 'Weekly pickup confirmed', intent: 'B2B order', sentiment: 'Positive', orderId: 'LK-AE-1026', status: 'order_created', time: '9:05 AM', channel: 'WA' },
];

const PERF_STATS = [
  { label: 'Containment Rate', value: '83%', sub: 'Resolved without escalation', color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Avg Handle Time', value: '4.2 min', sub: 'From first message to resolution', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Booking Conversion', value: '78%', sub: 'Conversations → confirmed orders', color: 'text-pink-600', bg: 'bg-pink-50' },
  { label: 'Escalation Rate', value: '17%', sub: 'Routed to human agents', color: 'text-amber-600', bg: 'bg-amber-50' },
];

const hourlyData = [
  { hour: '8AM', convs: 4 }, { hour: '9AM', convs: 9 }, { hour: '10AM', convs: 14 },
  { hour: '11AM', convs: 11 }, { hour: '12PM', convs: 18 }, { hour: '1PM', convs: 22 },
  { hour: '2PM', convs: 19 }, { hour: '3PM', convs: 16 }, { hour: '4PM', convs: 21 },
  { hour: '5PM', convs: 28 }, { hour: '6PM', convs: 24 }, { hour: '7PM', convs: 17 },
];

const intentData = [
  { name: 'New Booking', value: 48, color: '#e91e8c' },
  { name: 'Order Status', value: 22, color: '#3b82f6' },
  { name: 'Reschedule', value: 14, color: '#f59e0b' },
  { name: 'Complaint', value: 9, color: '#ef4444' },
  { name: 'General Inquiry', value: 7, color: '#8b5cf6' },
];

const sentimentTrend = [
  { day: 'Mon', positive: 72, neutral: 18, negative: 10 },
  { day: 'Tue', positive: 68, neutral: 22, negative: 10 },
  { day: 'Wed', positive: 75, neutral: 17, negative: 8 },
  { day: 'Thu', positive: 70, neutral: 20, negative: 10 },
  { day: 'Fri', positive: 80, neutral: 14, negative: 6 },
  { day: 'Sat', positive: 76, neutral: 16, negative: 8 },
  { day: 'Sun', positive: 74, neutral: 19, negative: 7 },
];

const TOP_PHRASES = [
  { phrase: 'pickup today', count: 89 },
  { phrase: 'dry cleaning', count: 67 },
  { phrase: 'when will', count: 54 },
  { phrase: 'reschedule', count: 43 },
  { phrase: 'tracking', count: 38 },
  { phrase: 'hotel linen', count: 31 },
];

type Tab = 'conversations' | 'performance' | 'intelligence';

export default function AdminAgentPage() {
  const router = useRouter();
  const { assignDriver } = useApp();
  const [activeConv, setActiveConv] = useState(CONVERSATIONS[0]);
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<Tab>('conversations');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const handleApprove = () => showToast('Order confirmed and customer notified');
  const handleAssignDriver = () => { assignDriver('LK-AE-1024', 'd1'); showToast('Ahmed Khan assigned to LK-AE-1024'); };
  const handleTakeover = () => showToast('Human agent takeover initiated');

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Intelligence</h1>
          <p className="text-gray-500 text-sm">Live channel monitoring · 4 open threads</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-xs text-gray-600 font-medium">Agent Online</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-5 w-fit">
        {([
          { id: 'conversations', label: 'Conversations', icon: MessageCircle },
          { id: 'performance', label: 'Agent Performance', icon: Activity },
          { id: 'intelligence', label: 'Conversation Intelligence', icon: Brain },
        ] as { id: Tab; label: string; icon: LucideIcon }[]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === id ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={tab === id ? { background: 'linear-gradient(135deg, #c2185b, #e91e8c)' } : {}}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {tab === 'conversations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-800 text-sm">{CONVERSATIONS.length} Conversations</p>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">1 Escalated</span>
            </div>
            <div className="divide-y divide-gray-50">
              {CONVERSATIONS.map(conv => (
                <button key={conv.id} onClick={() => setActiveConv(conv)}
                  className={`w-full px-4 py-3.5 text-left hover:bg-gray-50 transition-colors ${activeConv.id === conv.id ? 'bg-pink-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #128C7E, #075E54)' }}>
                      {conv.customer.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-bold text-gray-800 truncate">{conv.customer}</p>
                        <span className="text-[10px] text-gray-400">{conv.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">{conv.lastMsg}</p>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          conv.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                          conv.sentiment === 'Negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>{conv.sentiment}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          conv.status === 'escalated' ? 'bg-red-100 text-red-700' :
                          conv.status === 'order_created' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>{conv.status === 'order_created' ? 'Order Created' : conv.status === 'escalated' ? 'Escalated' : 'Open'}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div>
                  <p className="font-bold text-gray-800">{activeConv.customer}</p>
                  <p className="text-gray-500 text-xs">{activeConv.intent} · WhatsApp</p>
                </div>
                <div className="flex gap-2 ml-auto flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    activeConv.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                    activeConv.sentiment === 'Negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>{activeConv.sentiment}</span>
                  {activeConv.orderId && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-700">
                      {activeConv.orderId}
                    </span>
                  )}
                </div>
              </div>
              {activeConv.id === 'conv1' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3">
                  <p className="text-xs font-bold text-gray-700 mb-1">Recommended Action</p>
                  <p className="text-xs text-gray-600">Order LK-AE-1024 confirmed. Ahmed Khan is 1.2 km away and available — assign now for optimal ETA.</p>
                </div>
              )}
              {activeConv.id === 'conv3' && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={12} className="text-red-600" />
                    <p className="text-xs font-bold text-red-700">Negative Sentiment Detected</p>
                  </div>
                  <p className="text-xs text-red-600">Delay complaint — recommend human takeover and proactive compensation offer.</p>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleApprove}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                  <CheckCircle size={13} /> Confirm Order
                </button>
                <button onClick={handleAssignDriver}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-blue-500 text-white">
                  <Truck size={13} /> Assign Driver
                </button>
                <button onClick={handleTakeover}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-amber-500 text-white">
                  <UserCog size={13} /> Take Over
                </button>
                {activeConv.orderId && (
                  <button onClick={() => router.push(`/admin/orders/${activeConv.orderId}`)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-gray-100 text-gray-700">
                    <Package size={13} /> View Order
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #128C7E, #075E54)' }}>
                <MessageCircle size={15} className="text-white" />
                <span className="text-white font-bold text-sm">Conversation Replay</span>
                <span className="ml-auto text-green-200 text-xs">AI Agent · Responding</span>
              </div>
              <div className="p-4 space-y-2 max-h-80 overflow-y-auto" style={{ background: '#e5ddd5' }}>
                {activeConv.id === 'conv1' ? AGENT_CONVERSATION.slice(0, 8).map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'agent' && (
                      <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white text-[10px] font-bold mr-1.5 mt-1 flex-shrink-0 self-end">LK</div>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm text-xs ${
                      msg.role === 'user' ? 'text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                    }`} style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #e91e8c, #f06292)' } : {}}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className={`text-[9px] mt-1 text-right ${msg.role === 'user' ? 'text-pink-100' : 'text-gray-400'}`}>{msg.timestamp}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500 text-sm">Select a conversation to view the replay</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'performance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PERF_STATS.map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <TrendingUp size={16} className={s.color} />
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">{s.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <Clock size={14} className="text-pink-500" /> Conversation Volume by Hour
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={hourlyData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: 12 }} />
                  <Bar dataKey="convs" fill="#e91e8c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <BarChart2 size={14} className="text-pink-500" /> Resolution Breakdown
              </h3>
              <div className="space-y-3 mt-2">
                {[
                  { label: 'Auto-resolved by AI', pct: 83, color: '#e91e8c' },
                  { label: 'Escalated to human', pct: 17, color: '#f59e0b' },
                  { label: 'Abandoned', pct: 4, color: '#ef4444' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{item.label}</span>
                      <span className="text-xs font-bold text-gray-800">{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">47</p>
                  <p className="text-[10px] text-gray-500">Auto-bookings today</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">72</p>
                  <p className="text-[10px] text-gray-500">CSAT score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'intelligence' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <Brain size={14} className="text-pink-500" /> Intent Distribution
              </h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={intentData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                      {intentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {intentData.map(s => (
                    <div key={s.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-xs text-gray-600 flex-1">{s.name}</span>
                      <span className="text-xs font-bold text-gray-800">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <Activity size={14} className="text-pink-500" /> Sentiment Trend (7 Days)
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={sentimentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: 11 }} />
                  <Line type="monotone" dataKey="positive" stroke="#22c55e" strokeWidth={2} dot={false} name="Positive" />
                  <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} dot={false} name="Neutral" />
                  <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={false} name="Negative" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-4">Top Customer Phrases</h3>
              <div className="space-y-2.5">
                {TOP_PHRASES.map((p, i) => (
                  <div key={p.phrase} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-4 text-right flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(p.count / 89) * 100}%`, background: 'linear-gradient(90deg, #c2185b, #e91e8c)' }} />
                    </div>
                    <span className="text-xs text-gray-700 font-medium w-28 truncate">&ldquo;{p.phrase}&rdquo;</span>
                    <span className="text-xs font-bold text-gray-500 w-8 text-right flex-shrink-0">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-4">Language Breakdown</h3>
              <div className="space-y-3">
                {[
                  { lang: 'English', pct: 58, flag: '🇬🇧' },
                  { lang: 'Arabic', pct: 27, flag: '🇦🇪' },
                  { lang: 'Hindi / Urdu', pct: 11, flag: '🇮🇳' },
                  { lang: 'Filipino', pct: 4, flag: '🇵🇭' },
                ].map(l => (
                  <div key={l.lang} className="flex items-center gap-3">
                    <span className="text-base flex-shrink-0">{l.flag}</span>
                    <span className="text-xs text-gray-600 w-24 flex-shrink-0">{l.lang}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${l.pct}%`, background: 'linear-gradient(90deg, #c2185b, #e91e8c)' }} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-8 text-right flex-shrink-0">{l.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
