'use client';

import { useRouter } from 'next/navigation';
import {
  ShoppingBag, Clock, Sparkles, Truck, CheckCircle, Users,
  Star, TrendingUp, AlertTriangle, MessageCircle, Building2, Zap
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { StatusBadge } from '@/components/shared/StatusBadge';

const KPI_CARDS = [
  { value: '128', label: "Today's Orders", icon: ShoppingBag, color: 'bg-pink-500', light: 'bg-pink-50 text-pink-600', trend: '+12%' },
  { label: 'Pending Pickups', value: '34', icon: Clock, color: 'bg-amber-500', light: 'bg-amber-50 text-amber-600', trend: '+5' },
  { label: 'In Cleaning', value: '51', icon: Sparkles, color: 'bg-purple-500', light: 'bg-purple-50 text-purple-600', trend: '' },
  { label: 'Out for Delivery', value: '22', icon: Truck, color: 'bg-blue-500', light: 'bg-blue-50 text-blue-600', trend: '' },
  { label: 'Delivered Today', value: '89', icon: CheckCircle, color: 'bg-green-500', light: 'bg-green-50 text-green-600', trend: '+18%' },
  { label: 'Active Drivers', value: '18', icon: Users, color: 'bg-gray-600', light: 'bg-gray-100 text-gray-600', trend: '' },
  { label: 'Satisfaction', value: '4.8', icon: Star, color: 'bg-amber-500', light: 'bg-amber-50 text-amber-600', trend: '' },
  { label: 'Revenue Today', value: 'AED 12,450', icon: TrendingUp, color: 'bg-pink-600', light: 'bg-pink-50 text-pink-600', trend: '+8%' },
];

const URGENT_ITEMS = [
  { id: 'LK-AE-1027', customer: 'Hassan Al Blooshi', issue: 'Pickup overdue by 45 min', severity: 'high' },
  { id: 'LK-AE-1019', customer: 'Marriott Downtown', issue: 'Driver not responding', severity: 'high' },
  { id: 'LK-AE-1015', customer: 'Nadia Farhat', issue: 'Delivery delayed', severity: 'medium' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { orders, drivers } = useApp();

  const recentOrders = orders.slice(0, 4);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Monday, Jun 23, 2026 · UAE Operations</p>
        </div>
        <button onClick={() => router.push('/admin/ai-command')}
          className="hidden md:flex text-white text-sm font-semibold px-4 py-2 rounded-xl gap-2 items-center"
          style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
          <Zap size={14} /> AI Command
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {KPI_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.light}`}>
                  <Icon size={18} />
                </div>
                {card.trend && (
                  <span className="text-xs text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded-full">{card.trend}</span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Urgent orders */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-500" />
            <h3 className="font-bold text-gray-800 text-sm">Urgent Attention</h3>
            <span className="ml-auto text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-semibold">{URGENT_ITEMS.length} issues</span>
          </div>
          <div className="space-y-2">
            {URGENT_ITEMS.map(item => (
              <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border ${item.severity === 'high' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${item.severity === 'high' ? 'text-red-700' : 'text-amber-700'}`}>{item.id}</p>
                  <p className="text-xs text-gray-600 truncate">{item.customer} · {item.issue}</p>
                </div>
                <button onClick={() => router.push(`/admin/orders/${item.id}`)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${item.severity === 'high' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                  Act
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Driver availability */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Truck size={15} className="text-pink-500" /> Driver Status
          </h3>
          <div className="space-y-2">
            {drivers.slice(0, 5).map(d => (
              <div key={d.id} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                  {d.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{d.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{d.location}</p>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                  d.status === 'available' ? 'bg-green-100 text-green-700' :
                  d.status === 'on_pickup' ? 'bg-blue-100 text-blue-700' :
                  d.status === 'on_delivery' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {d.status === 'available' ? 'Free' : d.status === 'on_pickup' ? 'Pickup' : d.status === 'on_delivery' ? 'Delivery' : 'Off'}
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => router.push('/admin/drivers')}
            className="w-full mt-3 text-xs text-pink-600 font-bold bg-pink-50 py-2 rounded-xl">
            View All Drivers
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-sm">Recent Orders</h3>
            <button onClick={() => router.push('/admin/orders')} className="text-xs text-pink-500 font-semibold">View All</button>
          </div>
          <div className="space-y-2.5">
            {recentOrders.map(o => (
              <div key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)}
                className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                <div>
                  <p className="text-xs font-bold text-gray-800">{o.id}</p>
                  <p className="text-[10px] text-gray-500 truncate max-w-[100px]">{o.customerName}</p>
                </div>
                <StatusBadge status={o.status} className="ml-auto text-[10px] py-0.5" />
                <span className="text-xs font-bold text-pink-600 flex-shrink-0">AED {o.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'New Order', icon: ShoppingBag, href: '/admin/orders', color: 'bg-pink-50 text-pink-600' },
              { label: 'Agent Console', icon: MessageCircle, href: '/admin/agent', color: 'bg-green-50 text-green-600' },
              { label: 'Driver Map', icon: Truck, href: '/admin/drivers', color: 'bg-blue-50 text-blue-600' },
              { label: 'B2B Clients', icon: Building2, href: '/admin/business', color: 'bg-amber-50 text-amber-600' },
              { label: 'Reports', icon: TrendingUp, href: '/admin/reports', color: 'bg-purple-50 text-purple-600' },
              { label: 'Settings', icon: Zap, href: '/admin/settings', color: 'bg-gray-100 text-gray-600' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={() => router.push(item.href)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon size={14} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
