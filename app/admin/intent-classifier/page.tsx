'use client';

import { useState } from 'react';
import { useAgent } from '@/lib/agent-context';
import { INTENT_LABELS, INTENT_COLORS, type IntentType } from '@/lib/agents/types';
import {
  Brain, Zap, TrendingUp, AlertOctagon, CheckCircle,
  Play, Pause, Settings, Download, RefreshCw,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';

// ── Mock classification stream ─────────────────────────────────────────────

interface ClassifiedMessage {
  id: string;
  time: string;
  message: string;
  intent: IntentType;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  route: string;
  status: 'routed' | 'escalated' | 'review';
}

const LIVE_STREAM: ClassifiedMessage[] = [
  { id: 'cl1', time: '2:32 PM', message: 'I need laundry pickup today for my shirts and suits', intent: 'new_order', sentiment: 'positive', confidence: 97, route: 'Customer Order Agent', status: 'routed' },
  { id: 'cl2', time: '2:29 PM', message: 'How much does dry cleaning cost for a kandura?', intent: 'pricing_inquiry', sentiment: 'neutral', confidence: 93, route: 'Customer Order Agent', status: 'routed' },
  { id: 'cl3', time: '2:15 PM', message: 'My order LK-AE-1020 was supposed to arrive 3 hours ago!', intent: 'complaint', sentiment: 'negative', confidence: 99, route: 'Human Escalation Agent', status: 'escalated' },
  { id: 'cl4', time: '2:10 PM', message: 'Can you check my order status? LK-AE-1023', intent: 'order_status', sentiment: 'neutral', confidence: 95, route: 'Customer Order Agent', status: 'routed' },
  { id: 'cl5', time: '1:55 PM', message: 'I want a refund, your driver never showed up', intent: 'refund_request', sentiment: 'negative', confidence: 98, route: 'Human Escalation Agent', status: 'escalated' },
  { id: 'cl6', time: '1:48 PM', message: 'Do you offer laundry services in Sharjah?', intent: 'service_inquiry', sentiment: 'neutral', confidence: 88, route: 'Customer Order Agent', status: 'routed' },
  { id: 'cl7', time: '1:35 PM', message: 'Good morning, weekly hotel pickup as usual', intent: 'new_order', sentiment: 'positive', confidence: 96, route: 'Customer Order Agent', status: 'routed' },
  { id: 'cl8', time: '1:20 PM', message: 'Are you hiring drivers in Abu Dhabi?', intent: 'job_inquiry', sentiment: 'neutral', confidence: 91, route: 'Human Handoff', status: 'routed' },
  { id: 'cl9', time: '1:15 PM', message: 'I have a laundry facility in Dubai Marina and want to partner with you', intent: 'facility_partner_inquiry', sentiment: 'positive', confidence: 89, route: 'Sales Team', status: 'routed' },
  { id: 'cl10', time: '1:00 PM', message: 'Can I speak to someone please?', intent: 'human_required', sentiment: 'neutral', confidence: 94, route: 'Human Escalation Agent', status: 'escalated' },
  { id: 'cl11', time: '12:45 PM', message: 'dfhakjfhakjhf', intent: 'unknown', sentiment: 'neutral', confidence: 45, route: 'Review Queue', status: 'review' },
  { id: 'cl12', time: '12:30 PM', message: 'We are a gym and need bulk laundry services', intent: 'sales_inquiry', sentiment: 'positive', confidence: 92, route: 'Sales Team', status: 'routed' },
];

const INTENT_DIST = [
  { name: 'New Order', value: 48, color: '#FF4FA3', intent: 'new_order' },
  { name: 'Order Status', value: 22, color: '#3b82f6', intent: 'order_status' },
  { name: 'Pricing', value: 12, color: '#8b5cf6', intent: 'pricing_inquiry' },
  { name: 'Complaint', value: 9, color: '#ef4444', intent: 'complaint' },
  { name: 'Service Inquiry', value: 5, color: '#f59e0b', intent: 'service_inquiry' },
  { name: 'Refund', value: 4, color: '#f97316', intent: 'refund_request' },
];

const SENTIMENT_TREND = [
  { day: 'Mon', positive: 72, neutral: 18, negative: 10 },
  { day: 'Tue', positive: 68, neutral: 22, negative: 10 },
  { day: 'Wed', positive: 75, neutral: 17, negative: 8 },
  { day: 'Thu', positive: 70, neutral: 20, negative: 10 },
  { day: 'Fri', positive: 80, neutral: 14, negative: 6 },
  { day: 'Sat', positive: 76, neutral: 16, negative: 8 },
  { day: 'Today', positive: 74, neutral: 19, negative: 7 },
];

const CONFIDENCE_DIST = [
  { range: '90–100%', count: 198 },
  { range: '80–89%', count: 67 },
  { range: '70–79%', count: 28 },
  { range: '60–69%', count: 12 },
  { range: '<60%', count: 7 },
];

const STATUS_CFG = {
  routed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Routed' },
  escalated: { bg: 'bg-red-100', text: 'text-red-700', label: 'Escalated' },
  review: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Review' },
};

const SENTIMENT_CFG = {
  positive: { bg: 'bg-green-100', text: 'text-green-700', icon: '😊' },
  neutral: { bg: 'bg-gray-100', text: 'text-gray-600', icon: '😐' },
  negative: { bg: 'bg-red-100', text: 'text-red-700', icon: '😠' },
};

export default function IntentClassifierPage() {
  const { agentRuns } = useAgent();
  const [running, setRunning] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const classifierRuns = agentRuns.filter(r => r.agentName === 'Intent Classifier');
  const totalClassified = 312;
  const escalationsToday = LIVE_STREAM.filter(m => m.status === 'escalated').length;
  const avgConfidence = Math.round(LIVE_STREAM.reduce((s, m) => s + m.confidence, 0) / LIVE_STREAM.length);
  const successRate = classifierRuns.filter(r => r.status === 'success').length / Math.max(classifierRuns.length, 1) * 100;

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }}>
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Intent Classifier</h1>
            <p className="text-gray-500 text-sm">Conversation intelligence · Routing · Sentiment analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setRunning(!running); showToast(running ? 'Classifier paused' : 'Classifier resumed'); }}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all ${
              running ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            }`}
          >
            {running ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Resume</>}
          </button>
          <button
            onClick={() => showToast('Exported classification data')}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-pink-200"
          >
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => showToast('Classifier configuration opened')}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg, #FF4FA3, #D41472)' }}
          >
            <Settings size={13} /> Configure
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Classified Today', value: totalClassified.toString(), icon: Brain, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
          { label: 'Avg Confidence', value: `${avgConfidence}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Escalations Triggered', value: escalationsToday.toString(), icon: AlertOctagon, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Success Rate', value: `${Math.round(successRate || 97)}%`, icon: CheckCircle, color: 'text-pink-600', bg: 'bg-pink-50' },
        ].map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={17} className={color} />
              </div>
              {trend && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{trend}</span>}
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 ${running ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${running ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
        <p className={`text-sm font-semibold flex-1 min-w-0 ${running ? 'text-green-700' : 'text-amber-700'}`}>
          {running ? 'Classifier is running — processing messages in real-time' : 'Classifier paused — messages queued for processing'}
        </p>
        <Zap size={14} className={running ? 'text-green-500 ml-auto' : 'text-amber-500 ml-auto'} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Intent distribution donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Brain size={14} className="text-pink-500" /> Intent Distribution
          </h3>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={110} height={110}>
              <PieChart>
                <Pie data={INTENT_DIST} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={2}>
                  {INTENT_DIST.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={{ borderRadius: '8px', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {INTENT_DIST.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-[10px] text-gray-600 flex-1">{d.name}</span>
                  <span className="text-[10px] font-bold text-gray-800">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sentiment trend */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-pink-500" /> Sentiment Trend (7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={SENTIMENT_TREND}>
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

      {/* Confidence distribution + escalation triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Confidence Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={CONFIDENCE_DIST} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: 11 }} />
              <Bar dataKey="count" fill="#FF4FA3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Escalation Triggers</h3>
          <div className="space-y-3">
            {[
              { label: 'Complaint', count: 28, pct: 9, color: '#ef4444' },
              { label: 'Refund Request', count: 12, pct: 4, color: '#f97316' },
              { label: 'Human Required', count: 8, pct: 3, color: '#8b5cf6' },
              { label: 'Unknown Intent', count: 7, pct: 2, color: '#6b7280' },
            ].map(({ label, count, pct, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{label}</span>
                  <span className="text-xs font-bold text-gray-800">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct * 8}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live classification stream */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${running ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <h3 className="text-sm font-bold text-gray-800">Live Classification Stream</h3>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{LIVE_STREAM.length} messages</span>
          </div>
          <button
            onClick={() => showToast('Refreshed classification stream')}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Time', 'Message', 'Intent', 'Sentiment', 'Confidence', 'Route', 'Status'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {LIVE_STREAM.map(msg => {
                const stCfg = STATUS_CFG[msg.status];
                const sentCfg = SENTIMENT_CFG[msg.sentiment];
                const intColor = INTENT_COLORS[msg.intent] ?? 'bg-gray-100 text-gray-600';
                const confColor = msg.confidence >= 90 ? 'text-green-600' : msg.confidence >= 75 ? 'text-amber-600' : 'text-red-600';
                return (
                  <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{msg.time}</td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="text-xs text-gray-700 truncate">{msg.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${intColor}`}>
                        {INTENT_LABELS[msg.intent] ?? msg.intent}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sentCfg.bg} ${sentCfg.text}`}>
                        {sentCfg.icon} {msg.sentiment}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${confColor}`}>{msg.confidence}%</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{msg.route}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stCfg.bg} ${stCfg.text}`}>
                        {stCfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
