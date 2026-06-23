'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3x3, ShoppingBag, CreditCard, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/user', label: 'Home', icon: Home },
  { href: '/user/services', label: 'Services', icon: Grid3x3 },
  { href: '/user/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/user/memberships', label: 'Membership', icon: CreditCard },
  { href: '/user/profile', label: 'Profile', icon: User },
];

export function UserBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-xl">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const exact = href === '/user';
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200',
              isActive ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'
            )}>
              <div className={cn('p-1.5 rounded-xl transition-all duration-200', isActive && 'bg-pink-50')}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={cn('text-[10px]', isActive ? 'font-bold' : 'font-medium')}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
