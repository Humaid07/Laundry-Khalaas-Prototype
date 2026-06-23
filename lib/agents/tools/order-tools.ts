import type { Order, OrderStatus } from '@/lib/mock-data';
import type { OrderDraft, ToolCall } from '../types';

const SERVICE_PRICES: Record<string, number> = {
  'wash & fold': 8,
  'dry cleaning': 15,
  'ironing': 7,
  'blankets & duvets': 45,
  'curtains & upholstery': 30,
  'business laundry': 0,
};

export function estimateOrderAmount(serviceType: string, items?: string): number {
  const lc = serviceType.toLowerCase();
  const basePrice = Object.entries(SERVICE_PRICES).find(([k]) => lc.includes(k))?.[1] ?? 35;
  const itemCount = items ? (items.match(/\d+/g)?.reduce((a, b) => a + parseInt(b), 0) ?? 1) : 3;
  return Math.max(basePrice * itemCount, basePrice * 2);
}

export function createOrderDraftTool(draft: OrderDraft): { success: boolean; orderId: string; toolCall: ToolCall } {
  const start = Date.now();
  const orderId = `LK-AE-${1030 + Math.floor(Math.random() * 20)}`;
  const estimated = draft.serviceType
    ? estimateOrderAmount(draft.serviceType, draft.items)
    : 0;

  return {
    success: true,
    orderId,
    toolCall: {
      name: 'create_order_draft',
      input: { ...draft },
      output: {
        orderId,
        estimatedAmount: estimated,
        status: 'draft',
        message: 'Order draft created successfully',
      },
      durationMs: Date.now() - start + 18,
    },
  };
}

export function getOrderStatusTool(
  orderId: string,
  orders: Order[]
): { order: Order | null; toolCall: ToolCall } {
  const start = Date.now();
  const order = orders.find(o => o.id.toLowerCase() === orderId.toLowerCase()) ?? null;

  return {
    order,
    toolCall: {
      name: 'get_order_status',
      input: { orderId },
      output: order
        ? { found: true, status: order.status, driverName: order.driverName, facility: order.facilityAssigned }
        : { found: false, message: `Order ${orderId} not found` },
      durationMs: Date.now() - start + 8,
    },
  };
}

export function getMissingOrderFields(draft: OrderDraft): string[] {
  const required: Array<keyof OrderDraft> = ['serviceType', 'address', 'pickupSlot'];
  return required.filter(f => !draft[f]);
}

export function getNextFieldQuestion(missingField: string, draft: OrderDraft): string {
  const questions: Record<string, string> = {
    serviceType:
      'Which service do you need? We offer *Wash & Fold* (AED 8/kg), *Dry Cleaning* (AED 15/item), *Ironing* (AED 7/item), *Blankets & Duvets* (AED 45/item), and *Curtains & Upholstery* (AED 30/panel).',
    address: `Great! Please share your pickup address${draft.emirate ? ` in ${draft.emirate}` : ''}.`,
    pickupSlot:
      'When would you like us to collect? Available slots today:\n• 10:00 AM – 12:00 PM\n• 12:00 PM – 2:00 PM\n• 2:00 PM – 4:00 PM\n• 4:00 PM – 6:00 PM\n• 6:00 PM – 8:00 PM',
    customerName: 'May I have your full name, please?',
  };
  return questions[missingField] ?? `Could you provide your ${missingField}?`;
}

export function buildOrderConfirmation(draft: OrderDraft, orderId: string): string {
  const amount = draft.estimatedAmount ?? estimateOrderAmount(draft.serviceType ?? '', draft.items);
  return (
    `✅ *Order Confirmed!*\n\n` +
    `Order ID: *${orderId}*\n` +
    `Service: ${draft.serviceType}\n` +
    `${draft.items ? `Items: ${draft.items}\n` : ''}` +
    `Pickup: ${draft.address}\n` +
    `Slot: ${draft.pickupSlot}\n` +
    `Estimated: *AED ${amount}*\n\n` +
    `A driver will be assigned shortly. You will receive a confirmation with the driver's details.\n` +
    `To track your order, reply with your order ID: *${orderId}*`
  );
}

export function buildStatusResponse(order: Order): string {
  const statusMessages: Record<OrderStatus, string> = {
    pending: 'Your order is pending driver assignment.',
    driver_assigned: `Driver *${order.driverName ?? 'assigned'}* will pick up your order at ${order.pickupSlot}.`,
    pickup_in_progress: `*${order.driverName ?? 'Your driver'}* is on the way to collect your order.`,
    collected: 'Your laundry has been collected and is on its way to our facility.',
    cleaning: 'Your items are currently being cleaned at our facility.',
    quality_check: 'Quality inspection in progress — almost ready.',
    out_for_delivery: `*${order.driverName ?? 'Your driver'}* is delivering your order now. Estimated arrival: ${order.deliveryEta}.`,
    delivered: 'Your order has been delivered. Thank you for choosing LaundryKhalas! 🌟',
    escalated: 'Your order has been flagged and a team member will contact you shortly.',
  };
  return (
    `📦 *Order ${order.id}*\n\n` +
    `Status: *${statusMessages[order.status]}*\n` +
    `Facility: ${order.facilityAssigned}\n` +
    `${order.driverName ? `Driver: ${order.driverName}\n` : ''}` +
    `Delivery ETA: ${order.deliveryEta}`
  );
}
