export type IntentType =
  | 'new_order'
  | 'pricing_inquiry'
  | 'service_inquiry'
  | 'order_status'
  | 'complaint'
  | 'refund_request'
  | 'job_inquiry'
  | 'facility_partner_inquiry'
  | 'driver_update'
  | 'sales_inquiry'
  | 'human_required'
  | 'unknown';

export const INTENT_LABELS: Record<IntentType, string> = {
  new_order: 'New Order',
  pricing_inquiry: 'Pricing Inquiry',
  service_inquiry: 'Service Inquiry',
  order_status: 'Order Status',
  complaint: 'Complaint',
  refund_request: 'Refund Request',
  job_inquiry: 'Job Inquiry',
  facility_partner_inquiry: 'Facility Partner',
  driver_update: 'Driver Update',
  sales_inquiry: 'Sales Inquiry',
  human_required: 'Human Required',
  unknown: 'Unknown',
};

export const INTENT_COLORS: Record<IntentType, string> = {
  new_order: 'bg-green-100 text-green-700',
  pricing_inquiry: 'bg-blue-100 text-blue-700',
  service_inquiry: 'bg-purple-100 text-purple-700',
  order_status: 'bg-gray-100 text-gray-700',
  complaint: 'bg-red-100 text-red-700',
  refund_request: 'bg-orange-100 text-orange-700',
  job_inquiry: 'bg-teal-100 text-teal-700',
  facility_partner_inquiry: 'bg-indigo-100 text-indigo-700',
  driver_update: 'bg-cyan-100 text-cyan-700',
  sales_inquiry: 'bg-amber-100 text-amber-700',
  human_required: 'bg-red-100 text-red-700',
  unknown: 'bg-gray-100 text-gray-500',
};

export type ConversationStatus = 'active' | 'resolved' | 'escalated' | 'waiting_human';

export type MessageRole = 'customer' | 'agent' | 'system';

export type SentimentType = 'positive' | 'neutral' | 'negative';

export type ChannelType = 'whatsapp' | 'app' | 'web' | 'simulated';

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  durationMs: number;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  agentName?: string;
  toolCalls?: ToolCall[];
  intent?: IntentType;
}

export interface OrderDraft {
  customerName?: string;
  customerPhone?: string;
  address?: string;
  emirate?: string;
  serviceType?: string;
  items?: string;
  pickupSlot?: string;
  notes?: string;
  estimatedAmount?: number;
}

export interface Conversation {
  id: string;
  customerId?: string;
  customerPhone: string;
  customerName?: string;
  status: ConversationStatus;
  intent?: IntentType;
  activeOrderId?: string;
  orderDraft: OrderDraft;
  missingFields: string[];
  lastAgentAction?: string;
  escalationId?: string;
  summary?: string;
  sentiment: SentimentType;
  channel: ChannelType;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export type EscalationStatus = 'open' | 'assigned' | 'resolved';
export type EscalationPriority = 'high' | 'medium' | 'low';

export interface Escalation {
  id: string;
  conversationId: string;
  orderId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  reason: string;
  summary: string;
  recommendedAction: string;
  priority: EscalationPriority;
  status: EscalationStatus;
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
}

export type AgentRunStatus = 'success' | 'escalated' | 'error';

export interface AgentRun {
  id: string;
  agentName: string;
  conversationId?: string;
  inputSummary: string;
  intentDetected?: IntentType;
  toolsUsed: string[];
  outputSummary: string;
  durationMs: number;
  status: AgentRunStatus;
  createdAt: string;
}

export type MarketingTaskStatus = 'pending' | 'draft' | 'review' | 'approved' | 'rejected';

export type MarketingDraftType =
  | 'social_post'
  | 'blog_brief'
  | 'ad_copy'
  | 'caption'
  | 'content_calendar'
  | 'campaign_brief'
  | 'seo_report'
  | 'analytics_report'
  | 'lead_note';

export interface MarketingTask {
  id: string;
  agentId: string;
  agentName: string;
  taskType: string;
  title: string;
  status: MarketingTaskStatus;
  brief: string;
  platform?: string;
  target?: string;
  draftId?: string;
  createdAt: string;
}

export interface MarketingDraft {
  id: string;
  taskId: string;
  type: MarketingDraftType;
  title: string;
  content: string;
  brandSafetyScore: number;
  issues: string[];
  approvedBy?: string;
  reviewNotes?: string;
  status: MarketingTaskStatus;
  agentName: string;
  platform?: string;
  createdAt: string;
}

export type AgentStatus = 'active' | 'idle' | 'paused' | 'error';
export type AgentCategory = 'operations' | 'marketing' | 'support';

export interface AgentRegistration {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  status: AgentStatus;
  lastRun?: string;
  runsToday: number;
  successRate: number;
  avgDurationMs: number;
  capabilities: string[];
  isEnabled: boolean;
  color: string;
}

export interface AgentResult {
  agentName: string;
  response: string;
  toolsUsed: string[];
  toolCalls: ToolCall[];
  conversationUpdates: Partial<Conversation>;
  escalation?: Omit<Escalation, 'id' | 'createdAt'>;
  runStatus: AgentRunStatus;
}

export interface CalendarSlot {
  id: string;
  date: string;
  dayLabel: string;
  platform: 'instagram' | 'facebook' | 'whatsapp' | 'tiktok' | 'blog' | 'google_ads';
  contentType: string;
  title: string;
  status: MarketingTaskStatus;
  draftId?: string;
}
