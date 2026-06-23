import type { Conversation, ConversationMessage, ToolCall } from '../types';

export function buildAgentMessage(
  conversationId: string,
  content: string,
  agentName: string,
  toolCalls: ToolCall[] = []
): ConversationMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    conversationId,
    role: 'agent',
    content,
    timestamp: new Date().toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' }),
    agentName,
    toolCalls,
  };
}

export function buildCustomerMessage(
  conversationId: string,
  content: string
): ConversationMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    conversationId,
    role: 'customer',
    content,
    timestamp: new Date().toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' }),
  };
}

export function summarizeConversation(conversation: Conversation): string {
  const msgCount = conversation.messages.length;
  const intent = conversation.intent ?? 'unknown';
  const customer = conversation.customerName ?? conversation.customerPhone;

  if (msgCount === 0) return `New conversation from ${customer}.`;

  const lastCustomerMsg = [...conversation.messages]
    .reverse()
    .find(m => m.role === 'customer');

  const parts: string[] = [`${customer} contacted via ${conversation.channel}.`];
  if (intent !== 'unknown') parts.push(`Detected intent: ${intent.replace(/_/g, ' ')}.`);
  if (conversation.activeOrderId) parts.push(`Related order: ${conversation.activeOrderId}.`);
  if (conversation.orderDraft.serviceType) parts.push(`Service requested: ${conversation.orderDraft.serviceType}.`);
  if (lastCustomerMsg) parts.push(`Last message: "${lastCustomerMsg.content.slice(0, 80)}".`);
  if (conversation.escalationId) parts.push(`Escalated — awaiting human response.`);

  return parts.join(' ');
}

export function detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lc = text.toLowerCase();
  const negativeSignals = ['angry', 'terrible', 'bad', 'unacceptable', 'disgusting', 'ruined', 'damaged',
    'late', 'delay', 'missed', 'not happy', 'unhappy', 'disappointed', 'frustrated', 'worst',
    'never again', 'ridiculous', 'still not', 'horrible', 'awful', 'useless', 'refund'];
  const positiveSignals = ['thank', 'great', 'excellent', 'love', 'happy', 'amazing', 'perfect',
    'good service', 'well done', 'satisfied', 'appreciate', 'wonderful'];

  const negScore = negativeSignals.filter(s => lc.includes(s)).length;
  const posScore = positiveSignals.filter(s => lc.includes(s)).length;

  if (negScore > posScore && negScore > 0) return 'negative';
  if (posScore > 0) return 'positive';
  return 'neutral';
}
