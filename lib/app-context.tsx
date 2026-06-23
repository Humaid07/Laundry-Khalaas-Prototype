'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order, ORDERS, DRIVERS, Driver } from './mock-data';

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

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o)
    );
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
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setActiveOrderId(order.id);
    setNewOrderCreated(true);
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
