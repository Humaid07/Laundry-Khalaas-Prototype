'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, RotateCcw, FileText, MessageCircle, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function OrdersPage() {
  const router = useRouter();
  const { orders } = useApp();

  const myOrders = orders.filter(o => o.customerId === 'c1');
  const active = myOrders.filter(o => !['delivered'].includes(o.status));
  const past = myOrders.filter(o => o.status === 'delivered');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-5 pt-12 pb-6" style={{ background: 'linear-gradient(145deg, #c2185b 0%, #e91e8c 50%, #f06292 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">My Orders</h1>
            <p className="text-pink-100 text-xs">{myOrders.length} orders total</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-4">
        {active.length > 0 && (
          <div className="mb-5">
            <h3 className="text-gray-700 font-bold text-sm mb-2.5 uppercase tracking-wide">Active</h3>
            <div className="space-y-2.5">
              {active.map(order => (
                <div key={order.id}
                  onClick={() => router.push(`/user/orders/${order.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer card-hover">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-pink-500" />
                      <span className="font-bold text-gray-800 text-sm">{order.id}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{order.services.join(' + ')}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-gray-400 text-xs">Pickup: {order.pickupSlot}</p>
                      <p className="text-gray-400 text-xs">Delivery: {order.deliveryEta}</p>
                    </div>
                    <span className="text-pink-600 font-bold text-sm">AED {order.amount}</span>
                  </div>
                  {order.driverName && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                          {order.driverName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{order.driverName}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); router.push(`/user/orders/${order.id}`); }}
                          className="text-xs text-pink-600 font-bold bg-pink-50 px-2.5 py-1 rounded-lg">Track</button>
                        <button onClick={(e) => { e.stopPropagation(); router.push('/user/agent'); }}
                          className="text-xs text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <MessageCircle size={11} /> Agent
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h3 className="text-gray-700 font-bold text-sm mb-2.5 uppercase tracking-wide">Past Orders</h3>
            <div className="space-y-2.5">
              {past.map(order => (
                <div key={order.id}
                  onClick={() => router.push(`/user/orders/${order.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer card-hover">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-gray-400" />
                      <span className="font-bold text-gray-700 text-sm">{order.id}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{order.services.join(' + ')}</p>
                  <p className="text-gray-400 text-xs mb-3">Delivered: {order.deliveryEta}</p>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); router.push('/user/book'); }}
                      className="flex items-center gap-1.5 text-xs text-pink-600 font-bold bg-pink-50 px-3 py-1.5 rounded-xl">
                      <RotateCcw size={12} /> Rebook
                    </button>
                    <button onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold bg-gray-100 px-3 py-1.5 rounded-xl">
                      <FileText size={12} /> Invoice
                    </button>
                    <span className="ml-auto text-pink-600 font-bold text-sm self-center">AED {order.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {myOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-pink-300" />
            </div>
            <h3 className="text-gray-700 font-bold text-lg mb-2">No orders yet</h3>
            <p className="text-gray-400 text-sm mb-6">Book your first laundry pickup today</p>
            <button onClick={() => router.push('/user/book')}
              className="text-white font-bold px-6 py-3 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
              Book a Pickup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
