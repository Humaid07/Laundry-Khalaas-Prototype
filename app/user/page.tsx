'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, ChevronDown, Bell, Search, ArrowRight,
  MessageCircle, Shirt, Sparkles, Zap, Wind, Home, Building2,
  CheckCircle, Star, Package, LayoutDashboard, X, Clock, Truck
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { StatusBadge } from '@/components/shared/StatusBadge';

const MOCK_NOTIFICATIONS = [
  { id: 1, icon: Truck, color: 'bg-blue-50 text-blue-500', title: 'Driver on the way!', body: 'Ahmed Khan is 18 min away from your location.', time: '5m ago', unread: true },
  { id: 2, icon: CheckCircle, color: 'bg-green-50 text-green-500', title: 'Order Ready', body: 'Your order LK-AE-1022 is cleaned and ready for delivery.', time: '2h ago', unread: true },
  { id: 3, icon: Package, color: 'bg-pink-50 text-pink-500', title: 'Order Confirmed', body: 'We received your booking LK-AE-1024. Pickup scheduled!', time: 'Yesterday', unread: false },
  { id: 4, icon: Star, color: 'bg-amber-50 text-amber-500', title: 'Rate your last order', body: 'How was LK-AE-1022? Tap to leave a review.', time: 'Yesterday', unread: false },
];

const UAE_LOCATIONS = [
  'Dubai Marina, Dubai', 'Business Bay, Dubai', 'JVC, Dubai',
  'Al Barsha, Dubai', 'Downtown Dubai', 'Al Reem Island, Abu Dhabi',
  'Al Nahda, Sharjah', 'Ajman City Centre, Ajman',
];

const SERVICE_CARDS = [
  { icon: Shirt, label: 'Wash & Fold', color: 'bg-pink-50 text-pink-600' },
  { icon: Sparkles, label: 'Dry Cleaning', color: 'bg-purple-50 text-purple-600' },
  { icon: Zap, label: 'Ironing', color: 'bg-amber-50 text-amber-600' },
  { icon: Wind, label: 'Duvets', color: 'bg-blue-50 text-blue-600' },
  { icon: Home, label: 'Curtains', color: 'bg-green-50 text-green-600' },
  { icon: Building2, label: 'Business', color: 'bg-rose-50 text-rose-600' },
];

const ALL_SERVICES = ['Wash & Fold', 'Dry Cleaning', 'Ironing', 'Duvets', 'Curtains', 'Business'];

export default function UserHomePage() {
  const router = useRouter();
  const { orders } = useApp();
  const [location, setLocation] = useState('Dubai Marina, Dubai');
  const [locationOpen, setLocationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const searchResults = searchQuery.trim().length > 0 ? [
    ...ALL_SERVICES.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).map(s => ({ type: 'service', label: s, sub: 'Tap to book' })),
    ...orders.filter(o => o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.services.join(' ').toLowerCase().includes(searchQuery.toLowerCase())).map(o => ({ type: 'order', label: o.id, sub: o.services.join(' + ') })),
  ] : [];

  const activeOrder = orders.find(o => o.id === 'LK-AE-1024');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative" style={{ background: 'linear-gradient(145deg, #c2185b 0%, #e91e8c 50%, #f06292 100%)' }}>
        <div className="px-5 pt-12 pb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-pink-100 text-sm">{greeting}</p>
              <h2 className="text-white text-xl font-bold">Humaid Al Mansoori</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center active:bg-white/30 transition-colors">
                <Search size={16} className="text-white" />
              </button>
              <button onClick={() => setNotifOpen(true)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center relative active:bg-white/30 transition-colors">
                <Bell size={16} className="text-white" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full" />
              </button>
              <button onClick={() => router.push('/admin')} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center" title="Admin Panel">
                <LayoutDashboard size={16} className="text-white" />
              </button>
            </div>
          </div>
          {/* Location */}
          <div className="relative">
            <button
              onClick={() => setLocationOpen(!locationOpen)}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2.5 w-full text-white"
            >
              <MapPin size={14} className="text-pink-200 flex-shrink-0" />
              <span className="text-sm font-medium flex-1 text-left">{location}</span>
              <ChevronDown size={14} className={`text-pink-200 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
            </button>
            {locationOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {UAE_LOCATIONS.map(loc => (
                  <button key={loc} onClick={() => { setLocation(loc); setLocationOpen(false); }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-pink-50 flex items-center gap-2 border-b border-gray-50 last:border-0 transition-colors">
                    <MapPin size={13} className="text-pink-500 flex-shrink-0" />
                    <span className="text-gray-700">{loc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero card */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold text-pink-500 uppercase tracking-wide mb-1">24-Hour Service</p>
              <h3 className="text-gray-900 font-bold text-lg leading-tight mb-3">Fresh laundry<br />delivered tomorrow</h3>
              <button onClick={() => router.push('/user/book')}
                className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                Schedule Pickup <ArrowRight size={14} />
              </button>
            </div>
            <div className="w-24 h-24 ml-4 bg-pink-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-4xl">
              👕
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp quick booking */}
      <div className="px-4 mt-3">
        <button onClick={() => router.push('/user/agent')}
          className="w-full bg-green-500 rounded-2xl p-4 flex items-center gap-3 text-white shadow-sm hover:bg-green-600 transition-colors">
          <div className="w-10 h-10 bg-green-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageCircle size={20} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm">Book via WhatsApp Agent</p>
            <p className="text-green-100 text-xs">AI-powered instant booking in seconds</p>
          </div>
          <ArrowRight size={16} className="text-green-200 flex-shrink-0" />
        </button>
      </div>

      {/* Active order */}
      {activeOrder && (
        <div className="px-4 mt-5">
          <h3 className="text-gray-800 font-bold text-base mb-2.5">Active Order</h3>
          <div onClick={() => router.push(`/user/orders/${activeOrder.id}`)}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer card-hover">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Package size={15} className="text-pink-500" />
                <span className="font-bold text-gray-800 text-sm">{activeOrder.id}</span>
              </div>
              <StatusBadge status={activeOrder.status} />
            </div>
            <p className="text-gray-600 text-sm mb-1">{activeOrder.services.join(' + ')}</p>
            <p className="text-gray-400 text-xs mb-3">Pickup: {activeOrder.pickupSlot}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                  AK
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{activeOrder.driverName}</p>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-gray-500">4.8</span>
                  </div>
                </div>
              </div>
              <button className="text-pink-600 text-xs font-bold bg-pink-50 px-3 py-1.5 rounded-xl">
                Track Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-800 font-bold text-base">Our Services</h3>
          <button onClick={() => router.push('/user/services')} className="text-pink-500 text-sm font-semibold">See all</button>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {SERVICE_CARDS.map(({ icon: Icon, label, color }) => (
            <button key={label} onClick={() => router.push('/user/services')}
              className="bg-white rounded-2xl p-3.5 flex flex-col items-center gap-2 border border-gray-100 shadow-sm card-hover text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <span className="text-xs font-semibold text-gray-700 leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="px-4 mt-6">
        <h3 className="text-gray-800 font-bold text-base mb-3">How It Works</h3>
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-pink-100 z-0" />
          <div className="space-y-3 relative z-10">
            {[
              { step: '1', icon: MessageCircle, title: 'Book in Seconds', desc: 'Via app or WhatsApp — no calls needed', color: 'bg-pink-500' },
              { step: '2', icon: Package, title: 'We Collect', desc: 'Driver arrives at your door on time', color: 'bg-purple-500' },
              { step: '3', icon: Sparkles, title: 'Expert Cleaning', desc: 'Professional clean at our facility', color: 'bg-blue-500' },
              { step: '4', icon: CheckCircle, title: 'Delivered Fresh', desc: 'Back at your door within 24 hours', color: 'bg-green-500' },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="flex items-start gap-3 bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${color}`}>
                  <Icon size={17} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
                </div>
                <span className="ml-auto text-[10px] font-black text-gray-200">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* UAE strip */}
      <div className="mx-4 mt-6 mb-4 bg-gray-900 rounded-2xl p-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #e91e8c, transparent)', transform: 'translate(20%, -20%)' }} />
        <p className="text-white text-xs font-bold mb-2">🇦🇪 Serving All 7 Emirates</p>
        <div className="flex flex-wrap gap-1.5">
          {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'].map(e => (
            <span key={e} className="text-[10px] text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">{e}</span>
          ))}
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
          <div className="bg-white rounded-b-3xl shadow-2xl px-4 pt-12 pb-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search services, orders..."
                  className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 flex-shrink-0">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            {searchResults.length > 0 ? (
              <div className="space-y-1 pb-2">
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => { setSearchOpen(false); setSearchQuery(''); router.push(r.type === 'service' ? '/user/services' : `/user/orders`); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 text-left transition-colors">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${r.type === 'service' ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'}`}>
                      {r.type === 'service' ? <Sparkles size={15} /> : <Package size={15} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.label}</p>
                      <p className="text-xs text-gray-400">{r.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.length > 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">No results for &ldquo;{searchQuery}&rdquo;</p>
            ) : (
              <div className="space-y-1 pb-2">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide px-3 mb-2">Quick links</p>
                {['Wash & Fold', 'Dry Cleaning', 'My Orders'].map(s => (
                  <button key={s} onClick={() => { setSearchOpen(false); router.push(s === 'My Orders' ? '/user/orders' : '/user/services'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 text-left transition-colors">
                    <Search size={14} className="text-gray-300 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications panel */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setNotifOpen(false)}>
          <div className="bg-white rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Notifications</h3>
              <button onClick={() => setNotifOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                <X size={15} className="text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
              {MOCK_NOTIFICATIONS.map(n => {
                const Icon = n.icon;
                return (
                  <div key={n.id} className={`flex items-start gap-3 p-3.5 rounded-2xl transition-colors ${n.unread ? 'bg-pink-50/60' : 'bg-gray-50'}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                      <Icon size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-800">{n.title}</p>
                        {n.unread && <span className="w-1.5 h-1.5 bg-pink-500 rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 pt-0.5">{n.time}</span>
                  </div>
                );
              })}
            </div>
            <div className="px-4 pb-6 pt-2">
              <button className="w-full text-center text-sm text-pink-500 font-semibold py-2">Mark all as read</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
