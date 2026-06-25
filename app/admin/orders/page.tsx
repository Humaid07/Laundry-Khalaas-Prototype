'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, ChevronRight, Package } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { OrderStatus } from '@/lib/mock-data';

const STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Created', value: 'created' },
  { label: 'Pickup Assigned', value: 'pickup_assigned' },
  { label: 'Cleaning', value: 'cleaning' },
  { label: 'Ready', value: 'ready_for_delivery' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const { orders } = useApp();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-0.5">{orders.length} total orders</p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by order ID or customer..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-50" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {STATUS_FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              filter === f.value
                ? 'text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-200'
            }`}
            style={filter === f.value ? { background: 'linear-gradient(135deg, #c2185b, #e91e8c)' } : {}}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-2.5">
        {filtered.map(order => (
          <div key={order.id}
            onClick={() => router.push(`/admin/orders/${order.id}`)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Package size={14} className="text-pink-500 flex-shrink-0" />
                <span className="font-bold text-gray-800 text-sm">{order.id}</span>
                {order.isB2B && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full flex-shrink-0">B2B</span>}
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-gray-700 text-sm font-semibold">{order.customerName}</p>
                <p className="text-gray-400 text-xs">{order.services.join(' + ')}</p>
                <p className="text-gray-400 text-xs mt-0.5">{order.emirate} · {order.pickupSlot}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-pink-600 font-bold text-sm">AED {order.amount}</p>
                {order.driverName && <p className="text-gray-400 text-xs">{order.driverName}</p>}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
