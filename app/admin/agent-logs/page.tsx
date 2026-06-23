'use client';

import { useState } from 'react';
import { useAgent } from '@/lib/agent-context';
import { AgentRun } from '@/lib/agents/types';
import { INTENT_LABELS, INTENT_COLORS } from '@/lib/agents/types';
import { ScrollText, CheckCircle, AlertTriangle, XCircle, Filter } from 'lucide-react';

const STATUS_CONFIG = {
  success: { label: 'Success', badge: 'bg-green-100 text-green-700', icon: CheckCircle, dot: 'bg-green-500' },
  escalated: { label: 'Escalated', badge: 'bg-amber-100 text-amber-700', icon: AlertTriangle, dot: 'bg-amber-500' },
  error: { label: 'Error', badge: 'bg-red-100 text-red-700', icon: XCircle, dot: 'bg-red-500' },
};

const AGENT_NAMES = [
  'All Agents',
  'Customer Order Agent',
  'Intent Classifier',
  'Operations Orchestrator',
  'Human Escalation Agent',
  'Content Planning Agent',
  'Social Media Agent',
  'Brand Review Agent',
  'SEO & Blog Agent',
  'Paid Ads Agent',
  'Lead Generation Agent',
  'Marketing Analytics Agent',
];

export default function AgentLogsPage() {
  const { agentRuns } = useAgent();
  const [agentFilter, setAgentFilter] = useState('All Agents');
  const [statusFilter, setStatusFilter] = useState<'all' | AgentRun['status']>('all');

  const filtered = agentRuns.filter(r => {
    const matchAgent = agentFilter === 'All Agents' || r.agentName === agentFilter;
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchAgent && matchStatus;
  });

  const successCount = agentRuns.filter(r => r.status === 'success').length;
  const escalatedCount = agentRuns.filter(r => r.status === 'escalated').length;
  const errorCount = agentRuns.filter(r => r.status === 'error').length;
  const avgDuration = Math.round(agentRuns.reduce((s, r) => s + r.durationMs, 0) / Math.max(agentRuns.length, 1));

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Agent Logs</h1>
        <p className="text-gray-500 text-sm">{agentRuns.length} total runs · Full decision trace</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Runs', value: agentRuns.length, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'Successful', value: successCount, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Escalated', value: escalatedCount, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg Duration', value: `${avgDuration}ms`, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-gray-100 p-4`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
          <Filter size={13} className="text-gray-400" />
          <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)}
            className="text-xs font-semibold text-gray-700 bg-transparent outline-none cursor-pointer">
            {AGENT_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex gap-1.5">
          {(['all', 'success', 'escalated', 'error'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                statusFilter === s ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-200'
              }`}
              style={statusFilter === s ? { background: 'linear-gradient(135deg, #c2185b, #e91e8c)' } : {}}>
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Log table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Agent</th>
                <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Input</th>
                <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Intent</th>
                <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Tools</th>
                <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Output</th>
                <th className="text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">ms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(run => {
                const stCfg = STATUS_CONFIG[run.status];
                return (
                  <tr key={run.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${stCfg.dot}`} />
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stCfg.badge}`}>{stCfg.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-800 whitespace-nowrap">{run.agentName}</p>
                      {run.conversationId && (
                        <p className="text-[10px] text-gray-400">{run.conversationId}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="text-xs text-gray-600 truncate">{run.inputSummary}</p>
                    </td>
                    <td className="px-4 py-3">
                      {run.intentDetected ? (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${INTENT_COLORS[run.intentDetected]}`}>
                          {INTENT_LABELS[run.intentDetected]}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {run.toolsUsed.length > 0 ? run.toolsUsed.slice(0, 2).map(t => (
                          <span key={t} className="text-[9px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded whitespace-nowrap">
                            {t}
                          </span>
                        )) : <span className="text-gray-300 text-[10px]">—</span>}
                        {run.toolsUsed.length > 2 && <span className="text-[9px] text-gray-400">+{run.toolsUsed.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-xs text-gray-600 truncate">{run.outputSummary}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-mono font-bold ${run.durationMs < 100 ? 'text-green-600' : run.durationMs < 500 ? 'text-blue-600' : 'text-amber-600'}`}>
                        {run.durationMs}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ScrollText size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No logs match the current filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
