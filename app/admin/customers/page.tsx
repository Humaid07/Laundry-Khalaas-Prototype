'use client';

import { useState } from 'react';
import { Search, Star, Phone, Package, Crown } from 'lucide-react';
import { CUSTOMERS } from '@/lib/mock-data';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const filtered = CUSTOMERS.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.emirate.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm">{CUSTOMERS.length} registered customers</p>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-pink-300" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 card-hover">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-800 text-sm">{c.name}</p>
                  {c.status === 'vip' && (
                    <span className="text-[9px] font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Crown size={8} /> VIP
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs">{c.phone}</p>
              </div>
              <span className="text-[10px] font-bold bg-pink-50 text-pink-600 px-2 py-1 rounded-full flex-shrink-0">{c.emirate}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Orders', value: c.ordersCount },
                { label: 'Spent', value: `AED ${c.totalSpent}` },
                { label: 'Joined', value: new Date(c.joinedAt).toLocaleDateString('en-AE', { month: 'short', year: '2-digit' }) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl py-2">
                  <p className="text-xs font-bold text-gray-800">{value}</p>
                  <p className="text-[10px] text-gray-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 text-xs font-semibold bg-pink-50 text-pink-600 py-2 rounded-xl flex items-center justify-center gap-1">
                <Package size={11} /> Orders
              </button>
              <button className="flex-1 text-xs font-semibold bg-gray-100 text-gray-600 py-2 rounded-xl flex items-center justify-center gap-1">
                <Phone size={11} /> Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
