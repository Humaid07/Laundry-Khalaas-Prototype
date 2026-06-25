'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MessageCircle, Star, MapPin, Clock, CheckCircle, Package, Truck, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DRIVERS } from '@/lib/mock-data';

const TIMELINE_STEPS = [
  { key: 'created', label: 'Order Booked', icon: Package, desc: 'Your order has been received' },
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, desc: 'Your order has been confirmed' },
  { key: 'pickup_assigned', label: 'Driver Assigned', icon: Truck, desc: 'A driver is assigned to your order' },
  { key: 'picked_up', label: 'Laundry Collected', icon: MapPin, desc: 'Your items have been picked up' },
  { key: 'cleaning', label: 'Cleaning in Progress', icon: Sparkles, desc: 'Items are being professionally cleaned' },
  { key: 'ready_for_delivery', label: 'Ready for Delivery', icon: ShieldCheck, desc: 'Your order is packed and ready' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, desc: 'Driver is on the way to deliver' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, desc: 'Your fresh laundry has been delivered!' },
];

const STATUS_ORDER: Record<string, number> = {
  created: 0, confirmed: 1, pickup_assigned: 2, picked_up: 3,
  cleaning: 4, ready_for_delivery: 5, out_for_delivery: 6, delivered: 7,
};

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { orders } = useApp();

  const order = orders.find(o => o.id === id);
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <Package size={48} className="text-gray-300 mb-4" />
        <h2 className="text-gray-700 font-bold text-xl mb-2">Order Not Found</h2>
        <button onClick={() => router.back()} className="text-pink-500 font-semibold mt-4">Go Back</button>
      </div>
    );
  }

  const driver = DRIVERS.find(d => d.id === order.driverId);
  const currentStep = STATUS_ORDER[order.status] ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ background: 'linear-gradient(145deg, #c2185b 0%, #e91e8c 50%, #f06292 100%)' }}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-lg font-bold">Track Order</h1>
            <p className="text-pink-100 text-xs">{order.id}</p>
          </div>
          <StatusBadge status={order.status} className="bg-white/20 text-white border-white/30" />
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Map placeholder */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-40 relative" style={{ background: 'linear-gradient(135deg, #fce4ec, #f8bbd0)' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-white rounded-2xl px-4 py-2 shadow-md flex items-center gap-2 mb-2">
                <MapPin size={15} className="text-pink-500" />
                <span className="text-gray-700 text-sm font-semibold">Driver is near Dubai Marina</span>
              </div>
              {/* Simulated map dots */}
              <div className="flex items-center gap-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all ${i < 5 ? 'w-4 bg-pink-500' : 'w-2 bg-pink-200'}`} />
                ))}
              </div>
              <p className="text-pink-400 text-xs mt-2">Live tracking · Dubai Marina area</p>
            </div>
            <div className="absolute top-3 right-3 bg-white rounded-xl px-2.5 py-1.5 shadow-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full pulse-pink" />
              <span className="text-xs font-semibold text-gray-700">Live</span>
            </div>
          </div>
        </div>

        {/* Driver card */}
        {driver && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                {driver.avatar}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{driver.name}</p>
                <div className="flex items-center gap-1.5">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-gray-600 font-semibold">{driver.rating}</span>
                  <span className="text-gray-300 text-xs">•</span>
                  <span className="text-xs text-gray-500">{driver.vehicle}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center">
                  <Phone size={16} className="text-pink-600" />
                </button>
                <button onClick={() => router.push('/user/agent')} className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                  <MessageCircle size={16} className="text-green-600" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-pink-50 rounded-xl px-3 py-2.5">
              <Clock size={14} className="text-pink-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-pink-700">On the way for pickup</p>
                <p className="text-xs text-pink-500">ETA: 18 minutes • {driver.vehicleNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3">Order Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Services</span>
              <span className="font-semibold text-gray-700 text-xs text-right max-w-[60%]">{order.services.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Items</span>
              <span className="font-semibold text-gray-700 text-xs text-right max-w-[60%]">
                {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pickup</span>
              <span className="font-semibold text-gray-700 text-xs text-right">{order.pickupSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery ETA</span>
              <span className="font-semibold text-gray-700 text-xs">{order.deliveryEta}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-gray-700 font-bold">Amount</span>
              <span className="font-bold text-pink-600">AED {order.amount}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Order Timeline</h3>
          <div className="space-y-0">
            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;
              const isPending = idx > currentStep;
              const Icon = step.icon;
              const isLast = idx === TIMELINE_STEPS.length - 1;

              return (
                <div key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isCompleted ? 'bg-green-500' : isCurrent ? 'bg-pink-500 pulse-pink' : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle size={14} className="text-white" />
                      ) : (
                        <Icon size={13} className={isCurrent ? 'text-white' : 'text-gray-400'} />
                      )}
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 h-8 mt-1 ${isCompleted ? 'bg-green-300' : 'bg-gray-100'}`} />
                    )}
                  </div>
                  <div className={`pb-6 flex-1 ${isLast ? 'pb-0' : ''}`}>
                    <p className={`text-sm font-semibold leading-tight ${
                      isCompleted ? 'text-green-700' : isCurrent ? 'text-pink-700' : 'text-gray-400'
                    }`}>{step.label}</p>
                    {isCurrent && (
                      <p className="text-pink-500 text-xs mt-0.5">{step.desc}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
