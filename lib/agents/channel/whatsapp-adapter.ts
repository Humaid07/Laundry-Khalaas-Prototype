/**
 * WhatsApp channel adapter.
 * Provides a clean interface for sending and receiving messages.
 * Currently operates in simulation mode.
 *
 * To connect real WhatsApp Business API:
 *   1. Set WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID in env
 *   2. Implement sendRealMessage() using the Meta Cloud API
 *   3. Add webhook route at /api/webhooks/whatsapp to call receiveWebhook()
 *   4. No changes needed to agent logic above this layer
 */

export interface InboundMessage {
  from: string;
  body: string;
  timestamp: string;
  messageId: string;
  channel: 'whatsapp' | 'simulated';
}

export interface OutboundMessage {
  to: string;
  body: string;
  channel: 'whatsapp' | 'simulated';
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated: boolean;
}

export function parseWebhookPayload(rawBody: unknown): InboundMessage | null {
  try {
    const body = rawBody as Record<string, unknown>;
    const entry = (body?.entry as unknown[])?.[0] as Record<string, unknown>;
    const changes = (entry?.changes as unknown[])?.[0] as Record<string, unknown>;
    const value = changes?.value as Record<string, unknown>;
    const messages = value?.messages as unknown[];
    if (!messages?.length) return null;

    const msg = messages[0] as Record<string, unknown>;
    return {
      from: msg.from as string,
      body: (msg as Record<string, Record<string, string>>).text?.body ?? '',
      timestamp: new Date().toISOString(),
      messageId: msg.id as string,
      channel: 'whatsapp',
    };
  } catch {
    return null;
  }
}

export async function sendMessage(message: OutboundMessage): Promise<SendResult> {
  const isRealMode = Boolean(
    process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
  );

  if (isRealMode) {
    /**
     * TODO: implement real WhatsApp send
     * const res = await fetch(
     *   `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
     *   {
     *     method: 'POST',
     *     headers: {
     *       Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
     *       'Content-Type': 'application/json',
     *     },
     *     body: JSON.stringify({
     *       messaging_product: 'whatsapp',
     *       to: message.to,
     *       type: 'text',
     *       text: { body: message.body },
     *     }),
     *   }
     * );
     */
    console.warn('[WhatsApp] Real integration not yet implemented. Falling through to simulation.');
  }

  // Simulated mode — log and return success
  console.log(`[WhatsApp Simulated] → ${message.to}: "${message.body.slice(0, 80)}..."`);
  return {
    success: true,
    messageId: `sim-${Date.now()}`,
    simulated: true,
  };
}

export function createSimulatedInbound(phone: string, body: string): InboundMessage {
  return {
    from: phone,
    body,
    timestamp: new Date().toISOString(),
    messageId: `sim-in-${Date.now()}`,
    channel: 'simulated',
  };
}
