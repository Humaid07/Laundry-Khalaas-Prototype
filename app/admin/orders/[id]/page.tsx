'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Truck, CheckCircle, AlertTriangle, Phone, Package,
  MapPin, Clock, User, CreditCard, Star, Edit
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DRIVERS, Order, OrderStatus } from '@/lib/mock-data';

const ALL_STATUSES: OrderStatus[] = [
  'pending', 'driver_assigned', 'pickup_in_progress', 'collected',
  'cleaning', 'quality_check', 'out_for_delivery', 'delivered', 'escalated'
];
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending', driver_assigned: 'Driver Assigned', pickup_in_progress: 'Pickup In Progress',
  collected: 'Collected', cleaning: 'Cleaning in Progress', quality_check: 'Quality Check',
  out_for_delivery: 'Out for Delivery', delivered: 'Delivered', escalated: 'Escalated',
};

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { orders, updateOrderStatus, assignDriver, drivers } = useApp();
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [toast, setToast] = useState('');

  const order = orders.find(o => o.id === id);
  if (!order) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-gray-500">Order not found</p>
      <button onClick={() => router.back()} className="text-pink-500 mt-4 font-semibold">Go Back</button>
    </div>
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleAssignDriver = (driverId: string) => {
    assignDriver(order.id, driverId);
    setShowDriverModal(false);
    showToast('Driver assigned successfully');
  };

  const handleStatusChange = (status: OrderStatus) => {
    updateOrderStatus(order.id, status);
    setShowStatusModal(false);
    showToast('Status updated');
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ArrowLeft size={17} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{order.id}</h1>
          <p className="text-gray-500 text-xs">{order.customerName} · {order.emirate}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer & Service */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><User size={15} className="text-pink-500" /> Customer</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-semibold text-gray-800">{order.customerName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Phone</span>
              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                {order.customerPhone}
                <button className="text-pink-500"><Phone size={13} /></button>
              </span>
            </div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="font-semibold text-gray-800">{order.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment Status</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Package size={15} className="text-pink-500" /> Service Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Services</span><span className="font-semibold text-gray-800 text-right text-xs max-w-[55%]">{order.services.join(', ')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Items</span><span className="font-semibold text-gray-800 text-right text-xs max-w-[55%]">{order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Facility</span><span className="font-semibold text-gray-800 text-xs text-right">{order.facilityAssigned}</span></div>
            <div className="flex justify-between pt-2 border-t border-gray-100"><span className="font-bold text-gray-800">Amount</span><span className="font-bold text-pink-600">AED {order.amount}</span></div>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><MapPin size={15} className="text-pink-500" /> Addresses</h3>
          <div className="space-y-2.5">
            <div>
              <p className="text-xs text-gray-500 mb-1">Pickup</p>
              <p className="text-sm font-semibold text-gray-800">{order.pickupAddress}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Delivery</p>
              <p className="text-sm font-semibold text-gray-800">{order.deliveryAddress}</p>
            </div>
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-gray-500">Pickup: </span>
                <span className="font-semibold text-gray-700">{order.pickupSlot}</span>
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-gray-500">ETA: </span>
                <span className="font-semibold text-gray-700">{order.deliveryEta}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Driver */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Truck size={15} className="text-pink-500" /> Driver Assignment</h3>
          {order.driverName ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                {order.driverName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-sm">{order.driverName}</p>
                <div className="flex items-center gap-1">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-gray-500">4.8 rating</span>
                </div>
              </div>
              <button onClick={() => setShowDriverModal(true)} className="text-xs text-pink-600 font-bold bg-pink-50 px-3 py-1.5 rounded-xl">Reassign</button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-3">No driver assigned yet</p>
              <button onClick={() => setShowDriverModal(true)}
                className="text-white text-sm font-bold px-5 py-2 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                Assign Driver
              </button>
            </div>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-700 mb-1">Notes</p>
            <p className="text-sm text-amber-800">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mt-5">
        <button onClick={() => setShowDriverModal(true)}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
          <Truck size={15} /> {order.driverName ? 'Reassign Driver' : 'Assign Driver'}
        </button>
        <button onClick={() => setShowStatusModal(true)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
          <Edit size={15} /> Update Status
        </button>
        <button onClick={() => { updateOrderStatus(order.id, 'delivered'); showToast('Order marked as delivered'); }}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors">
          <CheckCircle size={15} /> Mark Delivered
        </button>
        <button onClick={() => { updateOrderStatus(order.id, 'escalated'); showToast('Order escalated'); }}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors">
          <AlertTriangle size={15} /> Escalate
        </button>
      </div>

      {/* Driver modal */}
      {showDriverModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Assign Driver</h3>
              <p className="text-gray-500 text-xs">Select an available driver for {order.id}</p>
            </div>
            <div className="p-3 max-h-72 overflow-y-auto space-y-1">
              {drivers.map(d => (
                <button key={d.id} onClick={() => handleAssignDriver(d.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-pink-50 transition-colors text-left ${d.id === order.driverId ? 'bg-pink-50' : ''}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                    {d.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.location} · {d.vehicle}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    d.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {d.status === 'available' ? 'Free' : 'Busy'}
                  </span>
                </button>
              ))}
            </div>
            <div className="px-4 pb-4">
              <button onClick={() => setShowDriverModal(false)} className="w-full py-2.5 bg-gray-100 rounded-xl text-gray-600 text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Status modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Update Status</h3>
            </div>
            <div className="p-3 space-y-1">
              {ALL_STATUSES.map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-pink-50 transition-colors ${s === order.status ? 'bg-pink-50 text-pink-600' : 'text-gray-700'}`}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="px-4 pb-4">
              <button onClick={() => setShowStatusModal(false)} className="w-full py-2.5 bg-gray-100 rounded-xl text-gray-600 text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
