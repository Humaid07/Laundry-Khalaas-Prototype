import type { Driver } from '@/lib/mock-data';
import type { ToolCall } from '../types';

export function checkDriverAvailability(
  emirate: string,
  drivers: Driver[]
): { driver: Driver | null; toolCall: ToolCall } {
  const start = Date.now();
  const available = drivers
    .filter(d => d.status === 'available' && d.emirate.toLowerCase() === emirate.toLowerCase())
    .sort((a, b) => b.rating - a.rating);

  const chosen = available[0] ?? drivers.find(d => d.status === 'available') ?? null;

  return {
    driver: chosen,
    toolCall: {
      name: 'check_driver_availability',
      input: { emirate },
      output: chosen
        ? { driverId: chosen.id, name: chosen.name, location: chosen.location, rating: chosen.rating, status: chosen.status }
        : { available: false, message: 'No available drivers at this time' },
      durationMs: Date.now() - start + 16,
    },
  };
}

export function assignDriverTool(
  driverId: string,
  orderId: string,
  drivers: Driver[]
): { driver: Driver | null; toolCall: ToolCall } {
  const start = Date.now();
  const driver = drivers.find(d => d.id === driverId) ?? null;

  return {
    driver,
    toolCall: {
      name: 'assign_driver',
      input: { driverId, orderId },
      output: driver
        ? { assigned: true, driverName: driver.name, phone: driver.phone, vehicle: driver.vehicle, orderId }
        : { assigned: false, message: 'Driver not found' },
      durationMs: Date.now() - start + 12,
    },
  };
}
