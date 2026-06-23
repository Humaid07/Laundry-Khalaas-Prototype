'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Star, ArrowLeft, CreditCard, Zap } from 'lucide-react';

const PLANS = [
  {
    id: 'lite',
    name: 'Khalaas Lite',
    price: 79,
    billing: 'per month',
    tagline: 'For occasional laundry needs',
    features: [
      '1 pickup per month',
      'Wash & Fold only',
      'Standard 24-hr turnaround',
      'Order tracking',
    ],
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
    light: 'bg-blue-50',
    text: 'text-blue-700',
    popular: false,
  },
  {
    id: 'regular',
    name: 'Khalaas Regular',
    price: 149,
    billing: 'per month',
    tagline: 'Best value for weekly laundry',
    features: [
      '4 pickups per month',
      'All services included',
      'Priority scheduling',
      '10% off extra pickups',
      'Order tracking',
    ],
    color: '#e91e8c',
    gradient: 'linear-gradient(135deg, #c2185b, #e91e8c)',
    light: 'bg-pink-50',
    text: 'text-pink-700',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Khalaas Pro',
    price: 299,
    billing: 'per month',
    tagline: 'Unlimited, priority, and more',
    features: [
      'Unlimited pickups',
      'All services included',
      'Same-day available',
      '20% off all extras',
      'Dedicated support line',
      'WhatsApp priority queue',
    ],
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #7e22ce, #9333ea)',
    light: 'bg-purple-50',
    text: 'text-purple-700',
    popular: false,
  },
];

export default function MembershipsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState('regular');
  const [toast, setToast] = useState(false);

  const onSelect = (id: string) => {
    setSelected(id);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center">
          <div className="bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg">
            Plan selected — checkout coming soon
          </div>
        </div>
      )}

      <div className="px-5 pt-12 pb-6" style={{ background: 'linear-gradient(145deg, #c2185b 0%, #e91e8c 50%, #f06292 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Membership Plans</h1>
            <p className="text-pink-100 text-xs">Unlimited laundry, best prices</p>
          </div>
        </div>
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2">
          <Star size={14} className="text-amber-300 fill-amber-300 flex-shrink-0" />
          <p className="text-white text-xs font-medium">Members save up to 35% compared to per-order pricing</p>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-3">
        {PLANS.map(plan => (
          <div key={plan.id}
            onClick={() => setSelected(plan.id)}
            className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden cursor-pointer transition-all ${
              selected === plan.id ? 'border-pink-400 shadow-md' : 'border-gray-100'
            }`}>
            {plan.popular && (
              <div className="py-1.5 text-center text-xs font-bold text-white" style={{ background: plan.gradient }}>
                Most Popular
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{plan.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{plan.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">AED {plan.price}</p>
                  <p className="text-xs text-gray-400">{plan.billing}</p>
                </div>
              </div>

              <ul className="space-y-1.5 mb-4">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: plan.gradient }}>
                      <Check size={10} className="text-white" />
                    </div>
                    <span className="text-sm text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={e => { e.stopPropagation(); onSelect(plan.id); }}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                  selected === plan.id
                    ? 'text-white shadow-sm'
                    : 'border-2 bg-gray-50'
                }`}
                style={selected === plan.id
                  ? { background: plan.gradient }
                  : { borderColor: plan.color, color: plan.color }}
              >
                {selected === plan.id ? 'Selected Plan' : 'Select Plan'}
              </button>
            </div>
          </div>
        ))}

        {/* Enterprise */}
        <div className="bg-gray-900 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'radial-gradient(#e91e8c, transparent)', transform: 'translate(20%, -20%)' }} />
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} className="text-pink-400" />
            <span className="text-pink-400 text-xs font-bold uppercase tracking-wide">Corporate</span>
          </div>
          <h3 className="text-white font-bold text-base mb-1">Hotels, Gyms & Businesses</h3>
          <p className="text-gray-400 text-sm mb-4">Custom volume pricing, dedicated account manager, monthly invoicing, and SLA guarantee.</p>
          <button className="text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
            <Zap size={14} /> Get a Custom Quote
          </button>
        </div>

        {/* Trust signals */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-gray-800">1,258 active members across the UAE</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { value: '4.8★', label: 'Member rating' },
              { value: '2.1%', label: 'Churn rate' },
              { value: 'Cancel', label: 'Anytime' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl py-2.5">
                <p className="text-sm font-bold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
