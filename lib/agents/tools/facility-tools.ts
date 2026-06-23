import type { ToolCall } from '../types';

interface FacilitySnapshot {
  id: string;
  name: string;
  location: string;
  emirate: string;
  capacityPct: number;
  status: 'operational' | 'near_capacity' | 'offline';
}

const FACILITY_SNAPSHOTS: FacilitySnapshot[] = [
  { id: 'f1', name: 'Dubai Marina Hub', location: 'Al Sufouh, Dubai', emirate: 'Dubai', capacityPct: 87, status: 'operational' },
  { id: 'f2', name: 'Abu Dhabi Central', location: 'Mussafah, Abu Dhabi', emirate: 'Abu Dhabi', capacityPct: 62, status: 'operational' },
  { id: 'f3', name: 'Jebel Ali Commercial', location: 'Jebel Ali FZ, Dubai', emirate: 'Dubai', capacityPct: 94, status: 'near_capacity' },
  { id: 'f4', name: 'JVC Processing Center', location: 'Jumeirah Village Circle, Dubai', emirate: 'Dubai', capacityPct: 51, status: 'operational' },
  { id: 'f5', name: 'Al Barsha Satellite', location: 'Al Barsha 1, Dubai', emirate: 'Dubai', capacityPct: 45, status: 'operational' },
];

export function checkFacilityAvailability(
  emirate: string
): { facility: FacilitySnapshot | null; toolCall: ToolCall } {
  const start = Date.now();
  const candidates = FACILITY_SNAPSHOTS.filter(
    f => f.emirate.toLowerCase() === emirate.toLowerCase() && f.status !== 'offline'
  ).sort((a, b) => a.capacityPct - b.capacityPct);

  const chosen = candidates.find(f => f.capacityPct < 90) ?? candidates[0] ?? null;

  return {
    facility: chosen,
    toolCall: {
      name: 'check_facility_availability',
      input: { emirate },
      output: chosen
        ? { facilityId: chosen.id, name: chosen.name, capacityPct: chosen.capacityPct, status: chosen.status }
        : { available: false, message: `No available facility found for ${emirate}` },
      durationMs: Date.now() - start + 22,
    },
  };
}

export function assignFacilityTool(
  facilityId: string,
  orderId: string
): { success: boolean; toolCall: ToolCall } {
  const start = Date.now();
  const facility = FACILITY_SNAPSHOTS.find(f => f.id === facilityId);
  return {
    success: Boolean(facility),
    toolCall: {
      name: 'assign_facility',
      input: { facilityId, orderId },
      output: facility
        ? { assigned: true, facilityName: facility.name, orderId }
        : { assigned: false, message: 'Facility not found' },
      durationMs: Date.now() - start + 14,
    },
  };
}
