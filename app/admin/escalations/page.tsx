'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgent } from '@/lib/agent-context';
import { Escalation } from '@/lib/agents/types';
import {
  AlertOctagon, CheckCircle, UserCog, ExternalLink, Clock,
  AlertTriangle, MessageCircle,
} from 'lucide-react';

const PRIORITY_CONFIG = {
  high: { bg: 'bg-red-50 border-red-200', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700', label: 'High Priority' },
  medium: { bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Medium' },
  low: { bg: 'bg-gray-50 border-gray-100', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600', label: 'Low' },
};

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'resolved', label: 'Resolved' },
] as const;

const TEAM = ['Sara Al Blooshi', 'Mohammed Hassan', 'Tariq Farhan'];

export default function EscalationsPage() {
  const router = useRouter();
  const { escalations, resolveEscalation, assignEscalation } = useAgent();
  const [statusTab, setStatusTab] = useState<'all' | 'open' | 'assigned' | 'resolved'>('all');
  const [toast, setToast] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const filtered = statusTab === 'all' ? escalations : escalations.filter(e => e.status === statusTab);
  const openCount = escalations.filter(e => e.status === 'open').length;
  const assignedCount = escalations.filter(e => e.status === 'assigned').length;
  const resolvedCount = escalations.filter(e => e.status === 'resolved').length;

  const handleResolve = (id: string) => {
    resolveEscalation(id);
    showToast('Escalation resolved and customer notified');
  };

  const handleAssign = (id: string, member: string) => {
    assignEscalation(id, member);
    setAssigningId(null);
    showToast(`Escalation assigned to ${member}`);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Escalations</h1>
          <p className="text-gray-500 text-sm">{openCount} open · {assignedCount} assigned · {resolvedCount} resolved</p>
        </div>
        {openCount > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-500" />
            <span className="text-sm font-bold text-red-600">{openCount} require action</span>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{openCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Open</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{assignedCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Assigned</p>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Resolved</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {STATUS_TABS.map(({ id, label }) => {
          const count = id === 'all' ? escalations.length : escalations.filter(e => e.status === id).length;
          return (
            <button key={id} onClick={() => setStatusTab(id)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                statusTab === id ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-200'
              }`}
              style={statusTab === id ? { background: 'linear-gradient(135deg, #c2185b, #e91e8c)' } : {}}>
              {label} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Escalation cards */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h3 className="text-gray-700 font-bold text-lg">All clear</h3>
            <p className="text-gray-400 text-sm mt-1">No escalations in this category</p>
          </div>
        )}

        {filtered.map(esc => {
          const pri = PRIORITY_CONFIG[esc.priority];
          return (
            <div key={esc.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${pri.bg}`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${pri.dot}`} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-bold text-gray-900 text-sm">{esc.customerName ?? 'Unknown Customer'}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${pri.badge}`}>{pri.label}</span>
                      {esc.orderId && (
                        <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full">{esc.orderId}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{esc.customerPhone}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                  esc.status === 'open' ? 'bg-red-100 text-red-700' :
                  esc.status === 'assigned' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {esc.status === 'assigned' ? `Assigned · ${esc.assignedTo?.split(' ')[0]}` : esc.status.charAt(0).toUpperCase() + esc.status.slice(1)}
                </span>
              </div>

              {/* Reason */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">Reason</p>
                <p className="text-xs text-gray-600">{esc.reason}</p>
              </div>

              {/* Summary */}
              <div className="bg-white/70 rounded-xl p-3 mb-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">Context Summary</p>
                <p className="text-xs text-gray-600 leading-relaxed">{esc.summary}</p>
              </div>

              {/* Recommended action */}
              <div className="bg-white/70 rounded-xl p-3 mb-3 border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-1">Recommended Action</p>
                <p className="text-xs text-blue-600 leading-relaxed">{esc.recommendedAction}</p>
              </div>

              {/* Created */}
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-3">
                <Clock size={11} />
                <span>Created {new Date(esc.createdAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}</span>
                {esc.resolvedAt && <span>· Resolved {new Date(esc.resolvedAt).toLocaleDateString('en-AE', { month: 'short', day: 'numeric' })}</span>}
              </div>

              {/* Actions */}
              {esc.status !== 'resolved' && (
                <div className="flex gap-2 flex-wrap pt-3 border-t border-white/60">
                  <button
                    onClick={() => router.push(`/admin/conversations/${esc.conversationId}`)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200">
                    <MessageCircle size={12} /> View Conversation
                  </button>
                  {esc.orderId && (
                    <button
                      onClick={() => router.push(`/admin/orders/${esc.orderId}`)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200">
                      <ExternalLink size={12} /> View Order
                    </button>
                  )}

                  {/* Assign dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setAssigningId(assigningId === esc.id ? null : esc.id)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600">
                      <UserCog size={12} /> Assign
                    </button>
                    {assigningId === esc.id && (
                      <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
                        {TEAM.map(member => (
                          <button key={member} onClick={() => handleAssign(esc.id, member)}
                            className="block w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-pink-50 hover:text-pink-700 whitespace-nowrap">
                            {member}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleResolve(esc.id)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                    <CheckCircle size={12} /> Mark Resolved
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
