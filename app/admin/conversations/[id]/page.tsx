'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAgent } from '@/lib/agent-context';
import { INTENT_LABELS, INTENT_COLORS } from '@/lib/agents/types';
import {
  ArrowLeft, Bot, User, CheckCircle, AlertOctagon,
  Clock, ExternalLink, Cpu, Wrench,
} from 'lucide-react';

const STATUS_CONFIG = {
  active: { badge: 'bg-green-100 text-green-700', label: 'Active' },
  resolved: { badge: 'bg-gray-100 text-gray-600', label: 'Resolved' },
  escalated: { badge: 'bg-red-100 text-red-700', label: 'Escalated' },
  waiting_human: { badge: 'bg-amber-100 text-amber-700', label: 'Waiting for Human' },
};

const SENTIMENT_CONFIG = {
  positive: { label: 'Positive', badge: 'bg-green-100 text-green-700' },
  neutral: { label: 'Neutral', badge: 'bg-gray-100 text-gray-600' },
  negative: { label: 'Negative', badge: 'bg-red-100 text-red-700' },
};

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { conversations, agentRuns, escalations, resolveConversation, takeOverConversation } = useAgent();

  const conv = conversations.find(c => c.id === params.id);
  if (!conv) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Conversation not found</p>
        <button onClick={() => router.back()} className="mt-3 text-pink-600 text-sm font-semibold">Go back</button>
      </div>
    );
  }

  const relatedRuns = agentRuns.filter(r => r.conversationId === conv.id);
  const relatedEsc = conv.escalationId ? escalations.find(e => e.id === conv.escalationId) : null;
  const stCfg = STATUS_CONFIG[conv.status];
  const sentCfg = SENTIMENT_CONFIG[conv.sentiment];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.push('/admin/conversations')}
          className="p-2 rounded-xl bg-white border border-gray-100 hover:border-gray-200">
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{conv.customerName ?? conv.customerPhone}</h1>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stCfg.badge}`}>{stCfg.label}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sentCfg.badge}`}>{sentCfg.label}</span>
          </div>
          <p className="text-sm text-gray-500">{conv.customerPhone}</p>
        </div>
        <div className="flex items-center gap-2">
          {conv.status !== 'resolved' && (
            <>
              <button onClick={() => takeOverConversation(conv.id)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600">
                <User size={12} /> Take Over
              </button>
              <button onClick={() => resolveConversation(conv.id)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                <CheckCircle size={12} /> Resolve
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: messages */}
        <div className="lg:col-span-2 space-y-4">
          {/* Meta */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mb-0.5">Channel</p>
                <p className="text-sm font-bold text-gray-800 capitalize">{conv.channel}</p>
              </div>
              {conv.intent && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mb-0.5">Intent</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${INTENT_COLORS[conv.intent]}`}>
                    {INTENT_LABELS[conv.intent]}
                  </span>
                </div>
              )}
              {conv.activeOrderId && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mb-0.5">Order</p>
                  <button onClick={() => router.push(`/admin/orders/${conv.activeOrderId}`)}
                    className="text-xs font-bold text-pink-600 flex items-center gap-1 hover:underline">
                    {conv.activeOrderId} <ExternalLink size={10} />
                  </button>
                </div>
              )}
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mb-0.5">Messages</p>
                <p className="text-sm font-bold text-gray-800">{conv.messages.length}</p>
              </div>
            </div>
            {conv.summary && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mb-1">Agent Summary</p>
                <p className="text-xs text-gray-600 leading-relaxed">{conv.summary}</p>
              </div>
            )}
          </div>

          {/* Message thread */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm">Message Thread</h3>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {conv.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                    msg.role === 'customer' ? 'bg-gray-50 border border-gray-100' : 'text-white'
                  }`} style={msg.role !== 'customer' ? { background: 'linear-gradient(135deg, #c2185b, #e91e8c)' } : {}}>
                    {msg.agentName && (
                      <div className="flex items-center gap-1 mb-1 opacity-70">
                        <Bot size={10} />
                        <span className="text-[9px] font-bold uppercase tracking-wide">{msg.agentName}</span>
                      </div>
                    )}
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
                        <p className="text-[9px] font-bold opacity-70 uppercase tracking-wide flex items-center gap-1">
                          <Wrench size={8} /> Tool Calls
                        </p>
                        {msg.toolCalls.map((tc, i) => (
                          <div key={i} className="bg-white/15 rounded-lg px-2 py-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono font-bold">{tc.name}</span>
                              <span className="text-[9px] opacity-70">{tc.durationMs}ms</span>
                            </div>
                            {tc.output && (
                              <p className="text-[9px] opacity-70 mt-0.5 truncate">
                                {JSON.stringify(tc.output).slice(0, 60)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[9px] opacity-50 mt-1">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: agent trace + escalation */}
        <div className="space-y-4">
          {/* Escalation card */}
          {relatedEsc && (
            <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertOctagon size={14} className="text-red-500" />
                <h3 className="font-bold text-red-700 text-sm">Escalation</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto ${
                  relatedEsc.status === 'open' ? 'bg-red-100 text-red-700' :
                  relatedEsc.status === 'assigned' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {relatedEsc.status}
                </span>
              </div>
              <p className="text-xs text-red-700 font-semibold mb-1">{relatedEsc.reason}</p>
              <p className="text-xs text-red-600 leading-relaxed mb-2">{relatedEsc.summary}</p>
              <div className="bg-white/70 rounded-xl p-2.5">
                <p className="text-[10px] font-bold text-blue-700 mb-0.5">Recommended Action</p>
                <p className="text-xs text-blue-600">{relatedEsc.recommendedAction}</p>
              </div>
              <button onClick={() => router.push('/admin/escalations')}
                className="mt-3 w-full text-xs font-bold text-red-600 hover:underline text-center">
                View in Escalations →
              </button>
            </div>
          )}

          {/* Order draft */}
          {conv.orderDraft && Object.keys(conv.orderDraft).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3">Order Draft</h3>
              <div className="space-y-2">
                {Object.entries(conv.orderDraft).map(([key, val]) => val && (
                  <div key={key} className="flex justify-between items-start gap-2">
                    <p className="text-[10px] text-gray-400 capitalize font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-xs text-gray-700 font-semibold text-right max-w-[60%]">{String(val)}</p>
                  </div>
                ))}
              </div>
              {conv.missingFields.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-amber-600 mb-1">Missing Fields</p>
                  <div className="flex flex-wrap gap-1">
                    {conv.missingFields.map(f => (
                      <span key={f} className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Agent decision trace */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cpu size={13} className="text-pink-500" />
              <h3 className="font-bold text-gray-800 text-sm">Agent Decision Trace</h3>
            </div>
            {relatedRuns.length === 0 ? (
              <p className="text-xs text-gray-400">No agent runs recorded for this conversation</p>
            ) : (
              <div className="space-y-3">
                {relatedRuns.map((run, i) => (
                  <div key={run.id} className="relative pl-4 pb-3 last:pb-0 border-l-2 border-gray-100 last:border-transparent">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-gray-200 flex items-center justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        run.status === 'success' ? 'bg-green-500' : run.status === 'escalated' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">{run.agentName}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{run.outputSummary}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-gray-400 font-mono">{run.durationMs}ms</span>
                      {run.toolsUsed.length > 0 && (
                        <span className="text-[9px] text-gray-400">· {run.toolsUsed.length} tool{run.toolsUsed.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
