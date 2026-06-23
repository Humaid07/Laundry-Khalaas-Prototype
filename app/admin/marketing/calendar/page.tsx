'use client';

import { useRouter } from 'next/navigation';
import { useAgent } from '@/lib/agent-context';
import { CalendarSlot } from '@/lib/agents/types';
import { ArrowLeft, Instagram, Facebook, Globe, FileText, Megaphone, CheckCircle2, Clock } from 'lucide-react';

const PLATFORM_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  instagram: { label: 'Instagram', color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200', icon: Instagram },
  facebook: { label: 'Facebook', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: Facebook },
  whatsapp: { label: 'WhatsApp', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: Megaphone },
  blog: { label: 'Blog', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200', icon: FileText },
  google_ads: { label: 'Google Ads', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: Globe },
  tiktok: { label: 'TikTok', color: 'text-gray-900', bg: 'bg-gray-100 border-gray-200', icon: Megaphone },
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', badge: 'bg-gray-100 text-gray-500', action: 'review' as const },
  draft: { label: 'Draft', badge: 'bg-blue-100 text-blue-600', action: 'review' as const },
  review: { label: 'Review', badge: 'bg-amber-100 text-amber-700', action: 'approved' as const },
  approved: { label: 'Approved', badge: 'bg-green-100 text-green-700', action: null },
  rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-700', action: null },
};

const DAYS = ['Mon Jun 23', 'Tue Jun 24', 'Wed Jun 25', 'Thu Jun 26', 'Fri Jun 27', 'Sat Jun 28', 'Sun Jun 29'];
const DATES = ['2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26', '2026-06-27', '2026-06-28', '2026-06-29'];

export default function ContentCalendarPage() {
  const router = useRouter();
  const { calendarSlots, updateCalendarSlot } = useAgent();

  const slotsByDate = DATES.reduce<Record<string, CalendarSlot[]>>((acc, date) => {
    acc[date] = calendarSlots.filter(s => s.date === date);
    return acc;
  }, {});

  const approvedCount = calendarSlots.filter(s => s.status === 'approved').length;
  const reviewCount = calendarSlots.filter(s => s.status === 'review').length;
  const pendingCount = calendarSlots.filter(s => s.status === 'pending').length;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.push('/admin/marketing')}
          className="p-2 rounded-xl bg-white border border-gray-100 hover:border-gray-200">
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-500 text-sm">Week of Jun 23–29, 2026 · {calendarSlots.length} slots</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-5">
        <div className="bg-green-50 rounded-2xl border border-green-100 p-3 text-center">
          <p className="text-xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-[10px] text-gray-500">Approved</p>
        </div>
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{reviewCount}</p>
          <p className="text-[10px] text-gray-500">In Review</p>
        </div>
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-3 text-center">
          <p className="text-xl font-bold text-gray-600">{pendingCount}</p>
          <p className="text-[10px] text-gray-500">Pending</p>
        </div>
        <div className="col-span-2 md:col-span-2 bg-white rounded-2xl border border-gray-100 p-3">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const count = calendarSlots.filter(s => s.platform === key).length;
              return count > 0 ? (
                <div key={key} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                  <Icon size={10} /> {count}
                </div>
              ) : null;
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">by platform</p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {DATES.map((date, dayIdx) => {
          const slots = slotsByDate[date] ?? [];
          return (
            <div key={date} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-bold text-gray-700">{DAYS[dayIdx].split(' ')[0]}</p>
                <p className="text-[10px] text-gray-400">{DAYS[dayIdx].split(' ').slice(1).join(' ')}</p>
              </div>
              <div className="p-2 space-y-2 min-h-[120px]">
                {slots.length === 0 && (
                  <div className="flex items-center justify-center h-16 text-gray-200">
                    <p className="text-[10px]">No content</p>
                  </div>
                )}
                {slots.map(slot => {
                  const plt = PLATFORM_CONFIG[slot.platform] ?? { label: slot.platform, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100', icon: Globe };
                  const Icon = plt.icon;
                  const stCfg = STATUS_CONFIG[slot.status];
                  const canAdvance = stCfg.action !== null;

                  return (
                    <div key={slot.id} className={`rounded-xl border p-2 ${plt.bg} text-xs`}>
                      <div className="flex items-center gap-1 mb-1">
                        <Icon size={10} className={plt.color} />
                        <span className={`text-[9px] font-bold uppercase tracking-wide ${plt.color}`}>{plt.label}</span>
                      </div>
                      <p className="text-[10px] font-semibold text-gray-800 leading-tight mb-1.5 line-clamp-2">{slot.title}</p>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full ${stCfg.badge}`}>
                          {stCfg.label}
                        </span>
                        {canAdvance && (
                          <button
                            onClick={() => updateCalendarSlot(slot.id, stCfg.action!)}
                            className="text-[8px] font-bold text-pink-600 hover:text-pink-800 flex items-center gap-0.5">
                            {stCfg.action === 'review' ? <Clock size={8} /> : <CheckCircle2 size={8} />}
                            {stCfg.action === 'review' ? 'Review' : 'Approve'}
                          </button>
                        )}
                        {slot.status === 'approved' && (
                          <CheckCircle2 size={10} className="text-green-500" />
                        )}
                      </div>
                      {slot.contentType && (
                        <span className="text-[8px] text-gray-400 mt-1 block">{slot.contentType}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 flex-wrap">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Status legend:</p>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
