import type { Conversation, AgentResult } from '../types';
import type { Driver } from '@/lib/mock-data';
import { checkDriverAvailability } from '../tools/driver-tools';
import { checkFacilityAvailability } from '../tools/facility-tools';

const AGENT_NAME = 'Operations Orchestrator';

export function runOrchestrationAgent(
  conversation: Conversation,
  drivers: Driver[]
): AgentResult {
  const toolCalls = [];
  const emirate = conversation.orderDraft.emirate ?? 'Dubai';

  const { driver, toolCall: driverTool } = checkDriverAvailability(emirate, drivers);
  toolCalls.push(driverTool);

  const { facility, toolCall: facilityTool } = checkFacilityAvailability(emirate);
  toolCalls.push(facilityTool);

  if (driver && facility) {
    return {
      agentName: AGENT_NAME,
      response:
        `Dispatch confirmed. *${driver.name}* assigned to order ${conversation.activeOrderId ?? '—'}.\n` +
        `Facility: ${facility.name} (${facility.capacityPct}% capacity).\n` +
        `Driver is currently at ${driver.location}. ETA to pickup: ~15–25 min.`,
      toolsUsed: toolCalls.map(t => t.name),
      toolCalls,
      conversationUpdates: { lastAgentAction: 'driver_and_facility_assigned' },
      runStatus: 'success',
    };
  }

  if (driver && !facility) {
    return {
      agentName: AGENT_NAME,
      response:
        `Driver *${driver.name}* assigned. Facility routing pending — all ${emirate} hubs near capacity. ` +
        `Order will be routed to next available facility automatically.`,
      toolsUsed: toolCalls.map(t => t.name),
      toolCalls,
      conversationUpdates: { lastAgentAction: 'driver_assigned_facility_pending' },
      runStatus: 'success',
    };
  }

  return {
    agentName: AGENT_NAME,
    response:
      `No available drivers in ${emirate} at this time. Operations team notified. ` +
      `Customer will receive an updated pickup confirmation shortly.`,
    toolsUsed: toolCalls.map(t => t.name),
    toolCalls,
    conversationUpdates: { lastAgentAction: 'no_driver_available' },
    runStatus: 'escalated',
  };
}
