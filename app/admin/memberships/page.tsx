'use client';

import { CreditCard, TrendingUp, Users, ArrowUpRight, Check } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const PLANS = [
  {
    id: 'lite',
    name: 'Khalaas Lite',
    price: 79,
    subscribers: 384,
    features: ['1 pickup / month', 'Wash & Fold only', 'Standard turnaround'],
    color: '#3b82f6',
    light: 'bg-blue-50',
    text: 'text-blue-700',
  },
  {
    id: 'regular',
    name: 'Khalaas Regular',
    price: 149,
    subscribers: 612,
    features: ['4 pickups / month', 'All services', 'Priority scheduling', '10% discount on extras'],
    color: '#e91e8c',
    light: 'bg-pink-50',
    text: 'text-pink-700',
  },
  {
    id: 'pro',
    name: 'Khalaas Pro',
    price: 299,
    subscribers: 244,
    features: ['Unlimited pickups', 'All services', 'Same-day available', 'Dedicated support line', '20% discount on extras'],
    color: '#9333ea',
    light: 'bg-purple-50',
    text: 'text-purple-700',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    price: null,
    subscribers: 18,
    features: ['Bulk volume pricing', 'Custom SLA', 'Account manager', 'Monthly invoicing', 'Multi-site pickup'],
    color: '#374151',
    light: 'bg-gray-100',
    text: 'text-gray-700',
  },
];

const GROWTH_DATA = [
  { month: 'Jan', subscribers: 890 },
  { month: 'Feb', subscribers: 960 },
  { month: 'Mar', subscribers: 1040 },
  { month: 'Apr', subscribers: 1110 },
  { month: 'May', subscribers: 1172 },
  { month: 'Jun', subscribers: 1258 },
];

const MRR_DATA = [
  { month: 'Jan', mrr: 131400 },
  { month: 'Feb', mrr: 143200 },
  { month: 'Mar', mrr: 155600 },
  { month: 'Apr', mrr: 163800 },
  { month: 'May', mrr: 174200 },
  { month: 'Jun', mrr: 185600 },
];

const PIE_DATA = PLANS.map(p => ({ name: p.name, value: p.subscribers, color: p.color }));

const totalSubscribers = PLANS.reduce((s, p) => s + p.subscribers, 0);
const mrr = PLANS.reduce((s, p) => s + (p.price ? p.price * p.subscribers : 8400), 0);

const RECENT_EVENTS = [
  { type: 'new', name: 'Aisha Al Rashid', plan: 'Khalaas Pro', time: '12 min ago' },
  { type: 'upgrade', name: 'David Chen', plan: 'Regular → Pro', time: '1 hr ago' },
  { type: 'new', name: 'Ramesh Nair', plan: 'Khalaas Regular', time: '2 hrs ago' },
  { type: 'churn', name: 'Khaloud Al Sabri', plan: 'Khalaas Lite', time: '3 hrs ago' },
  { type: 'new', name: 'Marriott Business Club', plan: 'Corporate', time: '5 hrs ago' },
];

export default function MembershipsPage() {
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Memberships</h1>
        <p className="text-gray-500 text-sm">Plan management · Subscriber analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center mb-2">
            <Users size={17} className="text-pink-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalSubscribers.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active Members</p>
          <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-0.5"><ArrowUpRight size={11} /> +86 this month</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp size={17} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">AED {(mrr / 1000).toFixed(0)}k</p>
          <p className="text-xs text-gray-500 mt-0.5">Monthly Recurring Revenue</p>
          <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-0.5"><ArrowUpRight size={11} /> +11% MoM</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
            <CreditCard size={17} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">AED 147</p>
          <p className="text-xs text-gray-500 mt-0.5">Avg Plan Value</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-2">
            <TrendingUp size={17} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">2.1%</p>
          <p className="text-xs text-gray-500 mt-0.5">Monthly Churn</p>
          <p className="text-xs text-green-600 font-semibold mt-1">Industry avg: 4.5%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Subscriber Growth</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={GROWTH_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[800, 1400]} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="subscribers" stroke="#e91e8c" strokeWidth={2.5} dot={{ fill: '#e91e8c', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-4">MRR Growth (AED)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={MRR_DATA} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [`AED ${v.toLocaleString()}`, 'MRR']} contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: 12 }} />
              <Bar dataKey="mrr" fill="#9333ea" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PLANS.map(plan => (
            <div key={plan.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{plan.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {plan.price ? `AED ${plan.price}/month` : 'Custom pricing'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{plan.subscribers}</p>
                  <p className="text-[10px] text-gray-400">subscribers</p>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full" style={{ width: `${(plan.subscribers / totalSubscribers) * 100}%`, backgroundColor: plan.color }} />
              </div>
              <ul className="space-y-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-1.5">
                    <Check size={11} className="flex-shrink-0" style={{ color: plan.color }} />
                    <span className="text-[11px] text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Plan Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                  {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {PIE_DATA.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-gray-600 flex-1 truncate">{d.name}</span>
                <span className="text-xs font-bold text-gray-800">{Math.round((d.value / totalSubscribers) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-bold text-gray-800 text-sm mb-3">Recent Activity</h3>
        <div className="space-y-2.5">
          {RECENT_EVENTS.map((e, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${
                e.type === 'churn' ? 'bg-red-400' : e.type === 'upgrade' ? 'bg-purple-500' : 'bg-green-500'
              }`}>
                {e.type === 'churn' ? '−' : e.type === 'upgrade' ? '↑' : '+'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800">{e.name}</p>
                <p className="text-[10px] text-gray-500">{e.plan}</p>
              </div>
              <span className="text-[10px] text-gray-400 flex-shrink-0">{e.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
