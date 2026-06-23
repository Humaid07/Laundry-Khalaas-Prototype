'use client';

import { ReactNode } from 'react';
import { UserBottomNav } from './UserBottomNav';
import { AppProvider } from '@/lib/app-context';

export function UserLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-md mx-auto min-h-screen bg-white relative shadow-2xl">
          <main className="pb-20">{children}</main>
          <UserBottomNav />
        </div>
      </div>
    </AppProvider>
  );
}
