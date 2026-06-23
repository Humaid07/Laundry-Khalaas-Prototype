'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgent } from '@/lib/agent-context';
import { MarketingDraft, MarketingTask } from '@/lib/agents/types';
import {
  Megaphone, CheckCircle, XCircle, Clock, Sparkles,
  FileText, Loader2, BarChart2, CalendarDays, ChevronRight,
} from 'lucide-react';

const DRAFT_TYPE_LABELS: Record<string, string> = {
  social_post: 'Social Post',
  blog_brief: 'Blog Brief',
  seo_brief: 'SEO Brief',
  ad_copy: 'Ad Copy',
  content_calendar: 'Content Calendar',
  campaign_brief: 'Campaign Brief',
  analytics_report: 'Analytics Report',
  lead_note: 'Lead Note',
  brand_review: 'Brand Review',
};

const STATUS_CONFIG = {
  pending: { badge: 'bg-gray-100 text-gray-600', label: 'Pending', dot: 'bg-gray-400' },
  draft: { badge: 'bg-blue-100 text-blue-700', label: 'Draft', dot: 'bg-blue-500' },
  review: { badge: 'bg-amber-100 text-amber-700', label: 'Review', dot: 'bg-amber-500' },
  approved: { badge: 'bg-green-100 text-green-700', label: 'Approved', dot: 'bg-green-500' },
  rejected: { badge: 'bg-red-100 text-red-700', label: 'Rejected', dot: 'bg-red-500' },
};

const AGENT_OPTIONS = [
  { id: 'content-planning-agent', label: 'Content Planning', icon: CalendarDays, color: 'bg-purple-100 text-purple-600' },
  { id: 'social-content-agent', label: 'Social Media', icon: Megaphone, color: 'bg-pink-100 text-pink-600' },
  { id: 'seo-agent', label: 'SEO & Blog', icon: FileText, color: 'bg-blue-100 text-blue-600' },
  { id: 'ads-agent', label: 'Paid Ads', icon: BarChart2, color: 'bg-orange-100 text-orange-600' },
  { id: 'lead-gen-agent', label: 'Lead Generation', icon: Sparkles, color: 'bg-teal-100 text-teal-600' },
  { id: 'marketing-analytics-agent', label: 'Analytics', icon: BarChart2, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'brand-review-agent', label: 'Brand Review', icon: CheckCircle, color: 'bg-rose-100 text-rose-600' },
];

const TABS = ['Overview', 'Tasks', 'Drafts'] as const;
type TabType = typeof TABS[number];

export default function MarketingHubPage() {
  const router = useRouter();
  const { marketingTasks, marketingDrafts, agentRegistry, runMarketingAgent, approveDraft, rejectDraft } = useAgent();
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [selectedDraft, setSelectedDraft] = useState<MarketingDraft | null>(null);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [brief, setBrief] = useState('');
  const [platform, setPlatform] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [toast, setToast] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const reviewCount = marketingDrafts.filter(d => d.status === 'review').length;
  const approvedCount = marketingDrafts.filter(d => d.status === 'approved').length;
  const totalRuns = agentRegistry.filter(a => a.category === 'marketing').reduce((s, a) => s + a.runsToday, 0);

  const handleRunAgent = async () => {
    if (!selectedAgentId || !brief.trim()) return;
    setRunningAgent(selectedAgentId);
    await new Promise(r => setTimeout(r, 1000));
    runMarketingAgent(selectedAgentId, brief, platform || undefined);
    setRunningAgent(null);
    setBrief('');
    setPlatform('');
    setSelectedAgentId('');
    const agent = AGENT_OPTIONS.find(a => a.id === selectedAgentId);
    showToast(`${agent?.label ?? 'Agent'} completed — new draft ready for review`);
    setActiveTab('Drafts');
  };

  const handleApprove = (draftId: string) => {
    approveDraft(draftId, 'Sara Al Blooshi');
    setSelectedDraft(null);
    showToast('Draft approved');
  };

  const handleReject = (draftId: string) => {
    rejectDraft(draftId, rejectNotes || 'Does not meet brand standards');
    setRejectingId(null);
    setRejectNotes('');
    setSelectedDraft(null);
    showToast('Draft rejected — returned to agent queue');
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
          <h1 className="text-2xl font-bold text-gray-900">Marketing Hub</h1>
          <p className="text-gray-500 text-sm">{reviewCount} pending review · {approvedCount} approved · {totalRuns} runs today</p>
        </div>
        <button onClick={() => router.push('/admin/marketing/calendar')}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-pink-200">
          <CalendarDays size={13} /> Content Calendar <ChevronRight size={12} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-1 w-fit">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
              activeTab === tab ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={activeTab === tab ? { background: 'linear-gradient(135deg, #c2185b, #e91e8c)' } : {}}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'Overview' && (
        <div className="space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Pending Review', value: reviewCount, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Approved', value: approvedCount, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Total Drafts', value: marketingDrafts.length, color: 'text-gray-900', bg: 'bg-gray-50' },
              { label: 'Agent Runs Today', value: totalRuns, color: 'text-pink-600', bg: 'bg-pink-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl border border-gray-100 p-4`}>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Run Agent */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-pink-500" /> Run Marketing Agent
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {AGENT_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button key={opt.id} onClick={() => setSelectedAgentId(opt.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-bold ${
                      selectedAgentId === opt.id
                        ? 'border-pink-400 bg-pink-50 text-pink-700'
                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-pink-200'
                    }`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${opt.color}`}>
                      <Icon size={15} />
                    </div>
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 mb-3">
              <textarea value={brief} onChange={e => setBrief(e.target.value)}
                placeholder="Enter brief or topic…"
                rows={2}
                className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-pink-300 resize-none" />
              <input value={platform} onChange={e => setPlatform(e.target.value)}
                placeholder="Platform (optional)"
                className="w-32 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-pink-300" />
            </div>

            <button
              onClick={handleRunAgent}
              disabled={!selectedAgentId || !brief.trim() || !!runningAgent}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
              {runningAgent ? (
                <><Loader2 size={14} className="animate-spin" /> Running…</>
              ) : (
                <><Sparkles size={14} /> Run Agent</>
              )}
            </button>
          </div>

          {/* Agent status grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {agentRegistry.filter(a => a.category === 'marketing').map(agent => (
              <div key={agent.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-gray-800 leading-snug">{agent.name.replace(' Agent', '')}</p>
                  <div className={`w-2 h-2 rounded-full ${
                    agent.isEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </div>
                <p className="text-lg font-bold text-gray-900">{agent.runsToday}</p>
                <p className="text-[10px] text-gray-400">runs today</p>
                <p className="text-[10px] text-green-600 font-semibold">{agent.successRate}% success</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TASKS TAB ── */}
      {activeTab === 'Tasks' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Task</th>
                <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Agent</th>
                <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Platform</th>
                <th className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {marketingTasks.map(task => {
                const stCfg = STATUS_CONFIG[task.status];
                const draft = marketingDrafts.find(d => d.id === task.draftId);
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-gray-800">{task.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[200px]">{task.brief}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{task.agentName}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                        {DRAFT_TYPE_LABELS[task.taskType] ?? task.taskType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{task.platform ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stCfg.badge}`}>{stCfg.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {draft && (
                        <button onClick={() => setSelectedDraft(draft)}
                          className="text-[10px] font-bold text-pink-600 hover:underline whitespace-nowrap">
                          View Draft
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── DRAFTS TAB ── */}
      {activeTab === 'Drafts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {marketingDrafts.map(draft => {
            const stCfg = STATUS_CONFIG[draft.status];
            const scoreColor = draft.brandSafetyScore >= 85 ? 'text-green-600' : draft.brandSafetyScore >= 70 ? 'text-amber-600' : 'text-red-600';
            return (
              <div key={draft.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-pink-100 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 leading-snug">{draft.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{draft.agentName}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${stCfg.badge}`}>
                    {stCfg.label}
                  </span>
                </div>

                {draft.platform && (
                  <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{draft.platform}</span>
                )}

                <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">{draft.content}</p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <div className={`text-xs font-bold ${scoreColor}`}>{draft.brandSafetyScore}/100</div>
                    <span className="text-[10px] text-gray-400">brand safety</span>
                  </div>
                  {draft.issues.length > 0 && (
                    <span className="text-[9px] text-amber-600 font-semibold">{draft.issues.length} issue{draft.issues.length !== 1 ? 's' : ''}</span>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <button onClick={() => setSelectedDraft(draft)}
                    className="flex-1 text-xs font-bold py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200">
                    Preview
                  </button>
                  {draft.status === 'review' && (
                    <>
                      <button onClick={() => handleApprove(draft.id)}
                        className="flex-1 text-xs font-bold py-1.5 rounded-xl text-white"
                        style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                        Approve
                      </button>
                      <button onClick={() => setRejectingId(draft.id)}
                        className="px-3 text-xs font-bold py-1.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200">
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Draft Preview Modal */}
      {selectedDraft && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDraft(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{selectedDraft.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_CONFIG[selectedDraft.status].badge}`}>
                    {STATUS_CONFIG[selectedDraft.status].label}
                  </span>
                  <span className={`text-xs font-bold ${
                    selectedDraft.brandSafetyScore >= 85 ? 'text-green-600' : selectedDraft.brandSafetyScore >= 70 ? 'text-amber-600' : 'text-red-600'
                  }`}>{selectedDraft.brandSafetyScore}/100 brand safety</span>
                </div>
              </div>
              <button onClick={() => setSelectedDraft(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {selectedDraft.issues.length > 0 && (
              <div className="px-5 py-3 bg-amber-50 border-b border-amber-100">
                <p className="text-[10px] font-bold text-amber-700 mb-1 uppercase tracking-wide">Issues</p>
                {selectedDraft.issues.map((issue, i) => (
                  <p key={i} className="text-xs text-amber-600">• {issue}</p>
                ))}
              </div>
            )}

            {selectedDraft.reviewNotes && (
              <div className="px-5 py-3 bg-red-50 border-b border-red-100">
                <p className="text-[10px] font-bold text-red-700 mb-1 uppercase tracking-wide">Review Notes</p>
                <p className="text-xs text-red-600">{selectedDraft.reviewNotes}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{selectedDraft.content}</pre>
            </div>

            {selectedDraft.status === 'review' && (
              <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
                <button onClick={() => handleApprove(selectedDraft.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold py-2.5 rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}>
                  <CheckCircle size={14} /> Approve
                </button>
                <button onClick={() => { setRejectingId(selectedDraft.id); setSelectedDraft(null); }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100">
                  <XCircle size={14} /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Notes Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setRejectingId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-3">Reject Draft</h3>
            <textarea value={rejectNotes} onChange={e => setRejectNotes(e.target.value)}
              placeholder="Explain why this draft was rejected (optional)…"
              rows={3}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none resize-none mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setRejectingId(null)} className="flex-1 text-sm font-bold py-2 rounded-xl bg-gray-100 text-gray-700">Cancel</button>
              <button onClick={() => handleReject(rejectingId)} className="flex-1 text-sm font-bold py-2 rounded-xl bg-red-500 text-white">Reject Draft</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
