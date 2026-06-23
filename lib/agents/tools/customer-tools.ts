import type { Customer } from '@/lib/mock-data';
import type { OrderDraft, ToolCall } from '../types';

export function getOrCreateCustomer(
  phone: string,
  customers: Customer[],
  draft: OrderDraft
): { customer: Customer | null; isNew: boolean; toolCall: ToolCall } {
  const start = Date.now();
  const existing = customers.find(c => c.phone === phone);

  const output = existing
    ? { found: true, customerId: existing.id, name: existing.name, ordersCount: existing.ordersCount }
    : { found: false, message: 'New customer — will be created on order confirmation' };

  return {
    customer: existing ?? null,
    isNew: !existing,
    toolCall: {
      name: 'get_or_create_customer',
      input: { phone, draftName: draft.customerName },
      output,
      durationMs: Date.now() - start + 12,
    },
  };
}

export function buildCustomerSummary(customer: Customer | null, draft: OrderDraft): string {
  if (!customer) {
    return `New customer: ${draft.customerName ?? 'Unknown'} (${draft.customerPhone ?? 'no phone'})`;
  }
  return `${customer.name} · ${customer.ordersCount} orders · ${customer.status.toUpperCase()} · ${customer.emirate}`;
}
