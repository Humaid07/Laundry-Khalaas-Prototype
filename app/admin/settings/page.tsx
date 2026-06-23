'use client';

import { useState } from 'react';
import { Globe, Clock, MessageCircle, Bell, Users, Shield } from 'lucide-react';

const UAE_EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'];

const PICKUP_SLOTS = [
  '8:00 AM – 10:00 AM', '10:00 AM – 12:00 PM', '12:00 PM – 2:00 PM',
  '2:00 PM – 4:00 PM', '4:00 PM – 6:00 PM', '6:00 PM – 8:00 PM',
];

const ADMIN_USERS = [
  { name: 'Mohammed Hassan', role: 'Super Admin', email: 'mh@laundrykhalas.ae' },
  { name: 'Sara Al Blooshi', role: 'Operations', email: 'sb@laundrykhalas.ae' },
  { name: 'Tariq Farhan', role: 'Driver Manager', email: 'tf@laundrykhalas.ae' },
];

export default function AdminSettingsPage() {
  const [agentEnabled, setAgentEnabled] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [activeEmirates, setActiveEmirates] = useState(UAE_EMIRATES);

  const toggleEmirate = (e: string) => {
    setActiveEmirates(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} className="flex-shrink-0">
      {value
        ? <div className="w-12 h-6 rounded-full flex items-center px-1" style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
            <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
          </div>
        : <div className="w-12 h-6 bg-gray-200 rounded-full flex items-center px-1">
            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
      }
    </button>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Platform configuration · UAE Operations</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
            <Globe size={15} className="text-pink-500" /> Service Coverage
          </h3>
          <p className="text-xs text-gray-500 mb-3">Active emirates for pickup and delivery operations.</p>
          <div className="flex flex-wrap gap-2">
            {UAE_EMIRATES.map(e => (
              <button key={e} onClick={() => toggleEmirate(e)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  activeEmirates.includes(e)
                    ? 'border-pink-300 text-white'
                    : 'border-gray-200 text-gray-500 bg-white hover:border-pink-200'
                }`}
                style={activeEmirates.includes(e) ? { background: 'linear-gradient(135deg, #c2185b, #e91e8c)' } : {}}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
            <Clock size={15} className="text-pink-500" /> Pickup Windows
          </h3>
          <p className="text-xs text-gray-500 mb-3">Available slots shown to customers during booking.</p>
          <div className="grid grid-cols-2 gap-2">
            {PICKUP_SLOTS.map(slot => (
              <div key={slot} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                <span className="text-xs text-gray-700 font-medium">{slot}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <MessageCircle size={15} className="text-pink-500" /> WhatsApp Agent
          </h3>
          <div className="space-y-3">
            {[
              { label: 'AI Agent', sub: 'Automatically handle incoming WhatsApp booking requests', value: agentEnabled, set: () => setAgentEnabled(v => !v) },
              { label: 'Auto-assign Driver', sub: 'Assign nearest available driver on order confirmation', value: autoAssign, set: () => setAutoAssign(v => !v) },
              { label: 'Auto-escalate Complaints', sub: 'Route negative-sentiment threads to human agents', value: autoEscalate, set: () => setAutoEscalate(v => !v) },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
                <Toggle value={item.value} onChange={item.set} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Bell size={15} className="text-pink-500" /> Notifications
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">SMS Status Alerts</p>
              <p className="text-xs text-gray-500">Send order updates to customers at each status change</p>
            </div>
            <Toggle value={smsEnabled} onChange={() => setSmsEnabled(v => !v)} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Shield size={15} className="text-pink-500" /> Security
          </h3>
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-gray-800">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500">Required for all admin accounts</p>
            </div>
            <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Enforced</span>
          </div>
          <div className="flex items-center justify-between py-1 mt-2 border-t border-gray-50 pt-2.5">
            <div>
              <p className="text-sm font-semibold text-gray-800">Session Timeout</p>
              <p className="text-xs text-gray-500">Auto sign-out after inactivity</p>
            </div>
            <span className="text-xs font-semibold text-gray-600">8 hours</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Users size={15} className="text-pink-500" /> Team Access
            </h3>
            <button className="text-xs text-pink-600 font-semibold bg-pink-50 px-2.5 py-1 rounded-lg">+ Invite</button>
          </div>
          <div className="space-y-3">
            {ADMIN_USERS.map(u => (
              <div key={u.email} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                  {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <span className="text-[10px] font-bold bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full flex-shrink-0">{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
