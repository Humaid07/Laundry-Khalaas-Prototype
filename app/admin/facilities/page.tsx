'use client';

import { Factory, AlertTriangle, CheckCircle, Users, Package, Zap } from 'lucide-react';

const FACILITIES = [
  {
    id: 'f1',
    name: 'Dubai Marina Hub',
    location: 'Al Sufouh, Dubai',
    status: 'operational',
    capacityPct: 87,
    ordersInQueue: 43,
    machinesActive: 12,
    machinesTotal: 14,
    staffOnShift: 8,
    throughputKg: 1240,
    targetKg: 1800,
    type: 'Main Hub',
  },
  {
    id: 'f2',
    name: 'Abu Dhabi Central',
    location: 'Mussafah, Abu Dhabi',
    status: 'operational',
    capacityPct: 62,
    ordersInQueue: 22,
    machinesActive: 8,
    machinesTotal: 12,
    staffOnShift: 5,
    throughputKg: 840,
    targetKg: 1400,
    type: 'Regional Hub',
  },
  {
    id: 'f3',
    name: 'Jebel Ali Commercial',
    location: 'Jebel Ali Free Zone, Dubai',
    status: 'near_capacity',
    capacityPct: 94,
    ordersInQueue: 67,
    machinesActive: 18,
    machinesTotal: 18,
    staffOnShift: 12,
    throughputKg: 2800,
    targetKg: 3000,
    type: 'B2B Facility',
  },
  {
    id: 'f4',
    name: 'JVC Processing Center',
    location: 'Jumeirah Village Circle, Dubai',
    status: 'operational',
    capacityPct: 51,
    ordersInQueue: 15,
    machinesActive: 6,
    machinesTotal: 10,
    staffOnShift: 4,
    throughputKg: 580,
    targetKg: 1100,
    type: 'Satellite',
  },
  {
    id: 'f5',
    name: 'Al Barsha Satellite',
    location: 'Al Barsha 1, Dubai',
    status: 'operational',
    capacityPct: 45,
    ordersInQueue: 11,
    machinesActive: 5,
    machinesTotal: 8,
    staffOnShift: 3,
    throughputKg: 390,
    targetKg: 800,
    type: 'Satellite',
  },
];

const totalOrders = FACILITIES.reduce((s, f) => s + f.ordersInQueue, 0);
const totalKg = FACILITIES.reduce((s, f) => s + f.throughputKg, 0);
const totalStaff = FACILITIES.reduce((s, f) => s + f.staffOnShift, 0);

export default function FacilitiesPage() {
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Facility Operations</h1>
        <p className="text-gray-500 text-sm">{FACILITIES.length} facilities · Live status</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center mb-2">
            <Factory size={17} className="text-pink-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{FACILITIES.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active Facilities</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
            <Package size={17} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          <p className="text-xs text-gray-500 mt-0.5">Orders in Processing</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mb-2">
            <Zap size={17} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalKg.toLocaleString()}<span className="text-sm font-normal text-gray-400 ml-1">kg</span></p>
          <p className="text-xs text-gray-500 mt-0.5">Throughput Today</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-2">
            <Users size={17} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalStaff}</p>
          <p className="text-xs text-gray-500 mt-0.5">Staff on Shift</p>
        </div>
      </div>

      {FACILITIES.find(f => f.status === 'near_capacity') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Capacity Alert — Jebel Ali Commercial</p>
            <p className="text-xs text-amber-700 mt-0.5">Running at 94% capacity with 18/18 machines active. Consider rerouting incoming B2B orders to Dubai Marina Hub.</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {FACILITIES.map(f => (
          <div key={f.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  f.status === 'near_capacity' ? 'bg-amber-100' : 'bg-green-100'
                }`}>
                  <Factory size={18} className={f.status === 'near_capacity' ? 'text-amber-600' : 'text-green-600'} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{f.name}</h3>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{f.type}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{f.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {f.status === 'near_capacity'
                  ? <><AlertTriangle size={12} className="text-amber-500" /><span className="text-xs font-bold text-amber-600">Near Capacity</span></>
                  : <><CheckCircle size={12} className="text-green-500" /><span className="text-xs font-bold text-green-600">Operational</span></>
                }
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500 font-medium">Capacity Utilization</span>
                <span className={`text-xs font-bold ${f.capacityPct >= 90 ? 'text-red-600' : f.capacityPct >= 75 ? 'text-amber-600' : 'text-green-600'}`}>
                  {f.capacityPct}%
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${f.capacityPct}%`,
                    background: f.capacityPct >= 90
                      ? 'linear-gradient(90deg, #ef4444, #f97316)'
                      : f.capacityPct >= 75
                      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      : 'linear-gradient(90deg, #22c55e, #4ade80)',
                  }} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-bold text-gray-900">{f.ordersInQueue}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Orders in Queue</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-bold text-gray-900">{f.machinesActive}<span className="text-gray-400 font-normal">/{f.machinesTotal}</span></p>
                <p className="text-[10px] text-gray-500 mt-0.5">Machines Active</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-bold text-gray-900">{f.staffOnShift}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Staff on Shift</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-bold text-gray-900">{f.throughputKg.toLocaleString()} kg</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Throughput Today</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
