'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, ORDERS, DRIVERS, Driver } from './mock-data';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'https://laundrykhalaas-api-production.up.railway.app')
  .replace(/^﻿/, '')
  .trim()
  .replace(/\/$/, '');

function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

interface AppState {
  orders: Order[];
  drivers: Driver[];
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  assignDriver: (orderId: string, driverId: string) => void;
  addOrder: (order: Order) => void;
  newOrderCreated: boolean;
  setNewOrderCreated: (v: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [drivers] = useState<Driver[]>(DRIVERS);
  const [activeOrderId, setActiveOrderId] = useState<string | null>('LK-AE-1024');
  const [newOrderCreated, setNewOrderCreated] = useState(false);

  useEffect(() => {
    if (!API_BASE) return;
    fetch(apiUrl('/api/orders'))
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setOrders(data); })
      .catch(e => console.error('[LaundryKhalaas] Failed to load orders:', e));
  }, []);

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const snapshot = orders;
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o)
    );
    if (API_BASE) {
      fetch(apiUrl(`/api/orders/${orderId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
        .then(r => {
          if (!r.ok) {
            r.json().then(err => console.error(`[LaundryKhalaas] Status update rejected (${r.status}):`, err)).catch(() => {});
            setOrders(snapshot);
          }
        })
        .catch(e => { console.error('[LaundryKhalaas] Status update failed:', e); setOrders(snapshot); });
    }
  };

  const assignDriver = (orderId: string, driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, driverId, driverName: driver.name, status: 'driver_assigned', updatedAt: new Date().toISOString() }
          : o
      )
    );
    if (API_BASE) {
      fetch(apiUrl(`/api/orders/${orderId}/driver`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, driverName: driver.name }),
      }).catch(e => console.error('[LaundryKhalaas] Driver assign failed:', e));
    }
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setActiveOrderId(order.id);
    setNewOrderCreated(true);
    if (API_BASE) {
      fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      }).catch(e => console.error('[LaundryKhalaas] Create order failed:', e));
    }
  };

  return (
    <AppContext.Provider value={{
      orders, drivers, activeOrderId, setActiveOrderId,
      updateOrderStatus, assignDriver, addOrder,
      newOrderCreated, setNewOrderCreated,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
