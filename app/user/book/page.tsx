'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Shirt, Sparkles, Zap, Wind, Home, Building2, MapPin, Clock, CreditCard, ChevronRight, Plus, Minus, CheckCircle } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { Order } from '@/lib/mock-data';

const STEPS = ['Service', 'Items', 'Address', 'Time', 'Review', 'Confirm'];

const SERVICES_LIST = [
  { id: 'wash_fold', name: 'Wash & Fold', price: 'AED 8/kg', icon: Shirt, color: 'bg-pink-50 text-pink-600 border-pink-200' },
  { id: 'dry_cleaning', name: 'Dry Cleaning', price: 'AED 15/item', icon: Sparkles, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'ironing', name: 'Ironing & Pressing', price: 'AED 7/item', icon: Zap, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'blankets', name: 'Blankets & Duvets', price: 'AED 45/item', icon: Wind, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'curtains', name: 'Curtains & Upholstery', price: 'AED 30/panel', icon: Home, color: 'bg-green-50 text-green-600 border-green-200' },
  { id: 'business', name: 'Business Laundry', price: 'Custom Quote', icon: Building2, color: 'bg-rose-50 text-rose-600 border-rose-200' },
];

const ADDRESSES = [
  'Apt 1204, Marina Heights, Dubai Marina, Dubai',
  'Office 22, DIFC, Dubai',
  'Add new address...',
];

const TIME_SLOTS = [
  { label: 'Today', slots: ['10:00 AM – 12:00 PM', '2:00 PM – 4:00 PM', '6:00 PM – 8:00 PM'] },
  { label: 'Tomorrow', slots: ['8:00 AM – 10:00 AM', '12:00 PM – 2:00 PM', '4:00 PM – 6:00 PM'] },
];

const DEFAULT_ITEMS = [
  { name: 'Shirts', qty: 6 },
  { name: 'Trousers', qty: 3 },
  { name: 'Suit', qty: 1 },
  { name: 'Duvet', qty: 1 },
];

export default function BookPage() {
  const router = useRouter();
  const { addOrder } = useApp();
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>(['wash_fold', 'dry_cleaning']);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [selectedAddress, setSelectedAddress] = useState(ADDRESSES[0]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('6:00 PM – 8:00 PM');
  const [confirmed, setConfirmed] = useState(false);
  const [newOrderId] = useState(`LK-AE-${Math.floor(1027 + Math.random() * 10)}`);

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const updateQty = (idx: number, delta: number) => {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, qty: Math.max(0, item.qty + delta) } : item
    ).filter(item => item.qty > 0));
  };

  const handleConfirm = () => {
    const newOrder: Order = {
      id: newOrderId,
      customerId: 'c1',
      customerName: 'Humaid Al Mansoori',
      customerPhone: '+971 50 XXX 5566',
      services: SERVICES_LIST.filter(s => selectedServices.includes(s.id)).map(s => s.name),
      items,
      pickupAddress: selectedAddress,
      deliveryAddress: selectedAddress,
      emirate: 'Dubai',
      pickupSlot: `${TIME_SLOTS[selectedDay].label}, ${selectedSlot}`,
      deliveryEta: 'Tomorrow by 8:00 PM',
      status: 'pending',
      driverId: null,
      driverName: null,
      amount: 145,
      paymentMethod: 'Pay on Delivery',
      paymentStatus: 'pending',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      facilityAssigned: 'Dubai Marina Facility',
      isB2B: false,
    };
    addOrder(newOrder);
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Created!</h2>
          <p className="text-gray-500 text-sm mb-1">Your laundry pickup has been scheduled.</p>
          <p className="text-pink-600 font-bold text-lg mb-1">{newOrderId}</p>
          <p className="text-gray-400 text-xs mb-6">Status: Waiting for driver assignment</p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left mb-6 w-full max-w-xs mx-auto">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Services</span>
                <span className="font-semibold text-gray-800 text-right text-xs">
                  {SERVICES_LIST.filter(s => selectedServices.includes(s.id)).map(s => s.name).join(' + ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pickup</span>
                <span className="font-semibold text-gray-800 text-xs text-right">
                  {TIME_SLOTS[selectedDay].label}, {selectedSlot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery ETA</span>
                <span className="font-semibold text-gray-800 text-xs">Tomorrow by 8 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="font-semibold text-gray-800 text-xs">Pay on Delivery</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between">
                <span className="text-gray-700 font-bold">Estimated</span>
                <span className="font-bold text-pink-600">AED 145</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 w-full max-w-xs mx-auto">
            <button onClick={() => router.push(`/user/orders/${newOrderId}`)}
              className="w-full h-12 text-white font-bold rounded-2xl text-sm"
              style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
              Track Your Order
            </button>
            <button onClick={() => router.push('/user')}
              className="w-full h-12 bg-gray-100 text-gray-700 font-semibold rounded-2xl text-sm">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ background: 'linear-gradient(145deg, #c2185b 0%, #e91e8c 50%, #f06292 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step === 0 ? router.back() : setStep(s => s - 1)}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-lg font-bold">Schedule Pickup</h1>
            <p className="text-pink-100 text-xs">Step {step + 1} of {STEPS.length}</p>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-36">
        {/* Step 0: Service */}
        {step === 0 && (
          <div className="animate-fade-in">
            <h2 className="text-gray-900 font-bold text-xl mb-1">Select Services</h2>
            <p className="text-gray-500 text-sm mb-4">Choose one or more services</p>
            <div className="space-y-2.5">
              {SERVICES_LIST.map(s => {
                const Icon = s.icon;
                const sel = selectedServices.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleService(s.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${sel ? 'border-pink-400 bg-pink-50' : 'border-gray-100 bg-white hover:border-pink-200'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sel ? 'bg-pink-100 text-pink-600' : s.color.split(' ').slice(0, 2).join(' ')}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                      <p className="text-gray-400 text-xs">From {s.price}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? 'bg-pink-500 border-pink-500' : 'border-gray-300'}`}>
                      {sel && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1: Items */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-gray-900 font-bold text-xl mb-1">Add Item Details</h2>
            <p className="text-gray-500 text-sm mb-4">Tell us what you&apos;re sending</p>
            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                  <div className="w-8 h-8 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shirt size={16} className="text-pink-500" />
                  </div>
                  <span className="flex-1 font-semibold text-gray-800 text-sm">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQty(idx, -1)}
                      className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-pink-100 transition-colors">
                      <Minus size={14} className="text-gray-600" />
                    </button>
                    <span className="w-6 text-center font-bold text-gray-800">{item.qty}</span>
                    <button onClick={() => updateQty(idx, 1)}
                      className="w-7 h-7 bg-pink-100 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors">
                      <Plus size={14} className="text-pink-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setItems(prev => [...prev, { name: 'New Item', qty: 1 }])}
              className="mt-3 w-full border-2 border-dashed border-pink-200 rounded-2xl py-3 text-pink-500 text-sm font-semibold flex items-center justify-center gap-2 hover:border-pink-400 transition-colors">
              <Plus size={16} /> Add More Items
            </button>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-gray-900 font-bold text-xl mb-1">Pickup Address</h2>
            <p className="text-gray-500 text-sm mb-4">Where should we collect from?</p>
            <div className="space-y-2.5">
              {ADDRESSES.map(addr => (
                <button key={addr} onClick={() => setSelectedAddress(addr)}
                  className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${selectedAddress === addr ? 'border-pink-400 bg-pink-50' : 'border-gray-100 bg-white hover:border-pink-200'}`}>
                  <div className="mt-0.5 flex-shrink-0">
                    {addr.startsWith('Add') ? (
                      <div className="w-8 h-8 bg-pink-100 rounded-xl flex items-center justify-center">
                        <Plus size={16} className="text-pink-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-pink-50 rounded-xl flex items-center justify-center">
                        <MapPin size={15} className="text-pink-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm font-semibold leading-snug">{addr}</p>
                    {!addr.startsWith('Add') && <p className="text-gray-400 text-xs mt-0.5">Saved address</p>}
                  </div>
                  {selectedAddress === addr && !addr.startsWith('Add') && (
                    <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Time */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-gray-900 font-bold text-xl mb-1">Select Pickup Time</h2>
            <p className="text-gray-500 text-sm mb-4">When should we come by?</p>
            {TIME_SLOTS.map((day, di) => (
              <div key={day.label} className="mb-4">
                <p className="text-gray-700 font-bold text-sm mb-2.5">{day.label}</p>
                <div className="space-y-2">
                  {day.slots.map(slot => {
                    const sel = selectedDay === di && selectedSlot === slot;
                    return (
                      <button key={slot} onClick={() => { setSelectedDay(di); setSelectedSlot(slot); }}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${sel ? 'border-pink-400 bg-pink-50' : 'border-gray-100 bg-white hover:border-pink-200'}`}>
                        <Clock size={16} className={sel ? 'text-pink-500' : 'text-gray-400'} />
                        <span className={`flex-1 text-left text-sm font-semibold ${sel ? 'text-pink-700' : 'text-gray-700'}`}>{slot}</span>
                        {sel && <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-white" />
                        </div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-gray-900 font-bold text-xl mb-1">Review Order</h2>
            <p className="text-gray-500 text-sm mb-4">Confirm the details below</p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {[
                { label: 'Services', value: SERVICES_LIST.filter(s => selectedServices.includes(s.id)).map(s => s.name).join(', ') },
                { label: 'Items', value: items.map(i => `${i.qty}x ${i.name}`).join(', ') },
                { label: 'Pickup Address', value: selectedAddress },
                { label: 'Pickup Slot', value: `${TIME_SLOTS[selectedDay].label}, ${selectedSlot}` },
                { label: 'Delivery ETA', value: 'Tomorrow by 8:00 PM' },
                { label: 'Payment', value: 'Pay on Delivery' },
              ].map(({ label, value }, i) => (
                <div key={label} className={`px-4 py-3.5 flex items-start gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                  <span className="text-gray-400 text-xs w-24 flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-gray-800 text-sm font-semibold flex-1 leading-snug">{value}</span>
                </div>
              ))}
              <div className="px-4 py-3.5 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <span className="text-gray-700 font-bold">Estimated Total</span>
                <span className="text-pink-600 font-bold text-lg">AED 145</span>
              </div>
            </div>
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
              <p className="text-amber-700 text-xs font-medium">
                Final price may vary based on actual weight/items. Payment collected on delivery.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-100 px-4 py-3 shadow-lg">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => step < STEPS.length - 2 ? setStep(s => s + 1) : handleConfirm()}
            disabled={step === 0 && selectedServices.length === 0}
            className="w-full h-13 py-3.5 text-white font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm text-base"
            style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
            {step === STEPS.length - 2 ? 'Confirm Booking' : `Continue`}
            {step < STEPS.length - 2 ? <ArrowRight size={18} /> : <Check size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
