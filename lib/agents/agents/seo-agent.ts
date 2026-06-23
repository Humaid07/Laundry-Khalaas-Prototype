import type { MarketingDraft, MarketingTask } from '../types';
import { createMarketingTask, createMarketingDraft } from '../tools/marketing-tools';

const AGENT_NAME = 'SEO & Blog Agent';
const AGENT_ID = 'seo-agent';

function generateSEOBrief(topic: string): string {
  const lc = topic.toLowerCase();

  if (lc.includes('dry clean') || lc.includes('kandura') || lc.includes('suit')) {
    return `# SEO Brief: Dry Cleaning Dubai\n\n**Primary Keyword:** dry cleaning dubai\n**Secondary Keywords:** dry cleaning service near me, kandura dry cleaning, suit dry cleaning uae, express dry cleaning dubai\n**Search Volume:** ~3,200/mo\n**Difficulty:** Medium\n\n## Article Outline\n\n**H1:** Best Dry Cleaning Services in Dubai (2026 Guide)\n\n**H2:** How Dry Cleaning Works\n- Chemical process vs water washing\n- Suitable garment types\n\n**H2:** What Can Be Dry Cleaned?\n- Kanduras and thobes\n- Business suits and blazers\n- Formal dresses and gowns\n- Woollen items\n\n**H2:** Dry Cleaning Prices in Dubai\n- Price comparison table (suit, shirt, dress, kandura)\n- LaundryKhalas pricing (from AED 15/item)\n\n**H2:** How to Book Dry Cleaning with Pickup in Dubai\n- WhatsApp booking steps\n\n**CTA:** Book dry cleaning pickup now via WhatsApp\n\n**Meta Title:** Dry Cleaning Dubai — Pickup & Delivery | LaundryKhalas\n**Meta Description:** Professional dry cleaning in Dubai with free pickup and delivery. Kanduras, suits, gowns — from AED 15/item. Book in 2 min on WhatsApp.`;
  }

  if (lc.includes('hotel') || lc.includes('b2b') || lc.includes('hospitality')) {
    return `# SEO Brief: Hotel Laundry Service Dubai\n\n**Primary Keyword:** hotel linen laundry service dubai\n**Secondary Keywords:** commercial laundry uae, b2b laundry service, bulk laundry dubai, restaurant laundry service\n**Search Volume:** ~850/mo\n**Difficulty:** Low-Medium\n\n## Article Outline\n\n**H1:** Professional Hotel & Commercial Laundry Services in Dubai\n\n**H2:** Why Hotels Trust LaundryKhalas\n- Volume handling capacity\n- SLA commitments\n- Quality control process\n\n**H2:** Industries We Serve\n- Hotels and resorts\n- Restaurants and cafes\n- Gyms and spas\n- Medical clinics\n\n**H2:** Custom B2B Packages\n- Weekly pickup schedules\n- Invoice-based billing\n- Dedicated account manager\n\n**CTA:** Request a B2B quote\n\n**Meta Title:** Hotel Laundry Service Dubai | B2B Commercial Laundry | LaundryKhalas\n**Meta Description:** Professional bulk laundry services for hotels, restaurants, gyms and clinics across Dubai, Abu Dhabi and Sharjah. Custom SLA. Request a free quote.`;
  }

  return `# SEO Brief: Laundry Service Dubai\n\n**Primary Keyword:** laundry service dubai\n**Secondary Keywords:** laundry pickup dubai, wash and fold dubai, laundry delivery dubai, laundry near me dubai\n**Search Volume:** ~8,400/mo\n**Difficulty:** High\n\n## Article Outline\n\n**H1:** Best Laundry Pickup & Delivery Service in Dubai (2026)\n\n**H2:** How It Works\n1. Book on WhatsApp\n2. Driver collects from your door\n3. Cleaned at our facility\n4. Delivered back to you\n\n**H2:** Services We Offer\n- Wash & Fold (AED 8/kg)\n- Dry Cleaning (AED 15/item)\n- Ironing (AED 7/item)\n- Blankets & Duvets (AED 45/item)\n\n**H2:** Coverage Areas\n- Dubai Marina, JVC, Business Bay, Downtown, Jumeirah\n- Abu Dhabi, Sharjah\n\n**H2:** Why Choose LaundryKhalas\n- WhatsApp booking in 2 minutes\n- Same-day slots available\n- Tracked delivery\n\n**CTA:** Book laundry pickup now\n\n**Meta Title:** Laundry Pickup & Delivery Service Dubai | LaundryKhalas\n**Meta Description:** Professional laundry service in Dubai with pickup and delivery. Wash & Fold from AED 8/kg. Book in 2 minutes on WhatsApp.`;
}

export function runSEOAgent(topic: string): { task: MarketingTask; draft: MarketingDraft } {
  const task = createMarketingTask({
    agentId: AGENT_ID,
    agentName: AGENT_NAME,
    taskType: 'seo_brief',
    title: `SEO Brief — ${topic.slice(0, 50)}`,
    brief: topic,
    target: 'Organic search UAE',
  });

  const content = generateSEOBrief(topic);
  const draft = createMarketingDraft({
    taskId: task.id,
    type: 'blog_brief',
    title: task.title,
    content,
    agentName: AGENT_NAME,
    platform: 'Blog / Website',
  });

  return { task, draft };
}
