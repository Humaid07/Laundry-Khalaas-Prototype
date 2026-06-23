import type { MarketingDraft, MarketingTask } from '../types';
import { createMarketingTask, createMarketingDraft, reviewBrandSafety } from '../tools/marketing-tools';

const AGENT_NAME = 'Paid Ads Agent';
const AGENT_ID = 'ads-agent';

function generateAdCopy(brief: string): string {
  const lc = brief.toLowerCase();

  if (lc.includes('ramadan') || lc.includes('eid')) {
    return `# Ad Copy Variants — Ramadan/Eid Campaign\n\n## Variant A (Emotional)\n**Headline 1:** Fresh Kanduras for Eid\n**Headline 2:** Pickup & Delivery in Dubai\n**Headline 3:** From AED 15/Item\n**Description 1:** Professional dry cleaning with free pickup. Your kandura, pressed to perfection for Eid.\n**Description 2:** Book on WhatsApp in 2 minutes. Same-day slots available across Dubai.\n\n## Variant B (Offer-led)\n**Headline 1:** Eid Special — 20% Off Dry Cleaning\n**Headline 2:** LaundryKhalas — UAE's Laundry App\n**Headline 3:** Book via WhatsApp Today\n**Description 1:** Limited Eid offer. Dry cleaning from AED 12/item with free pickup across Dubai.\n**Description 2:** Trusted by 5,000+ customers. Same-day service available.\n\n## Variant C (Convenience)\n**Headline 1:** No Laundromat Trips Needed\n**Headline 2:** We Pick Up — You Relax\n**Headline 3:** Dubai-Wide Coverage\n**Description 1:** Schedule a pickup from home. Driver collects, we clean, we deliver. From AED 8/kg.\n**Description 2:** WhatsApp booking. No app download needed. Try today.\n\n## Audience Suggestions\n- UAE nationals aged 25–55 in Dubai, Abu Dhabi, Sharjah\n- Interest: fashion, home, lifestyle\n- Lookalike: existing customer list\n\n## A/B Test Recommendation\nTest Variant A vs B on emotional vs offer-led messaging. Run for 7 days, min AED 150/day budget.`;
  }

  if (lc.includes('b2b') || lc.includes('hotel') || lc.includes('business')) {
    return `# Ad Copy Variants — B2B Campaign\n\n## Variant A (Problem-Solution)\n**Headline 1:** Hotel Linen Overloaded?\n**Headline 2:** Commercial Laundry — Dubai\n**Headline 3:** Custom SLA | Weekly Pickup\n**Description 1:** LaundryKhalas handles linen for hotels, restaurants, gyms and clinics across UAE. Reliable, scalable, affordable.\n**Description 2:** Request a free B2B quote. Dedicated account manager. Invoice billing.\n\n## Variant B (Trust)\n**Headline 1:** Trusted by 50+ UAE Businesses\n**Headline 2:** B2B Laundry — Fixed Pricing\n**Headline 3:** Hotels · Restaurants · Clinics\n**Description 1:** Volume laundry with quality control. We handle towels, linen, uniforms — on your schedule.\n**Description 2:** Book a consultation. No commitment required.\n\n## Audience Suggestions\n- Job title: Hotel Manager, F&B Manager, Operations Manager\n- Industry: Hospitality, Healthcare, Fitness\n- Location: Dubai, Abu Dhabi, Sharjah business districts\n\n## Recommended Platforms\n- LinkedIn (B2B decision makers)\n- Google Search (intent-based)\n- Meta (retargeting website visitors)`;
  }

  return `# Ad Copy Variants — General Campaign\n\n## Variant A (Speed)\n**Headline 1:** Laundry Pickup in 60 Min\n**Headline 2:** Delivered Back the Next Day\n**Headline 3:** From AED 8/kg — Dubai\n**Description 1:** Book on WhatsApp, driver comes to you. No waiting, no trips. We wash, fold and deliver.\n**Description 2:** Available in Dubai, Abu Dhabi, Sharjah. Book your first pickup today.\n\n## Variant B (Price)\n**Headline 1:** Laundry Service From AED 8/kg\n**Headline 2:** Free Pickup & Delivery\n**Headline 3:** WhatsApp Booking — 2 Minutes\n**Description 1:** Affordable laundry with doorstep pickup. Wash, dry clean, iron — all in one service.\n**Description 2:** Thousands of happy customers across UAE. Try LaundryKhalas today.\n\n## Variant C (Lifestyle)\n**Headline 1:** Your Laundry Is Done For You\n**Headline 2:** We Pick Up · We Deliver · Done\n**Headline 3:** Book on WhatsApp Now\n**Description 1:** Skip the laundry day. Let us handle washing, ironing and folding — delivered to your door.\n**Description 2:** Schedule any time. Same-day slots available in Dubai.\n\n## A/B Recommendation\nRun A vs C split — speed vs lifestyle angle. Bid on: laundry service dubai, laundry pickup dubai, wash and fold near me.`;
}

export function runAdsAgent(brief: string, platform?: string): {
  task: MarketingTask;
  draft: MarketingDraft;
} {
  const task = createMarketingTask({
    agentId: AGENT_ID,
    agentName: AGENT_NAME,
    taskType: 'ad_copy',
    title: `Ad Copy — ${brief.slice(0, 50)}`,
    brief,
    platform: platform ?? 'Meta Ads + Google Ads',
    target: 'UAE audience',
  });

  const content = generateAdCopy(brief);
  const { issues } = reviewBrandSafety(content);

  const draft = createMarketingDraft({
    taskId: task.id,
    type: 'ad_copy',
    title: task.title,
    content,
    agentName: AGENT_NAME,
    platform: platform ?? 'Meta Ads + Google Ads',
    issues,
  });

  return { task, draft };
}
