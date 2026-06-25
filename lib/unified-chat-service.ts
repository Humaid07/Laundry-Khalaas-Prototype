export type ResponseBlock =
  | { type: 'text'; content: string }
  | { type: 'metrics'; items: { label: string; value: string; trend?: string; color: string; bg: string }[] }
  | { type: 'bullets'; heading?: string; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'actions'; items: { label: string; href: string; variant?: 'primary' | 'secondary' | 'danger' }[] }
  | { type: 'alert'; severity: 'info' | 'warning' | 'success' | 'error'; message: string };

export interface UnifiedChatResponse {
  summary: string;
  blocks: ResponseBlock[];
  agentSource: string;
  confidence: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  response?: UnifiedChatResponse;
}

type Handler = (query: string) => UnifiedChatResponse;

const PATTERNS: Array<{ keywords: string[]; handler: Handler }> = [
  {
    keywords: ['delayed', 'delay', 'overdue', 'late', 'slow'],
    handler: () => ({
      summary: 'Found 3 orders currently delayed. One is critical and requires immediate escalation.',
      agentSource: 'Operations Agent',
      confidence: 94,
      blocks: [
        { type: 'alert', severity: 'warning', message: '3 orders are overdue today. 1 has breached SLA and requires urgent attention.' },
        { type: 'metrics', items: [
          { label: 'Delayed Today', value: '3', color: 'text-red-600', bg: 'bg-red-50', trend: '+1 from yesterday' },
          { label: 'Avg Delay', value: '47 min', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'SLA Breaches', value: '1', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Driver Issues', value: '1', color: 'text-orange-600', bg: 'bg-orange-50' },
        ]},
        { type: 'table', headers: ['Order ID', 'Customer', 'Delay', 'Issue', 'Priority'], rows: [
          ['LK-AE-1027', 'Hassan Al Blooshi', '45 min', 'Driver not responding', 'Critical'],
          ['LK-AE-1019', 'Marriott Downtown', '32 min', 'Facility delay', 'High'],
          ['LK-AE-1015', 'Nadia Farhat', '18 min', 'Under review', 'Medium'],
        ]},
        { type: 'bullets', heading: 'Recommended Actions', items: [
          'Call Ahmed Khan (Driver d1) immediately — not responding to dispatch',
          'Notify Marriott Downtown of 30-min ETA delay',
          'Offer Nadia Farhat a 20% discount voucher for inconvenience',
        ]},
        { type: 'actions', items: [
          { label: 'View Escalations', href: '/admin/escalations', variant: 'danger' },
          { label: 'Open Orders', href: '/admin/orders', variant: 'secondary' },
          { label: 'Driver Map', href: '/admin/drivers', variant: 'secondary' },
        ]},
      ],
    }),
  },
  {
    keywords: ['escalat', 'human', 'complaint', 'angry', 'upset', 'unhappy'],
    handler: () => ({
      summary: '2 open escalations require human intervention. Both are high priority.',
      agentSource: 'Escalation Agent',
      confidence: 97,
      blocks: [
        { type: 'metrics', items: [
          { label: 'Open Escalations', value: '2', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Assigned', value: '1', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Resolution', value: '2.4 hrs', color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'Escalation Rate', value: '17%', color: 'text-amber-600', bg: 'bg-amber-50' },
        ]},
        { type: 'table', headers: ['Customer', 'Issue', 'Priority', 'Status', 'Created'], rows: [
          ['Omar Farhan', 'Delivery 3hrs overdue', 'High', 'Open', '1:15 PM'],
          ['Nadia Farhat', 'Driver no-show refund', 'High', 'Open', '11:00 AM'],
          ['Marriott Downtown', 'Rush SLA exception', 'Medium', 'Assigned · Sara', '10:00 AM'],
        ]},
        { type: 'bullets', heading: 'Agent Insight', items: [
          'Omar Farhan has been waiting 3+ hours — immediate call recommended',
          'Nadia Farhat refund of AED 85 is likely valid — verify driver logs',
          'Marriott rush order needs facility capacity check before confirming',
        ]},
        { type: 'actions', items: [
          { label: 'Escalation Queue', href: '/admin/escalations', variant: 'danger' },
          { label: 'WhatsApp Agent', href: '/admin/whatsapp', variant: 'secondary' },
        ]},
      ],
    }),
  },
  {
    keywords: ['whatsapp', 'conversation', 'chat', 'message', 'customer message'],
    handler: () => ({
      summary: 'WhatsApp Agent handled 89 conversations today. 83% resolved without human intervention.',
      agentSource: 'WhatsApp Agent',
      confidence: 96,
      blocks: [
        { type: 'metrics', items: [
          { label: 'Conversations Today', value: '89', color: 'text-green-600', bg: 'bg-green-50', trend: '+12%' },
          { label: 'Containment Rate', value: '83%', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Orders Created', value: '47', color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'Active Now', value: '4', color: 'text-amber-600', bg: 'bg-amber-50' },
        ]},
        { type: 'bullets', heading: 'Today\'s Intent Breakdown', items: [
          '48% — New booking requests (converted 78%)',
          '22% — Order status queries (all resolved by AI)',
          '14% — Reschedule requests',
          '9% — Complaints (6 escalated to human)',
          '7% — General inquiries',
        ]},
        { type: 'actions', items: [
          { label: 'WhatsApp Agent', href: '/admin/whatsapp', variant: 'primary' },
          { label: 'Conversations', href: '/admin/conversations', variant: 'secondary' },
          { label: 'Agent Logs', href: '/admin/agent-logs', variant: 'secondary' },
        ]},
      ],
    }),
  },
  {
    keywords: ['campaign', 'marketing', 'social', 'post', 'content', 'schedule'],
    handler: () => ({
      summary: 'Marketing Agent has 14 posts scheduled this week. 3 drafts pending review.',
      agentSource: 'Marketing Agent',
      confidence: 91,
      blocks: [
        { type: 'metrics', items: [
          { label: 'Scheduled Posts', value: '14', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Pending Review', value: '3', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Approved', value: '4', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Reach (Week)', value: '22K', color: 'text-blue-600', bg: 'bg-blue-50', trend: '+18%' },
        ]},
        { type: 'table', headers: ['Content', 'Platform', 'Date', 'Status'], rows: [
          ['Wash & Fold feature post', 'Instagram', 'Mon Jun 23', 'Review'],
          ['Monday offer broadcast', 'WhatsApp', 'Mon Jun 23', 'Approved'],
          ['Behind-the-scenes reel', 'Instagram', 'Tue Jun 24', 'Pending'],
          ['Dry Cleaning article', 'Blog', 'Tue Jun 24', 'Pending'],
          ['Hotel linen spotlight', 'Facebook', 'Wed Jun 25', 'Review'],
        ]},
        { type: 'actions', items: [
          { label: 'Marketing Hub', href: '/admin/marketing', variant: 'primary' },
          { label: 'Content Calendar', href: '/admin/marketing/calendar', variant: 'secondary' },
        ]},
      ],
    }),
  },
  {
    keywords: ['seo', 'blog', 'keyword', 'search', 'ranking', 'google'],
    handler: () => ({
      summary: 'SEO Agent identified 8 keyword opportunities and 2 technical issues this week.',
      agentSource: 'SEO & Blog Agent',
      confidence: 89,
      blocks: [
        { type: 'metrics', items: [
          { label: 'Keyword Opportunities', value: '8', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Technical Issues', value: '2', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Blog Drafts', value: '3', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Position', value: '14.2', color: 'text-gray-700', bg: 'bg-gray-50', trend: '-2.1 improvement' },
        ]},
        { type: 'bullets', heading: 'Top Opportunities', items: [
          '"dry cleaning dubai" — 3,200/mo searches, Medium difficulty',
          '"laundry pickup dubai" — 2,800/mo searches, Low difficulty',
          '"kandura dry cleaning" — 1,100/mo searches, Low difficulty',
          '"same day laundry abu dhabi" — 900/mo searches, Low difficulty',
        ]},
        { type: 'alert', severity: 'warning', message: '2 technical issues: missing meta descriptions on 5 service pages and slow page speed on mobile (72/100).' },
        { type: 'actions', items: [
          { label: 'SEO Section', href: '/admin/marketing', variant: 'primary' },
        ]},
      ],
    }),
  },
  {
    keywords: ['paid ads', 'ads', 'meta ads', 'google ads', 'ppc', 'cpc', 'ctr', 'budget', 'roas'],
    handler: () => ({
      summary: 'Paid Ads campaigns generated AED 41,200 in attributed revenue this week with a blended ROAS of 4.2x.',
      agentSource: 'Paid Ads Agent',
      confidence: 92,
      blocks: [
        { type: 'metrics', items: [
          { label: 'Revenue Attributed', value: 'AED 41.2K', color: 'text-green-600', bg: 'bg-green-50', trend: '+22%' },
          { label: 'ROAS', value: '4.2x', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Spend', value: 'AED 9,800', color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'Avg CPC', value: 'AED 4.20', color: 'text-amber-600', bg: 'bg-amber-50' },
        ]},
        { type: 'table', headers: ['Campaign', 'Platform', 'Spend', 'Conversions', 'ROAS'], rows: [
          ['Eid Dry Cleaning Offer', 'Meta', 'AED 3,200', '41', '5.1x'],
          ['Laundry Dubai Search', 'Google', 'AED 4,100', '52', '3.9x'],
          ['B2B Hotel Outreach', 'LinkedIn', 'AED 1,800', '8', '3.2x'],
          ['Wash & Fold Awareness', 'Meta', 'AED 700', '22', '4.8x'],
        ]},
        { type: 'bullets', heading: 'AI Recommendations', items: [
          'Pause "Wash & Fold Awareness" — CAC too high vs. conversion value',
          'Increase "Eid Dry Cleaning" budget by 30% — strong ROAS, room to scale',
          'Test new ad copy variant B for hotel B2B — current CTR is below benchmark',
        ]},
        { type: 'actions', items: [
          { label: 'Paid Ads Section', href: '/admin/marketing', variant: 'primary' },
        ]},
      ],
    }),
  },
  {
    keywords: ['agent', 'performance', 'agent log', 'slow', 'failing', 'error', 'success rate'],
    handler: () => ({
      summary: 'All 11 agents operational. Average success rate: 95.2%. No critical errors in last 24 hours.',
      agentSource: 'Agent Hub',
      confidence: 99,
      blocks: [
        { type: 'metrics', items: [
          { label: 'Agents Active', value: '4', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Runs Today', value: '201', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Success Rate', value: '95.2%', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Escalations', value: '8', color: 'text-amber-600', bg: 'bg-amber-50' },
        ]},
        { type: 'table', headers: ['Agent', 'Runs Today', 'Success Rate', 'Avg Time', 'Status'], rows: [
          ['Customer Order Agent', '47', '91%', '320ms', 'Active'],
          ['Intent Classifier', '89', '97%', '45ms', 'Active'],
          ['Operations Orchestrator', '34', '94%', '210ms', 'Active'],
          ['Human Escalation Agent', '8', '100%', '160ms', 'Active'],
          ['Content Planning Agent', '3', '100%', '890ms', 'Idle'],
          ['Social Media Agent', '6', '98%', '740ms', 'Idle'],
        ]},
        { type: 'actions', items: [
          { label: 'Agent Hub', href: '/admin/agent-hub', variant: 'primary' },
          { label: 'Agent Logs', href: '/admin/agent-logs', variant: 'secondary' },
        ]},
      ],
    }),
  },
  {
    keywords: ['summary', 'daily', 'overview', 'today', 'report', 'business summary'],
    handler: () => ({
      summary: 'Daily business summary for Monday, Jun 23, 2026. Strong day across operations and marketing.',
      agentSource: 'All Agents',
      confidence: 97,
      blocks: [
        { type: 'alert', severity: 'success', message: 'Operations running well. 2 escalations require human attention before EOD.' },
        { type: 'metrics', items: [
          { label: 'Orders Today', value: '128', color: 'text-pink-600', bg: 'bg-pink-50', trend: '+12%' },
          { label: 'Revenue Today', value: 'AED 12,450', color: 'text-green-600', bg: 'bg-green-50', trend: '+8%' },
          { label: 'WA Conversations', value: '89', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Satisfaction', value: '4.8 ★', color: 'text-amber-600', bg: 'bg-amber-50' },
        ]},
        { type: 'bullets', heading: '📦 Operations', items: [
          '128 orders received — 89 delivered, 22 out for delivery, 51 in cleaning',
          '18 drivers active — 3 available for new assignments',
          '2 escalations open: Omar Farhan (complaint) and Nadia Farhat (refund)',
        ]},
        { type: 'bullets', heading: '📱 WhatsApp', items: [
          '89 conversations — 83% contained by AI without human intervention',
          '47 orders auto-created via WhatsApp agent',
          'Peak hour: 5PM–7PM (28 conversations)',
        ]},
        { type: 'bullets', heading: '📣 Marketing', items: [
          '3 content drafts ready for review',
          'Content calendar: 14 posts scheduled this week',
          'Eid campaign ROAS: 5.1x — recommend scaling budget',
        ]},
        { type: 'actions', items: [
          { label: 'View Dashboard', href: '/admin', variant: 'primary' },
          { label: 'Escalations', href: '/admin/escalations', variant: 'danger' },
          { label: 'Marketing Hub', href: '/admin/marketing', variant: 'secondary' },
        ]},
      ],
    }),
  },
  {
    keywords: ['order', 'orders', 'booking', 'laundry order', 'pending order'],
    handler: () => ({
      summary: 'Found 128 orders today. 34 are pending pickup and 22 are out for delivery.',
      agentSource: 'Operations Agent',
      confidence: 95,
      blocks: [
        { type: 'metrics', items: [
          { label: 'Total Today', value: '128', color: 'text-gray-900', bg: 'bg-gray-50', trend: '+12%' },
          { label: 'Pending Pickup', value: '34', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Cleaning', value: '51', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Out for Delivery', value: '22', color: 'text-blue-600', bg: 'bg-blue-50' },
        ]},
        { type: 'bullets', heading: 'Status Breakdown', items: [
          '89 orders delivered successfully today',
          '34 orders awaiting driver assignment for pickup',
          '51 orders currently in cleaning or quality check',
          '22 orders out for delivery — expected by 8PM',
          '3 orders flagged with delays',
        ]},
        { type: 'actions', items: [
          { label: 'View All Orders', href: '/admin/orders', variant: 'primary' },
          { label: 'Driver Dispatch', href: '/admin/drivers', variant: 'secondary' },
        ]},
      ],
    }),
  },
  {
    keywords: ['intent', 'classify', 'classification', 'classifier', 'intent type'],
    handler: () => ({
      summary: 'Intent Classifier processed 312 messages today with 97% accuracy.',
      agentSource: 'Intent Classifier',
      confidence: 97,
      blocks: [
        { type: 'metrics', items: [
          { label: 'Classified Today', value: '312', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Accuracy', value: '97%', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Avg Confidence', value: '88%', color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'Escalations Triggered', value: '14', color: 'text-red-600', bg: 'bg-red-50' },
        ]},
        { type: 'bullets', heading: 'Top Intents Today', items: [
          'new_order: 48% (150 messages)',
          'order_status: 22% (69 messages)',
          'complaint: 9% (28 messages) — 6 escalated',
          'pricing_inquiry: 8% (25 messages)',
          'refund_request: 4% (12 messages) — all escalated',
        ]},
        { type: 'actions', items: [
          { label: 'Intent Classifier', href: '/admin/intent-classifier', variant: 'primary' },
          { label: 'Agent Logs', href: '/admin/agent-logs', variant: 'secondary' },
        ]},
      ],
    }),
  },
];

function matchPattern(query: string): Handler | null {
  const q = query.toLowerCase();
  for (const p of PATTERNS) {
    if (p.keywords.some(k => q.includes(k))) {
      return p.handler;
    }
  }
  return null;
}

const FALLBACK: UnifiedChatResponse = {
  summary: 'Here\'s a quick overview of your platform right now.',
  agentSource: 'All Agents',
  confidence: 75,
  blocks: [
    { type: 'metrics', items: [
      { label: 'Orders Today', value: '128', color: 'text-pink-600', bg: 'bg-pink-50', trend: '+12%' },
      { label: 'Active Conversations', value: '4', color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Open Escalations', value: '2', color: 'text-red-600', bg: 'bg-red-50' },
      { label: 'Revenue Today', value: 'AED 12.4K', color: 'text-blue-600', bg: 'bg-blue-50' },
    ]},
    { type: 'bullets', heading: 'Try asking me', items: [
      '"How many orders are delayed today?"',
      '"Which customers need human escalation?"',
      '"Show me WhatsApp agent performance"',
      '"What campaigns are scheduled this week?"',
      '"Give me a daily business summary"',
    ]},
    { type: 'actions', items: [
      { label: 'Dashboard', href: '/admin', variant: 'primary' },
      { label: 'Escalations', href: '/admin/escalations', variant: 'secondary' },
    ]},
  ],
};

export async function askUnifiedAgent(query: string): Promise<UnifiedChatResponse> {
  await new Promise(r => setTimeout(r, 600 + Math.random() * 600));
  const handler = matchPattern(query);
  return handler ? handler(query) : FALLBACK;
}
