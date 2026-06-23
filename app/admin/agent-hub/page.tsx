'use client';

import { useState } from 'react';
import { useAgent } from '@/lib/agent-context';
import { AgentRegistration } from '@/lib/agents/types';
import {
  Cpu, CheckCircle, PauseCircle, AlertCircle, Clock,
  TrendingUp, Zap, BarChart2, Play, Power,
} from 'lucide-react';

const STATUS_CONFIG = {
  active: { dot: 'bg-green-500', label: 'Active', text: 'text-green-600', bg: 'bg-green-50' },
  idle: { dot: 'bg-gray-400', label: 'Idle', text: 'text-gray-600', bg: 'bg-gray-100' },
  paused: { dot: 'bg-amber-400', label: 'Paused', text: 'text-amber-600', bg: 'bg-amber-50' },
  error: { dot: 'bg-red-500', label: 'Error', text: 'text-red-600', bg: 'bg-red-50' },
};

const CATEGORY_LABELS: Record<AgentRegistration['category'], string> = {
  operations: 'Operations',
  marketing: 'Marketing',
  support: 'Support',
};

export default function AgentHubPage() {
  const { agentRegistry, agentRuns, toggleAgent, runMarketingAgent } = useAgent();
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'operations' | 'marketing'>('all');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const filtered = activeCategory === 'all' ? agentRegistry : agentRegistry.filter(a => a.category === activeCategory);
  const opsAgents = agentRegistry.filter(a => a.category === 'operations');
  const mktAgents = agentRegistry.filter(a => a.category === 'marketing');

  const totalRunsToday = agentRegistry.reduce((s, a) => s + a.runsToday, 0);
  const avgSuccessRate = Math.round(agentRegistry.reduce((s, a) => s + a.successRate, 0) / agentRegistry.length);
  const activeCount = agentRegistry.filter(a => a.status === 'active').length;
  const todayEscalations = agentRuns.filter(r => r.status === 'escalated').length;

  const handleRunMarketing = async (agent: AgentRegistration) => {
    setRunningAgent(agent.id);
    await new Promise(r => setTimeout(r, 900));
    runMarketingAgent(agent.id, `Generate ${agent.name.toLowerCase()} content for LaundryKhalas UAE operations`);
    setRunningAgent(null);
    showToast(`${agent.name} completed — new draft ready for review`);
  };

  const isOpsAgent = (id: string) =>
    ['customer-order-agent', 'intent-classifier', 'orchestration-agent', 'escalation-agent'].includes(id);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Hub</h1>
          <p className="text-gray-500 text-sm mt-0.5">{agentRegistry.length} agents · Unified control center</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-600 font-medium">{activeCount} agents running</span>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Runs Today', value: totalRunsToday, icon: Zap, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'Avg Success Rate', value: `${avgSuccessRate}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Active Agents', value: activeCount, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Escalations Today', value: todayEscalations, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}>
              <Icon size={17} className={color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5">
        {(['all', 'operations', 'marketing'] as const).map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              activeCategory === cat ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-200'
            }`}
            style={activeCategory === cat ? { background: 'linear-gradient(135deg, #c2185b, #e91e8c)' } : {}}>
            {cat === 'all' ? `All Agents (${agentRegistry.length})` : cat === 'operations' ? `Operations (${opsAgents.length})` : `Marketing (${mktAgents.length})`}
          </button>
        ))}
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(agent => {
          const statusCfg = STATUS_CONFIG[agent.status];
          const isRunning = runningAgent === agent.id;
          const ops = isOpsAgent(agent.id);

          return (
            <div key={agent.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${
                !agent.isEnabled ? 'opacity-50 border-gray-100' : 'border-gray-100 hover:border-pink-100'
              }`}>
              {/* Agent header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${agent.color}`}>
                    <Cpu size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">{agent.name}</h3>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      {CATEGORY_LABELS[agent.category]}
                    </span>
                  </div>
                </div>
                <button onClick={() => toggleAgent(agent.id)}
                  className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${agent.isEnabled ? 'text-pink-500 bg-pink-50 hover:bg-pink-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}
                  title={agent.isEnabled ? 'Pause agent' : 'Enable agent'}>
                  {agent.isEnabled ? <Power size={13} /> : <Play size={13} />}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{agent.description}</p>

              {/* Capabilities */}
              <div className="flex flex-wrap gap-1 mb-3">
                {agent.capabilities.slice(0, 2).map(cap => (
                  <span key={cap} className="text-[10px] font-medium bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100 truncate max-w-[160px]">
                    {cap}
                  </span>
                ))}
                {agent.capabilities.length > 2 && (
                  <span className="text-[10px] text-gray-400 px-1">+{agent.capabilities.length - 2} more</span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <p className="text-sm font-bold text-gray-900">{agent.runsToday}</p>
                  <p className="text-[10px] text-gray-500">Runs Today</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <p className="text-sm font-bold text-green-600">{agent.successRate}%</p>
                  <p className="text-[10px] text-gray-500">Success</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <p className="text-sm font-bold text-gray-900">{agent.avgDurationMs}ms</p>
                  <p className="text-[10px] text-gray-500">Avg Time</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusCfg.dot}`} />
                  <span className={`text-[10px] font-bold ${statusCfg.text}`}>{statusCfg.label}</span>
                  {agent.lastRun && (
                    <span className="text-[10px] text-gray-400">· {agent.lastRun}</span>
                  )}
                </div>

                {!ops && agent.isEnabled && (
                  <button
                    onClick={() => handleRunMarketing(agent)}
                    disabled={isRunning}
                    className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-white disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                    {isRunning ? (
                      <><Clock size={10} className="animate-spin" /> Running…</>
                    ) : (
                      <><Play size={10} /> Run</>
                    )}
                  </button>
                )}
                {ops && (
                  <span className="text-[10px] text-gray-400 font-medium">Auto-triggered</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Runs */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={14} className="text-pink-500" />
          <h3 className="font-bold text-gray-800 text-sm">Recent Agent Runs</h3>
        </div>
        <div className="space-y-2">
          {agentRuns.slice(0, 6).map(run => (
            <div key={run.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                run.status === 'success' ? 'bg-green-500' : run.status === 'escalated' ? 'bg-amber-400' : 'bg-red-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{run.agentName}</p>
                <p className="text-[10px] text-gray-500 truncate">{run.outputSummary}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-gray-400">{run.durationMs}ms</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  run.status === 'success' ? 'bg-green-100 text-green-700' :
                  run.status === 'escalated' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>{run.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
