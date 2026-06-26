'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Plus, X } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Order, OrderStatus } from '@/lib/mock-data';

const STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Created', value: 'created' },
  { label: 'Pickup Assigned', value: 'pickup_assigned' },
  { label: 'Cleaning', value: 'cleaning' },
  { label: 'Ready', value: 'ready_for_delivery' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
];

const SERVICE_OPTIONS = [
  'Wash & Fold',
  'Dry Cleaning',
  'Ironing & Pressing',
  'Blankets & Duvets',
  'Curtains & Upholstery',
  'Business Laundry',
];

const EMIRATE_OPTIONS = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

const PAYMENT_OPTIONS = ['Pay on Delivery', 'Card', 'Monthly Invoice', 'Bank Transfer'];

const PICKUP_SLOTS = [
  'Today, 8:00 AM – 10:00 AM',
  'Today, 10:00 AM – 12:00 PM',
  'Today, 2:00 PM – 4:00 PM',
  'Today, 6:00 PM – 8:00 PM',
  'Tomorrow, 8:00 AM – 10:00 AM',
  'Tomorrow, 10:00 AM – 12:00 PM',
  'Tomorrow, 2:00 PM – 4:00 PM',
];

const FIELD = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-50 bg-white';

interface FormState {
  customerName: string;
  customerPhone: string;
  service: string;
  pickupAddress: string;
  emirate: string;
  amount: string;
  pickupSlot: string;
  paymentMethod: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  customerName: '',
  customerPhone: '',
  service: SERVICE_OPTIONS[0],
  pickupAddress: '',
  emirate: EMIRATE_OPTIONS[0],
  amount: '',
  pickupSlot: PICKUP_SLOTS[0],
  paymentMethod: PAYMENT_OPTIONS[0],
  notes: '',
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { orders, addOrder } = useApp();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState('');

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(form.amount);
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.pickupAddress.trim() || isNaN(amount) || amount <= 0) {
      setError('Please fill in all required fields.');
      return;
    }

    // Generate a temporary client-side ID; backend may replace it with its own sequential ID.
    const tempId = `LK-AE-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const order: Order = {
      id: tempId,
      customerId: 'admin',
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      services: [form.service],
      items: [],
      pickupAddress: form.pickupAddress.trim(),
      deliveryAddress: form.pickupAddress.trim(),
      emirate: form.emirate,
      pickupSlot: form.pickupSlot,
      deliveryEta: '',
      status: 'created',
      driverId: null,
      driverName: null,
      amount,
      paymentMethod: form.paymentMethod,
      paymentStatus: 'pending',
      notes: form.notes.trim(),
      createdAt: now,
      updatedAt: now,
      facilityAssigned: '',
      isB2B: false,
    };

    setSubmitting(true);
    try {
      await addOrder(order);
      setSuccessId(order.id);
      setTimeout(() => {
        setShowModal(false);
        setForm(EMPTY_FORM);
        setSuccessId('');
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">{orders.length} total orders</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); setForm(EMPTY_FORM); }}
          className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
          <Plus size={15} />
          New Order
        </button>
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

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">New Order</h2>
                <p className="text-xs text-gray-400 mt-0.5">Order will be saved to the database</p>
              </div>
              <button onClick={() => !submitting && setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Success state */}
            {successId && (
              <div className="px-5 py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-bold text-gray-800 mb-1">Order Created</p>
                <p className="text-pink-600 font-mono text-sm">{successId}</p>
              </div>
            )}

            {/* Form */}
            {!successId && (
              <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
                {/* Customer name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Customer Name <span className="text-pink-500">*</span></label>
                  <input value={form.customerName} onChange={set('customerName')} placeholder="e.g. Ahmed Al Mansoori"
                    className={FIELD} required />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number <span className="text-pink-500">*</span></label>
                  <input value={form.customerPhone} onChange={set('customerPhone')} placeholder="+971 50 XXX XXXX"
                    className={FIELD} required />
                </div>

                {/* Service */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Service Type <span className="text-pink-500">*</span></label>
                  <select value={form.service} onChange={set('service')} className={FIELD}>
                    {SERVICE_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Pickup address */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Address / Area <span className="text-pink-500">*</span></label>
                  <input value={form.pickupAddress} onChange={set('pickupAddress')} placeholder="e.g. Apt 1204, Marina Heights, Dubai Marina"
                    className={FIELD} required />
                </div>

                {/* Emirate + Amount row */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Emirate <span className="text-pink-500">*</span></label>
                    <select value={form.emirate} onChange={set('emirate')} className={FIELD}>
                      {EMIRATE_OPTIONS.map(e => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (AED) <span className="text-pink-500">*</span></label>
                    <input value={form.amount} onChange={set('amount')} type="number" min="1" step="0.01" placeholder="0.00"
                      className={FIELD} required />
                  </div>
                </div>

                {/* Pickup window */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Window <span className="text-pink-500">*</span></label>
                  <select value={form.pickupSlot} onChange={set('pickupSlot')} className={FIELD}>
                    {PICKUP_SLOTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Payment method */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Method <span className="text-pink-500">*</span></label>
                  <select value={form.paymentMethod} onChange={set('paymentMethod')} className={FIELD}>
                    {PAYMENT_OPTIONS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>

                {/* Notes (optional) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea value={form.notes} onChange={set('notes')} placeholder="Special instructions..."
                    rows={2} className={`${FIELD} resize-none`} />
                </div>

                {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

                <div className="flex gap-2 pt-1 pb-1">
                  <button type="button" onClick={() => setShowModal(false)} disabled={submitting}
                    className="flex-1 h-11 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-200 transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 h-11 text-white font-bold rounded-xl text-sm disabled:opacity-60 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                    {submitting ? 'Creating…' : 'Create Order'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
