'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, ORDERS, DRIVERS, Driver } from './mock-data';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

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
    if (!API) return;
    fetch(`${API}/api/orders`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setOrders(data); })
      .catch(() => {});
  }, []);

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o)
    );
    if (API) {
      fetch(`${API}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(() => {});
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
    if (API) {
      fetch(`${API}/api/orders/${orderId}/driver`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, driverName: driver.name }),
      }).catch(() => {});
    }
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setActiveOrderId(order.id);
    setNewOrderCreated(true);
    if (API) {
      fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      }).catch(() => {});
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
