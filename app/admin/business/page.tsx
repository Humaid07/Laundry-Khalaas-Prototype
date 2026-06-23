'use client';

import { Phone, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { BUSINESS_CLIENTS } from '@/lib/mock-data';

export default function AdminBusinessPage() {
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Business Clients</h1>
        <p className="text-gray-500 text-sm">{BUSINESS_CLIENTS.length} active B2B accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Active Contracts', value: '5', color: 'text-green-600 bg-green-50' },
          { label: 'Weekly Volume', value: '3,380 kg', color: 'text-pink-600 bg-pink-50' },
          { label: 'Outstanding', value: 'AED 12,660', color: 'text-amber-600 bg-amber-50' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 text-center">
            <p className={`text-sm font-bold ${color.split(' ')[0]}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {BUSINESS_CLIENTS.map(client => (
          <div key={client.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 card-hover">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
                {client.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="font-bold text-gray-800 text-sm">{client.name}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    client.contractStatus === 'active' ? 'bg-green-100 text-green-700' :
                    client.contractStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>{client.contractStatus}</span>
                </div>
                <p className="text-gray-500 text-xs">{client.type} · {client.emirate}</p>
              </div>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                client.accountHealth === 'excellent' ? 'bg-green-500' :
                client.accountHealth === 'good' ? 'bg-amber-500' : 'bg-red-500'
              }`} title={client.accountHealth} />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { icon: TrendingUp, label: 'Weekly Volume', value: client.weeklyVolume },
                { icon: Calendar, label: 'Last Pickup', value: client.lastPickup },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-2.5 flex items-start gap-2">
                  <Icon size={13} className="text-pink-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500">{label}</p>
                    <p className="text-xs font-bold text-gray-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Outstanding invoice */}
            {client.outstandingInvoice > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3">
                <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />
                <span className="text-xs text-amber-700 font-semibold">Outstanding: AED {client.outstandingInvoice.toLocaleString()}</span>
              </div>
            )}
            {client.outstandingInvoice === 0 && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2 mb-3">
                <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                <span className="text-xs text-green-700 font-semibold">Account settled</span>
              </div>
            )}

            <div className="flex gap-2">
              <button className="flex-1 text-xs font-bold bg-pink-50 text-pink-600 py-2 rounded-xl">View Account</button>
              <button className="flex-1 text-xs font-semibold bg-gray-100 text-gray-600 py-2 rounded-xl flex items-center justify-center gap-1">
                <Phone size={11} /> Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
