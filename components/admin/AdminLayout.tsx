'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard, ShoppingBag, MessageCircle, Truck, Users,
  Building2, BarChart2, Settings, ChevronRight, LogOut,
  Bot, Factory, CreditCard, ClipboardCheck, Smartphone, type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppProvider } from '@/lib/app-context';

const NAV_SECTIONS = [
  {
    label: 'Operations',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, badge: '34' },
      { href: '/admin/drivers', label: 'Driver Dispatch', icon: Truck },
      { href: '/admin/facilities', label: 'Facilities', icon: Factory },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/admin/agent', label: 'WhatsApp Intelligence', icon: MessageCircle },
      { href: '/admin/ai-command', label: 'AI Command Center', icon: Bot },
    ],
  },
  {
    label: 'Clients',
    items: [
      { href: '/admin/customers', label: 'Customers', icon: Users },
      { href: '/admin/business', label: 'Business Clients', icon: Building2 },
      { href: '/admin/memberships', label: 'Memberships', icon: CreditCard },
    ],
  },
  {
    label: 'Workflow',
    items: [
      { href: '/admin/approvals', label: 'Approvals', icon: ClipboardCheck, badge: '7' },
      { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AppProvider>
      <div className="flex min-h-screen bg-gray-50">
        <aside className="w-60 bg-gray-900 flex-shrink-0 flex flex-col fixed left-0 top-0 bottom-0 z-40 hidden md:flex">
          <div className="px-5 py-5 border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                <Image src="/logo.png" alt="LaundryKhalas" width={28} height={28} className="object-contain" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">LaundryKhalas</p>
                <p className="text-gray-500 text-[10px] font-medium">Operations Platform</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
            {NAV_SECTIONS.map(section => (
              <div key={section.label}>
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5">{section.label}</p>
                <div className="space-y-0.5">
                  {section.items.map(({ href, label, icon: Icon, badge }: { href: string; label: string; icon: LucideIcon; badge?: string }) => {
                    const exact = href === '/admin';
                    const isActive = exact ? pathname === href : pathname.startsWith(href);
                    return (
                      <Link key={href} href={href}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                          isActive
                            ? 'text-white font-semibold'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                        )}
                        style={isActive ? { background: 'linear-gradient(135deg, #c2185b22, #e91e8c22)', borderLeft: '3px solid #e91e8c' } : {}}>
                        <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                        <span className="flex-1 truncate">{label}</span>
                        {badge && <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">{badge}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-gray-800 space-y-1">
            <Link href="/user" className="flex items-center gap-2.5 px-3 py-2.5 text-gray-400 hover:text-gray-200 rounded-xl hover:bg-gray-800 text-sm transition-all">
              <Smartphone size={16} />
              <span className="flex-1">Customer App</span>
              <ChevronRight size={14} />
            </Link>
            <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 text-gray-500 hover:text-red-400 rounded-xl hover:bg-gray-800 text-sm transition-all">
              <LogOut size={16} />
              Sign Out
            </Link>
          </div>
        </aside>

        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center overflow-hidden">
              <Image src="/logo.png" alt="LaundryKhalas" width={22} height={22} className="object-contain" />
            </div>
            <span className="text-white font-bold text-sm">LaundryKhalas</span>
          </div>
          <Link href="/user" className="text-gray-400 text-xs">Customer App</Link>
        </div>

        <main className="flex-1 md:ml-60 min-h-screen">
          <div className="pt-14 md:pt-0">{children}</div>
        </main>
      </div>
    </AppProvider>
  );
}
