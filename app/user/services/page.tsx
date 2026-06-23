'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Shirt, Sparkles, Zap, Wind, Home, Building2, Clock, ArrowRight, Star } from 'lucide-react';
import { SERVICES } from '@/lib/mock-data';

import { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Shirt, Sparkles, Zap, Wind, Home, Building2
};
const COLOR_MAP: Record<string, { bg: string; icon: string; badge: string }> = {
  wash_fold: { bg: 'bg-pink-50', icon: 'text-pink-600', badge: 'bg-pink-100 text-pink-700' },
  dry_cleaning: { bg: 'bg-purple-50', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
  ironing: { bg: 'bg-amber-50', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  blankets_duvets: { bg: 'bg-blue-50', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  curtains_upholstery: { bg: 'bg-green-50', icon: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  business_laundry: { bg: 'bg-rose-50', icon: 'text-rose-600', badge: 'bg-rose-100 text-rose-700' },
};

export default function ServicesPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-5 pt-12 pb-6" style={{ background: 'linear-gradient(145deg, #c2185b 0%, #e91e8c 50%, #f06292 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Our Services</h1>
            <p className="text-pink-100 text-xs">Pick what you need cleaned today</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3">
          <Star size={15} className="text-amber-400 fill-amber-400 flex-shrink-0" />
          <span className="text-sm text-gray-600 flex-1">Free pickup & delivery on all orders</span>
          <span className="text-xs text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-full">Always Free</span>
        </div>
      </div>

      <div className="px-4 space-y-3 pb-4">
        {SERVICES.map(service => {
          const Icon = ICON_MAP[service.icon] || Shirt;
          const c = COLOR_MAP[service.type];
          return (
            <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-hover">
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${c.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={22} className={c.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-base">{service.name}</h3>
                      {service.popular && (
                        <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-full">Popular</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed mb-3">{service.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Clock size={11} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{service.turnaround}</span>
                      </div>
                      <span className="text-xs text-gray-300">•</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                        From {service.startingPrice} {service.priceUnit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <button onClick={() => router.push('/user/book')}
                  className="flex-1 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                  Add to Order <ArrowRight size={14} />
                </button>
                <button onClick={() => router.push('/user/book')}
                  className="px-4 border border-pink-200 text-pink-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-pink-50 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* B2B */}
      <div className="px-4 pb-6">
        <div className="bg-gray-900 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
            style={{ background: 'radial-gradient(#e91e8c, transparent)', transform: 'translate(20%, -20%)' }} />
          <h3 className="text-white font-bold text-base mb-1">Running a business?</h3>
          <p className="text-gray-400 text-sm mb-4">Hotels, restaurants, clinics, gyms — custom pricing and dedicated SLA.</p>
          <button onClick={() => router.push('/user/book')}
            className="text-white text-sm font-bold px-5 py-2.5 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
            Get Business Quote
          </button>
        </div>
      </div>
    </div>
  );
}
