'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Zap, ChevronRight } from 'lucide-react';

interface CommandResult {
  type: 'table' | 'stats' | 'text' | 'alert' | 'list';
  data: unknown;
}

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  result?: CommandResult;
  time: string;
}

const now = () => new Date().toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' });

const QUICK_COMMANDS = [
  'Daily ops summary',
  'Pending pickups',
  'Available drivers',
  'Facility capacity',
  'Revenue today',
  'Membership summary',
  'Pending approvals',
  'Escalated conversations',
];

function resolveCommand(input: string): Message {
  const q = input.toLowerCase().trim();
  const id = Math.random().toString(36).slice(2);
  const time = now();

  if (q.includes('summary') || q.includes('ops') || q.includes('daily')) {
    return {
      id, role: 'system', time,
      content: 'Here is your operations snapshot for Monday, Jun 23, 2026:',
      result: {
        type: 'stats',
        data: [
          { label: 'Active Orders', value: '128', sub: '34 pending pickup', color: 'pink' },
          { label: 'Drivers On Shift', value: '18', sub: '3 available now', color: 'blue' },
          { label: "Revenue Today", value: 'AED 12,450', sub: '+8% vs yesterday', color: 'green' },
          { label: 'Urgent Items', value: '3', sub: 'Require immediate action', color: 'red' },
        ],
      },
    };
  }

  if (q.includes('pending pickup') || q.includes('pickup')) {
    return {
      id, role: 'system', time,
      content: '34 orders are currently awaiting pickup. Here are the oldest:',
      result: {
        type: 'table',
        data: [
          { id: 'LK-AE-1027', customer: 'Hassan Al Blooshi', area: 'Dubai Marina', overdue: '45 min late' },
          { id: 'LK-AE-1028', customer: 'Priya Kumar', area: 'JVC', overdue: 'On time' },
          { id: 'LK-AE-1029', customer: 'Marriott Downtown', area: 'DIFC', overdue: '12 min late' },
          { id: 'LK-AE-1030', customer: 'Nadia Farhat', area: 'Jumeirah', overdue: 'On time' },
        ],
      },
    };
  }

  if (q.includes('available driver') || q.includes('driver')) {
    return {
      id, role: 'system', time,
      content: '3 drivers are currently available for dispatch:',
      result: {
        type: 'list',
        data: [
          { name: 'Mohammed Rashid', location: 'Al Nahda, Sharjah', vehicle: 'Toyota Hiace', rating: '4.6' },
          { name: 'Khalid Hassan', location: 'Al Reem Island, Abu Dhabi', vehicle: 'Ford Transit', rating: '4.9' },
          { name: 'Rania Malik', location: 'Al Barsha, Dubai', vehicle: 'Nissan Urvan', rating: '4.8' },
        ],
      },
    };
  }

  if (q.includes('capacity') || q.includes('facilit')) {
    return {
      id, role: 'system', time,
      content: 'Current facility utilization across all sites:',
      result: {
        type: 'list',
        data: [
          { name: 'Dubai Marina Hub', pct: 87, status: 'High Load', color: 'amber' },
          { name: 'Abu Dhabi Central', pct: 62, status: 'Normal', color: 'green' },
          { name: 'Jebel Ali Commercial', pct: 94, status: 'Near Capacity', color: 'red' },
          { name: 'JVC Processing', pct: 51, status: 'Normal', color: 'green' },
          { name: 'Al Barsha Satellite', pct: 45, status: 'Low Load', color: 'blue' },
        ],
      },
    };
  }

  if (q.includes('revenue') || q.includes('earnings')) {
    return {
      id, role: 'system', time,
      content: "Today's revenue breakdown as of 9:12 AM:",
      result: {
        type: 'stats',
        data: [
          { label: 'Total Revenue', value: 'AED 12,450', sub: '128 orders', color: 'pink' },
          { label: 'B2C Orders', value: 'AED 9,650', sub: '110 orders', color: 'purple' },
          { label: 'B2B Contracts', value: 'AED 2,800', sub: '18 accounts', color: 'blue' },
          { label: 'vs Yesterday', value: '+8%', sub: 'AED 11,520 baseline', color: 'green' },
        ],
      },
    };
  }

  if (q.includes('membership') || q.includes('subscriber')) {
    return {
      id, role: 'system', time,
      content: 'Membership platform summary for June 2026:',
      result: {
        type: 'stats',
        data: [
          { label: 'Active Members', value: '1,258', sub: '+86 this month', color: 'pink' },
          { label: 'MRR', value: 'AED 185,600', sub: '+11% MoM', color: 'green' },
          { label: 'Churn Rate', value: '2.1%', sub: 'Industry avg: 4.5%', color: 'blue' },
          { label: 'Avg Plan Value', value: 'AED 147', sub: 'Per subscriber/month', color: 'purple' },
        ],
      },
    };
  }

  if (q.includes('approval') || q.includes('pending')) {
    return {
      id, role: 'system', time,
      content: '7 items are awaiting your approval:',
      result: {
        type: 'list',
        data: [
          { name: 'Sharjah Corporate Towers — Contract Renewal', tag: 'Contract', urgent: false },
          { name: 'Nadia Farhat — Refund AED 85 (LK-AE-1015)', tag: 'Refund', urgent: true },
          { name: 'David Chen — Refund AED 30 (LK-AE-1021)', tag: 'Refund', urgent: false },
          { name: 'Marriott Downtown — Rush SLA Request', tag: 'Exception', urgent: true },
          { name: '4 new driver applications pending review', tag: 'HR', urgent: false },
        ],
      },
    };
  }

  if (q.includes('escalat') || q.includes('complaint')) {
    return {
      id, role: 'system', time,
      content: '2 conversations are currently escalated and require human attention:',
      result: {
        type: 'list',
        data: [
          { name: 'Omar Farhan', location: 'Order LK-AE-1020 · Delivery delay complaint', tag: 'Escalated', urgent: true },
          { name: 'Nadia Farhat', location: 'LK-AE-1015 · Missed pickup window', tag: 'Escalated', urgent: false },
        ],
      },
    };
  }

  if (q.includes('assign')) {
    return {
      id, role: 'system', time,
      content: 'Assignment executed. Ahmed Khan has been dispatched to order LK-AE-1027. ETA: 18 minutes. Customer notified via WhatsApp.',
      result: { type: 'text', data: null },
    };
  }

  return {
    id, role: 'system', time,
    content: `I can help with: ops summary, pending pickups, driver status, facility capacity, revenue, membership stats, approvals, or escalated conversations. Try one of those.`,
    result: { type: 'text', data: null },
  };
}

export default function AICommandPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      time: now(),
      content: 'Ready. Ask me about operations, drivers, orders, revenue, memberships, or approvals. You can also trigger actions like assigning a driver.',
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = (text?: string) => {
    const q = text || input;
    if (!q.trim()) return;
    const userMsg: Message = { id: Math.random().toString(36).slice(2), role: 'user', content: q, time: now() };
    const sysMsg = resolveCommand(q);
    setMessages(prev => [...prev, userMsg, sysMsg]);
    setInput('');
  };

  const ResultCard = ({ result }: { result: CommandResult }) => {
    if (!result || result.type === 'text') return null;

    if (result.type === 'stats') {
      const items = result.data as { label: string; value: string; sub: string; color: string }[];
      const colorMap: Record<string, string> = {
        pink: 'bg-pink-50 text-pink-600',
        green: 'bg-green-50 text-green-600',
        blue: 'bg-blue-50 text-blue-600',
        red: 'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-600',
      };
      return (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {items.map((s) => (
            <div key={s.label} className={`${colorMap[s.color] || 'bg-gray-50 text-gray-600'} rounded-xl p-3`}>
              <p className="font-bold text-base">{s.value}</p>
              <p className="text-xs font-semibold mt-0.5">{s.label}</p>
              <p className="text-[10px] opacity-70 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      );
    }

    if (result.type === 'table') {
      const rows = result.data as { id: string; customer: string; area: string; overdue: string }[];
      return (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left pb-1.5 pr-4">Order</th>
                <th className="text-left pb-1.5 pr-4">Customer</th>
                <th className="text-left pb-1.5 pr-4">Area</th>
                <th className="text-left pb-1.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="py-1.5 pr-4 font-bold text-pink-600">{r.id}</td>
                  <td className="py-1.5 pr-4 text-gray-700">{r.customer}</td>
                  <td className="py-1.5 pr-4 text-gray-500">{r.area}</td>
                  <td className="py-1.5">
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${r.overdue !== 'On time' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {r.overdue}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (result.type === 'list') {
      const items = result.data as { name: string; location?: string; vehicle?: string; rating?: string; pct?: number; status?: string; color?: string; tag?: string; urgent?: boolean }[];
      return (
        <div className="mt-2 space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                {(item.location || item.vehicle) && (
                  <p className="text-[10px] text-gray-500">{item.location}{item.vehicle ? ` · ${item.vehicle}` : ''}{item.rating ? ` · ★${item.rating}` : ''}</p>
                )}
              </div>
              {item.pct !== undefined && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.pct > 90 ? '#ef4444' : item.pct > 75 ? '#f59e0b' : '#22c55e' }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{item.pct}%</span>
                </div>
              )}
              {item.tag && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${item.urgent ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                  {item.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex flex-col" style={{ maxHeight: '100vh' }}>
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Command Center</h1>
            <p className="text-gray-500 text-sm">Natural language interface to LaundryKhalas operations</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {QUICK_COMMANDS.map(cmd => (
          <button key={cmd} onClick={() => submit(cmd)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:border-pink-300 hover:text-pink-600 transition-colors">
            <Zap size={11} /> {cmd}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100vh - 320px)' }}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'system' && (
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-start mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                  <Bot size={14} />
                </div>
              )}
              <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'flex-1'}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'text-white rounded-tr-sm'
                    : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm'
                }`} style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #c2185b, #e91e8c)' } : {}}>
                  <p className="leading-relaxed">{msg.content}</p>
                  {msg.result && <ResultCard result={msg.result} />}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Ask about orders, drivers, revenue, memberships..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-50"
            />
            <button onClick={() => submit()}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
              style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 px-1 flex items-center gap-1">
            <ChevronRight size={10} /> Try: "assign Ahmed to LK-AE-1027" · "show pending pickups" · "revenue today"
          </p>
        </div>
      </div>
    </div>
  );
}
