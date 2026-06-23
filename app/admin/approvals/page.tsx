'use client';

import { useState } from 'react';
import { ClipboardCheck, CheckCircle, XCircle, Clock, FileText, RefreshCw, UserCheck, Building2, type LucideIcon } from 'lucide-react';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface ApprovalItem {
  id: string;
  category: 'contract' | 'refund' | 'exception' | 'driver';
  title: string;
  subtitle: string;
  value?: string;
  submittedBy: string;
  submittedAt: string;
  priority: 'high' | 'normal';
  status: ApprovalStatus;
}

const INITIAL_ITEMS: ApprovalItem[] = [
  {
    id: 'a1', category: 'contract',
    title: 'Sharjah Corporate Towers — Contract Renewal',
    subtitle: 'Contract expires Jul 1, 2026 · Monthly volume: 90 kg',
    value: 'AED 4,800/mo',
    submittedBy: 'Auto-generated', submittedAt: '2 days ago',
    priority: 'high', status: 'pending',
  },
  {
    id: 'a2', category: 'contract',
    title: 'Palm Fitness Center — New B2B Contract',
    subtitle: 'Towels & uniforms · Al Wasl, Dubai · New client onboarding',
    value: 'AED 2,200/mo',
    submittedBy: 'Sara Al Blooshi', submittedAt: '1 day ago',
    priority: 'normal', status: 'pending',
  },
  {
    id: 'a3', category: 'refund',
    title: 'Nadia Farhat — Refund Request',
    subtitle: 'Order LK-AE-1015 · Delivery missed window by 3 hours',
    value: 'AED 85',
    submittedBy: 'Customer (WhatsApp)', submittedAt: '2 hrs ago',
    priority: 'high', status: 'pending',
  },
  {
    id: 'a4', category: 'refund',
    title: 'David Chen — Partial Refund',
    subtitle: 'Order LK-AE-1021 · Missing item from delivery',
    value: 'AED 30',
    submittedBy: 'Customer (App)', submittedAt: '5 hrs ago',
    priority: 'normal', status: 'pending',
  },
  {
    id: 'a5', category: 'refund',
    title: 'Jumeirah Grand Hotel — Service Quality Claim',
    subtitle: 'Order LK-AE-1026 · Fragrance complaint on hotel linen',
    value: 'AED 200',
    submittedBy: 'Mohammed Al Suwaidi', submittedAt: 'Yesterday',
    priority: 'high', status: 'pending',
  },
  {
    id: 'a6', category: 'exception',
    title: 'Marriott Downtown — Rush SLA Request',
    subtitle: '500 items, same-day turnaround · Non-standard SLA override needed',
    value: 'AED 3,500',
    submittedBy: 'Tariq Farhan', submittedAt: '4 hrs ago',
    priority: 'high', status: 'pending',
  },
  {
    id: 'a7', category: 'driver',
    title: 'Ahmad Siddiqui — Driver Application',
    subtitle: 'Dubai · Toyota Hiace · License valid · Background check: clear',
    submittedBy: 'HR System', submittedAt: '2 days ago',
    priority: 'normal', status: 'pending',
  },
  {
    id: 'a8', category: 'driver',
    title: 'Layla Hussain — Driver Application',
    subtitle: 'Abu Dhabi · Hyundai H-1 · License valid · Background check: clear',
    submittedBy: 'HR System', submittedAt: '3 days ago',
    priority: 'normal', status: 'pending',
  },
  {
    id: 'a9', category: 'driver',
    title: 'Rahul Sharma — Driver Application',
    subtitle: 'Dubai · Kia Bongo · License valid · Background check: pending',
    submittedBy: 'HR System', submittedAt: '4 days ago',
    priority: 'normal', status: 'pending',
  },
  {
    id: 'a10', category: 'driver',
    title: 'Bilal Khan — Driver Application',
    subtitle: 'Sharjah · Toyota Hiace · License valid · Background check: clear',
    submittedBy: 'HR System', submittedAt: '5 days ago',
    priority: 'normal', status: 'pending',
  },
];

type FilterTab = 'all' | 'contract' | 'refund' | 'exception' | 'driver';

const TABS: { id: FilterTab; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'All', icon: ClipboardCheck },
  { id: 'contract', label: 'Contracts', icon: FileText },
  { id: 'refund', label: 'Refunds', icon: RefreshCw },
  { id: 'exception', label: 'Exceptions', icon: Clock },
  { id: 'driver', label: 'Drivers', icon: UserCheck },
];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  contract: Building2,
  refund: RefreshCw,
  exception: Clock,
  driver: UserCheck,
};

const CATEGORY_COLORS: Record<string, string> = {
  contract: 'bg-blue-100 text-blue-700',
  refund: 'bg-amber-100 text-amber-700',
  exception: 'bg-purple-100 text-purple-700',
  driver: 'bg-green-100 text-green-700',
};

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>(INITIAL_ITEMS);
  const [tab, setTab] = useState<FilterTab>('all');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const act = (id: string, action: 'approved' | 'rejected') => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: action } : i));
    showToast(action === 'approved' ? 'Approved and team notified' : 'Rejected and submitter notified');
  };

  const filtered = items.filter(i => tab === 'all' || i.category === tab);
  const pending = filtered.filter(i => i.status === 'pending');
  const actioned = filtered.filter(i => i.status !== 'pending');

  const pendingCount = (cat?: FilterTab) =>
    items.filter(i => i.status === 'pending' && (cat === 'all' || cat === undefined ? true : i.category === cat)).length;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-500 text-sm">{pendingCount()} items pending · Review and act</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const count = id === 'all' ? pendingCount() : pendingCount(id);
          return (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
                tab === id ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-200'
              }`}
              style={tab === id ? { background: 'linear-gradient(135deg, #c2185b, #e91e8c)' } : {}}>
              <Icon size={13} /> {label}
              {count > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {pending.length > 0 && (
        <div className="space-y-3 mb-6">
          {pending.map(item => {
            const Icon = CATEGORY_ICONS[item.category];
            return (
              <div key={item.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${item.priority === 'high' ? 'border-amber-200' : 'border-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${CATEGORY_COLORS[item.category]}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-bold text-gray-900 text-sm leading-snug">{item.title}</p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {item.priority === 'high' && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Priority</span>
                        )}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[item.category]}`}>
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{item.subtitle}</p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span>By {item.submittedBy}</span>
                      <span>·</span>
                      <span>{item.submittedAt}</span>
                      {item.value && <><span>·</span><span className="text-pink-600 font-bold text-xs">{item.value}</span></>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => act(item.id, 'approved')}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white flex-1 justify-center"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button onClick={() => act(item.id, 'rejected')}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-red-50 text-red-600 flex-1 justify-center border border-red-100">
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {actioned.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Recently Actioned</h3>
          <div className="space-y-2">
            {actioned.map(item => (
              <div key={item.id} className={`bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 opacity-70`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'approved' ? 'bg-green-500' : 'bg-red-400'}`} />
                <p className="text-xs text-gray-600 flex-1 truncate">{item.title}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {item.status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && actioned.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h3 className="text-gray-700 font-bold text-lg">All clear</h3>
          <p className="text-gray-400 text-sm mt-1">No pending approvals in this category</p>
        </div>
      )}
    </div>
  );
}
