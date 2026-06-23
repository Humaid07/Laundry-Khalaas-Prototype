'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Star, MapPin, Phone, Package, CheckCircle } from 'lucide-react';
import { useApp } from '@/lib/app-context';

export default function AdminDriversPage() {
  const router = useRouter();
  const { drivers, orders } = useApp();
  const [selected, setSelected] = useState(drivers[0]);

  const driverOrders = orders.filter(o => o.driverId === selected.id);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
        <p className="text-gray-500 text-sm">{drivers.filter(d => d.status !== 'off_duty').length} active drivers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Driver cards */}
        <div className="space-y-2.5">
          {drivers.map(d => (
            <button key={d.id} onClick={() => setSelected(d)}
              className={`w-full bg-white rounded-2xl border shadow-sm p-4 text-left card-hover transition-all ${selected.id === d.id ? 'border-pink-300' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                  {d.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{d.name}</p>
                  <div className="flex items-center gap-1.5">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-gray-600">{d.rating}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500 truncate">{d.location}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                  d.status === 'available' ? 'bg-green-100 text-green-700' :
                  d.status === 'on_pickup' ? 'bg-blue-100 text-blue-700' :
                  d.status === 'on_delivery' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {d.status === 'available' ? 'Available' : d.status === 'on_pickup' ? 'On Pickup' : d.status === 'on_delivery' ? 'Delivery' : 'Off Duty'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Driver detail */}
        <div className="md:col-span-2 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                {selected.avatar}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                <div className="flex items-center gap-2">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-gray-700 text-sm">{selected.rating}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-sm text-gray-500">{selected.emirate}</span>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                selected.status === 'available' ? 'bg-green-100 text-green-700' :
                selected.status === 'on_pickup' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {selected.status === 'available' ? 'Available' : selected.status === 'on_pickup' ? 'On Pickup' : 'On Delivery'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Today Completed', value: selected.completedToday },
                { label: 'Rating', value: selected.rating },
                { label: 'Emirate', value: selected.emirate },
                { label: 'Vehicle', value: selected.vehicle.split(' ').slice(0, 2).join(' ') },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-gray-900 font-bold text-sm">{value}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                <Phone size={14} className="text-gray-400" />
                <span className="text-gray-600">{selected.phone}</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                <Truck size={14} className="text-gray-400" />
                <span className="text-gray-600">{selected.vehicle} · {selected.vehicleNumber}</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-gray-600">Current: {selected.location}</span>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-32 relative" style={{ background: 'linear-gradient(135deg, #fce4ec, #f8bbd0)' }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-pink-500" />
                  <span className="text-gray-700 text-sm font-semibold">{selected.location}</span>
                </div>
                <p className="text-pink-400 text-xs">Live location tracking</p>
              </div>
              <div className="absolute top-3 right-3 bg-white rounded-xl px-2 py-1 shadow-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs font-semibold text-gray-700">Live</span>
              </div>
            </div>
          </div>

          {/* Assigned orders */}
          {driverOrders.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                <Package size={14} className="text-pink-500" /> Active Assignments
              </h3>
              <div className="space-y-2">
                {driverOrders.map(o => (
                  <div key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)}
                    className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl cursor-pointer hover:bg-pink-50 transition-colors">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-800">{o.id}</p>
                      <p className="text-[10px] text-gray-500">{o.customerName} · {o.pickupSlot}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>{o.status === 'delivered' ? 'Done' : 'Active'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
