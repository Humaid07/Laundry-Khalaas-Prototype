'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const weeklyRevenue = [
  { day: 'Mon', revenue: 8200, orders: 98 },
  { day: 'Tue', revenue: 9800, orders: 112 },
  { day: 'Wed', revenue: 11200, orders: 128 },
  { day: 'Thu', revenue: 10500, orders: 118 },
  { day: 'Fri', revenue: 13400, orders: 149 },
  { day: 'Sat', revenue: 15200, orders: 167 },
  { day: 'Sun', revenue: 12450, orders: 128 },
];

const serviceData = [
  { name: 'Wash & Fold', value: 42, color: '#e91e8c' },
  { name: 'Dry Cleaning', value: 28, color: '#9c27b0' },
  { name: 'Ironing', value: 12, color: '#f59e0b' },
  { name: 'Duvets', value: 8, color: '#3b82f6' },
  { name: 'Business', value: 10, color: '#ef4444' },
];

const emirateData = [
  { emirate: 'Dubai', orders: 89 },
  { emirate: 'Abu Dhabi', orders: 22 },
  { emirate: 'Sharjah', orders: 11 },
  { emirate: 'Ajman', orders: 4 },
  { emirate: 'RAK', orders: 2 },
];

const driverPerf = [
  { name: 'Ahmed K.', rating: 4.8, completed: 7 },
  { name: 'Fatima N.', rating: 4.9, completed: 9 },
  { name: 'Imran A.', rating: 4.7, completed: 6 },
  { name: 'Khalid H.', rating: 4.9, completed: 11 },
  { name: 'Rania M.', rating: 4.8, completed: 8 },
];

const STAT_CARDS = [
  { label: 'Conversion Rate (Agent)', value: '78%', sub: 'WhatsApp → Confirmed orders', trend: '+5%' },
  { label: 'Avg Order Value', value: 'AED 148', sub: 'Per transaction', trend: '+12%' },
  { label: 'Avg Delivery Time', value: '22.4 hrs', sub: 'From pickup to delivery', trend: '-1.2 hrs' },
  { label: 'Customer Satisfaction', value: '4.8 / 5', sub: 'Based on 1,240 reviews', trend: '' },
];

export default function AdminReportsPage() {
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm">Week of Jan 8–15, 2024</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {STAT_CARDS.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            {s.trend && <p className="text-xs text-green-600 font-semibold mt-1">{s.trend} vs last week</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Revenue This Week (AED)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyRevenue} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
              <Tooltip formatter={(v: number) => [`AED ${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#e91e8c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders line chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Orders Per Day</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="orders" stroke="#e91e8c" strokeWidth={2.5} dot={{ fill: '#e91e8c', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Service demand */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Service Demand (%)</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={serviceData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                  {serviceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {serviceData.map(s => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-gray-600 flex-1">{s.name}</span>
                  <span className="text-xs font-bold text-gray-800">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By Emirate */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Orders by Emirate (Today)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={emirateData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="emirate" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: 12 }} />
              <Bar dataKey="orders" fill="#e91e8c" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Driver performance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-bold text-gray-800 text-sm mb-4">Driver Performance Today</h3>
        <div className="space-y-3">
          {driverPerf.map(d => (
            <div key={d.name} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                {d.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-sm text-gray-700 w-24 flex-shrink-0 font-medium">{d.name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(d.completed / 12) * 100}%`, background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }} />
              </div>
              <span className="text-xs text-gray-600 font-semibold w-20 text-right flex-shrink-0">{d.completed} pickups · ⭐{d.rating}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
