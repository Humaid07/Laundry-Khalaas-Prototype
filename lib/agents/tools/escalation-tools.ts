import type { Escalation, EscalationPriority, IntentType } from '../types';

export function buildEscalation(params: {
  conversationId: string;
  customerName?: string;
  customerPhone?: string;
  orderId?: string;
  intent: IntentType;
  lastMessage: string;
  conversationSummary: string;
}): Omit<Escalation, 'id' | 'createdAt'> {
  const { conversationId, customerName, customerPhone, orderId, intent, lastMessage, conversationSummary } = params;

  const reasonMap: Partial<Record<IntentType, string>> = {
    complaint: 'Customer expressed significant dissatisfaction',
    refund_request: 'Customer is requesting a refund',
    human_required: 'Customer explicitly requested a human agent',
    unknown: 'Message could not be resolved automatically',
  };

  const actionMap: Partial<Record<IntentType, string>> = {
    complaint: 'Acknowledge the delay, apologize sincerely, and offer a discount on next order. Check if order can be expedited.',
    refund_request: 'Review order details, confirm the issue, and process refund via finance if valid. Notify customer within 2 hours.',
    human_required: 'Contact the customer directly and address their specific concern.',
    unknown: 'Review the conversation and determine the correct course of action.',
  };

  const priorityMap: Partial<Record<IntentType, EscalationPriority>> = {
    complaint: 'high',
    refund_request: 'high',
    human_required: 'medium',
    unknown: 'low',
  };

  return {
    conversationId,
    orderId,
    customerName,
    customerPhone,
    reason: reasonMap[intent] ?? `Conversation requires human review (intent: ${intent})`,
    summary: conversationSummary,
    recommendedAction: actionMap[intent] ?? 'Review the conversation and take appropriate action.',
    priority: priorityMap[intent] ?? 'medium',
    status: 'open',
  };
}
