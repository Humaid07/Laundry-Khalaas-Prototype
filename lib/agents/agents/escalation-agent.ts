import type { Conversation, AgentResult, IntentType } from '../types';
import { buildEscalation } from '../tools/escalation-tools';
import { summarizeConversation } from '../tools/message-tools';

const AGENT_NAME = 'Human Escalation Agent';

const CUSTOMER_FACING_RESPONSES: Partial<Record<IntentType, string>> = {
  complaint:
    'We sincerely apologize for the inconvenience you have experienced. A member of our team will review your case and contact you personally within the next 30 minutes. We take every complaint seriously and will make this right.',
  refund_request:
    'Thank you for bringing this to our attention. Your refund request has been received and escalated to our customer support team. You will hear back within 2 hours with a resolution.',
  human_required:
    'Absolutely — one of our team members will be in touch with you shortly. We appreciate your patience.',
  unknown:
    'Your message has been received and passed to our operations team for review. Someone will follow up with you soon.',
};

export function runEscalationAgent(
  message: string,
  conversation: Conversation,
  intent: IntentType
): AgentResult {
  const summary = summarizeConversation(conversation);
  const escalationData = buildEscalation({
    conversationId: conversation.id,
    customerName: conversation.customerName,
    customerPhone: conversation.customerPhone,
    orderId: conversation.activeOrderId,
    intent,
    lastMessage: message,
    conversationSummary: summary,
  });

  const toolCalls = [{
    name: 'create_escalation',
    input: { conversationId: conversation.id, intent, reason: escalationData.reason },
    output: { created: true, escalationId: `esc-${Date.now()}`, priority: escalationData.priority },
    durationMs: 18,
  }];

  const customerResponse =
    CUSTOMER_FACING_RESPONSES[intent] ?? CUSTOMER_FACING_RESPONSES.unknown!;

  return {
    agentName: AGENT_NAME,
    response: customerResponse,
    toolsUsed: ['create_escalation'],
    toolCalls,
    conversationUpdates: {
      status: 'escalated',
      lastAgentAction: 'escalation_created',
      summary,
    },
    escalation: escalationData,
    runStatus: 'escalated',
  };
}
