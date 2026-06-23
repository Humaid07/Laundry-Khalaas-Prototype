import type { Conversation, AgentResult } from '../types';
import { getMissingOrderFields, getNextFieldQuestion, buildOrderConfirmation, createOrderDraftTool, estimateOrderAmount } from '../tools/order-tools';
import { checkFacilityAvailability } from '../tools/facility-tools';
import { buildAgentMessage } from '../tools/message-tools';

const AGENT_NAME = 'Customer Order Agent';

const GREETINGS = [
  'Hi there! Welcome to LaundryKhalas 👋 I can help you with a laundry pickup today. Which service do you need?\n\n• Wash & Fold (AED 8/kg)\n• Dry Cleaning (AED 15/item)\n• Ironing & Pressing (AED 7/item)\n• Blankets & Duvets (AED 45/item)\n• Curtains & Upholstery (AED 30/panel)\n• Business / Hotel Laundry (custom pricing)',
  "Hello! You've reached LaundryKhalas. I'm here to arrange your laundry pickup. What service do you need today?",
];

function extractServiceType(text: string): string | null {
  const lc = text.toLowerCase();
  if (lc.includes('wash') || lc.includes('fold')) return 'Wash & Fold';
  if (lc.includes('dry clean')) return 'Dry Cleaning';
  if (lc.includes('iron')) return 'Ironing & Pressing';
  if (lc.includes('duvet') || lc.includes('blanket') || lc.includes('comforter')) return 'Blankets & Duvets';
  if (lc.includes('curtain') || lc.includes('upholstery') || lc.includes('sofa')) return 'Curtains & Upholstery';
  if (lc.includes('hotel') || lc.includes('b2b') || lc.includes('business') || lc.includes('bulk')) return 'Business Laundry';
  return null;
}

function extractEmirate(text: string): string | null {
  const lc = text.toLowerCase();
  if (lc.includes('abu dhabi') || lc.includes('mussafah') || lc.includes('reem island')) return 'Abu Dhabi';
  if (lc.includes('sharjah') || lc.includes('al nahda')) return 'Sharjah';
  if (lc.includes('ajman')) return 'Ajman';
  if (lc.includes('rak') || lc.includes('ras al khaimah')) return 'Ras Al Khaimah';
  if (lc.includes('dubai') || lc.includes('marina') || lc.includes('jvc') || lc.includes('deira') ||
      lc.includes('business bay') || lc.includes('downtown') || lc.includes('jumeirah') ||
      lc.includes('barsha') || lc.includes('difc') || lc.includes('bur dubai')) return 'Dubai';
  return null;
}

function extractItems(text: string): string | null {
  const numbers = text.match(/\d+\s+\w+/g);
  if (numbers && numbers.length > 0) return numbers.join(', ');
  if (text.toLowerCase().includes('shirt') || text.toLowerCase().includes('suit') ||
      text.toLowerCase().includes('trousers') || text.toLowerCase().includes('kandura')) {
    return text.trim();
  }
  return null;
}

function extractPickupSlot(text: string): string | null {
  const lc = text.toLowerCase();
  if (lc.includes('morning') || lc.includes('10') || lc.includes('11')) return 'Today, 10:00 AM – 12:00 PM';
  if (lc.includes('noon') || lc.includes('12') || lc.includes('lunch')) return 'Today, 12:00 PM – 2:00 PM';
  if (lc.includes('afternoon') || lc.includes('2') || lc.includes('3') || lc.includes('4')) return 'Today, 2:00 PM – 4:00 PM';
  if (lc.includes('evening') || lc.includes('5') || lc.includes('6') || lc.includes('7')) return 'Today, 6:00 PM – 8:00 PM';
  if (lc.includes('tomorrow')) return 'Tomorrow, 10:00 AM – 12:00 PM';
  if (lc.includes('now') || lc.includes('asap') || lc.includes('soon')) return 'Today, ASAP — Next available slot';
  return null;
}

export function runCustomerOrderAgent(
  message: string,
  conversation: Conversation
): AgentResult {
  const toolCalls = [];
  const draft = { ...conversation.orderDraft };
  const isFirstMessage = conversation.messages.filter(m => m.role === 'customer').length <= 1;

  // Extract info from current message
  const detectedService = extractServiceType(message);
  if (detectedService && !draft.serviceType) draft.serviceType = detectedService;

  const detectedEmirate = extractEmirate(message);
  if (detectedEmirate && !draft.emirate) draft.emirate = detectedEmirate;

  const detectedItems = extractItems(message);
  if (detectedItems && !draft.items) draft.items = detectedItems;

  const detectedSlot = extractPickupSlot(message);
  if (detectedSlot && !draft.pickupSlot) draft.pickupSlot = detectedSlot;

  if (!draft.address && message.length > 15 && !detectedService && !detectedSlot &&
      (message.includes(',') || message.includes('apt') || message.includes('villa') ||
       message.includes('floor') || message.includes('building') || message.includes('street') ||
       detectedEmirate)) {
    draft.address = message.trim();
  }

  // Check what we still need
  const missing = getMissingOrderFields(draft);

  // If all fields collected → confirm order
  if (missing.length === 0 && draft.serviceType && draft.address && draft.pickupSlot) {
    const { orderId, toolCall: createTool } = createOrderDraftTool(draft);
    toolCalls.push(createTool);

    const { toolCall: facilityTool } = checkFacilityAvailability(draft.emirate ?? 'Dubai');
    toolCalls.push(facilityTool);

    draft.estimatedAmount = estimateOrderAmount(draft.serviceType, draft.items);

    return {
      agentName: AGENT_NAME,
      response: buildOrderConfirmation(draft, orderId),
      toolsUsed: toolCalls.map(t => t.name),
      toolCalls,
      conversationUpdates: {
        orderDraft: { ...draft, estimatedAmount: draft.estimatedAmount },
        missingFields: [],
        activeOrderId: orderId,
        status: 'resolved',
        lastAgentAction: 'order_confirmed',
        summary: `Order ${orderId} confirmed for ${draft.serviceType} — ${draft.address}`,
      },
      runStatus: 'success',
    };
  }

  // First message — greet + ask service
  if (isFirstMessage && !draft.serviceType) {
    return {
      agentName: AGENT_NAME,
      response: GREETINGS[0],
      toolsUsed: [],
      toolCalls: [],
      conversationUpdates: { orderDraft: draft, missingFields: missing, lastAgentAction: 'greeted' },
      runStatus: 'success',
    };
  }

  // Ask next missing field
  const nextField = missing[0];
  const response = nextField ? getNextFieldQuestion(nextField, draft) : GREETINGS[0];

  return {
    agentName: AGENT_NAME,
    response,
    toolsUsed: [],
    toolCalls: [],
    conversationUpdates: { orderDraft: draft, missingFields: missing, lastAgentAction: `asked_${nextField ?? 'question'}` },
    runStatus: 'success',
  };
}
