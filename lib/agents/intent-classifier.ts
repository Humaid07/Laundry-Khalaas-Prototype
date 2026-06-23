import type { IntentType } from './types';

interface ClassificationResult {
  intent: IntentType;
  confidence: 'high' | 'medium' | 'low';
  matchedKeywords: string[];
}

const INTENT_PATTERNS: Array<{ intent: IntentType; keywords: string[]; weight: number }> = [
  {
    intent: 'new_order',
    weight: 10,
    keywords: [
      'book', 'order', 'pickup', 'pick up', 'collect', 'laundry', 'wash',
      'dry clean', 'iron', 'ironing', 'pressing', 'duvet', 'blanket',
      'curtain', 'want to', 'need laundry', 'schedule', 'arrange',
      'i have', 'clean my', 'shirts', 'trousers', 'suit', 'clothes',
      'kandura', 'abaya', 'send driver', 'drop off',
    ],
  },
  {
    intent: 'order_status',
    weight: 10,
    keywords: [
      'status', 'where is', 'when will', 'my order', 'track', 'tracking',
      'update', 'delivered', 'delivery', 'how long', 'eta', 'expected',
      'still waiting', 'waiting for', 'has my order', 'ready yet',
      'lk-ae', 'order id', 'order number',
    ],
  },
  {
    intent: 'complaint',
    weight: 12,
    keywords: [
      'complaint', 'angry', 'terrible', 'bad service', 'unacceptable',
      'disgusting', 'ruined', 'damaged', 'late', 'delay', 'missed',
      'not happy', 'unhappy', 'disappointed', 'frustrated', 'worst',
      'never again', 'this is not', 'ridiculous', 'overdue', 'hours ago',
      'still not', 'where are you', 'why is it', 'not arrived',
    ],
  },
  {
    intent: 'refund_request',
    weight: 12,
    keywords: [
      'refund', 'money back', 'compensation', 'reimburse', 'cancel',
      'pay back', 'charge me back', 'return my money', 'credit',
      'overcharged', 'wrong amount', 'dispute',
    ],
  },
  {
    intent: 'pricing_inquiry',
    weight: 9,
    keywords: [
      'price', 'cost', 'how much', 'rate', 'charge', 'aed', 'fee',
      'pricing', 'quote', 'estimate', 'per kg', 'per item', 'per piece',
      'minimum', 'charges', 'expensive', 'cheap', 'affordable',
    ],
  },
  {
    intent: 'service_inquiry',
    weight: 9,
    keywords: [
      'what services', 'do you do', 'can you', 'do you offer',
      'available services', 'what do you', 'types of', 'service list',
      'do you clean', 'can you handle', 'how does it work',
      'what is included', 'turnaround', 'how long does', 'same day',
    ],
  },
  {
    intent: 'job_inquiry',
    weight: 11,
    keywords: [
      'job', 'work', 'vacancy', 'hiring', 'apply', 'driver job',
      'employment', 'position', 'career', 'join your team', 'working for',
      'salary', 'driver application', 'recruitment',
    ],
  },
  {
    intent: 'facility_partner_inquiry',
    weight: 11,
    keywords: [
      'partner', 'facility', 'laundromat', 'my facility', 'list my',
      'join as', 'vendor', 'partner with', 'business opportunity',
      'collaborate', 'franchise', 'white label', 'facility owner',
    ],
  },
  {
    intent: 'driver_update',
    weight: 11,
    keywords: [
      'driver update', 'driver location', 'driver eta', 'driver called',
      'driver arrived', 'driver not showing', 'driver issue', 'driver late',
    ],
  },
  {
    intent: 'sales_inquiry',
    weight: 8,
    keywords: [
      'b2b', 'hotel', 'hospital', 'restaurant', 'corporate', 'gym',
      'spa', 'resort', 'clinic', 'bulk order', 'weekly contract',
      'monthly contract', 'business account', 'large volume',
    ],
  },
  {
    intent: 'human_required',
    weight: 15,
    keywords: [
      'speak to someone', 'talk to human', 'real person', 'agent please',
      'manager', 'supervisor', 'escalate', 'i want to speak', 'human agent',
      'call me', 'phone call', 'this is urgent',
    ],
  },
];

export function classifyIntent(text: string): ClassificationResult {
  const lower = text.toLowerCase();
  const scores: Map<IntentType, { score: number; keywords: string[] }> = new Map();

  for (const pattern of INTENT_PATTERNS) {
    const matched: string[] = [];
    for (const kw of pattern.keywords) {
      if (lower.includes(kw)) matched.push(kw);
    }
    if (matched.length > 0) {
      const existing = scores.get(pattern.intent);
      const score = matched.length * pattern.weight;
      scores.set(pattern.intent, {
        score: (existing?.score ?? 0) + score,
        keywords: [...(existing?.keywords ?? []), ...matched],
      });
    }
  }

  if (scores.size === 0) {
    return { intent: 'unknown', confidence: 'low', matchedKeywords: [] };
  }

  let best: IntentType = 'unknown';
  let bestScore = 0;
  scores.forEach(({ score }, intent) => {
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  });

  const bestData = scores.get(best)!;
  const confidence: ClassificationResult['confidence'] =
    bestScore >= 20 ? 'high' : bestScore >= 10 ? 'medium' : 'low';

  return { intent: best, confidence, matchedKeywords: bestData.keywords.slice(0, 5) };
}

export function getIntentFromText(text: string): IntentType {
  return classifyIntent(text).intent;
}
