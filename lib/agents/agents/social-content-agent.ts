import type { MarketingDraft, MarketingTask } from '../types';
import { createMarketingTask, createMarketingDraft, reviewBrandSafety } from '../tools/marketing-tools';

const AGENT_NAME = 'Social Media Agent';
const AGENT_ID = 'social-content-agent';

interface SocialBrief {
  topic: string;
  platform?: string;
  tone?: string;
  offer?: string;
  serviceHighlight?: string;
}

function generateCaption(brief: SocialBrief): string {
  const { topic, platform, offer, serviceHighlight } = brief;
  const lc = topic.toLowerCase();

  if (lc.includes('eid') || lc.includes('holiday')) {
    return `✨ Eid Mubarak from LaundryKhalas!\n\nThis Eid, look your best — from fresh kanduras to perfectly pressed abayas, we handle it all.\n\n🎁 *Special Eid Offer:* ${offer ?? 'AED 50 off on orders above AED 200'}\n\n📲 Book via WhatsApp in under 2 minutes.\n\n#EidMubarak #LaundryDubai #LaundryKhalas #UAE #DubaiLifestyle #DryCleaningDubai`;
  }

  if (lc.includes('hotel') || lc.includes('b2b') || lc.includes('business')) {
    return `🏨 Running a hotel, restaurant, or spa in the UAE?\n\nYour linen is your guest's first impression.\n\nLaundryKhalas provides dedicated B2B laundry services with:\n✅ Custom SLA agreements\n✅ Scheduled weekly pickups\n✅ White-glove quality control\n✅ Flexible invoicing\n\n📩 DM us or send a WhatsApp to discuss a tailored package.\n\n#HotelLinen #HospitalityUAE #LaundryService #B2BDubai #LaundryKhalas`;
  }

  if (lc.includes('summer') || lc.includes('heat') || lc.includes('season')) {
    return `☀️ Dubai summer means more laundry. Let us handle it.\n\nWash & Fold from *AED 8/kg* — picked up from your door, delivered back fresh.\n\n• Everyday clothing\n• Bedsheets & towels\n• Gym wear & abayas\n\n📲 Book in 2 minutes on WhatsApp. Same-day slots available.\n\n#DubaiSummer #LaundryPickup #LaundryKhalas #DubaiLifestyle #UAE`;
  }

  if (lc.includes('dry clean') || lc.includes('suit') || lc.includes('kandura')) {
    return `👔 Your kandura deserves the best care.\n\nLaundryKhalas Dry Cleaning:\n✅ European-grade solvents\n✅ Hand-finished pressing\n✅ 24–48 hr turnaround\n✅ Free pickup & delivery\n\nFrom *AED 15/item.*\n\n📲 Book on WhatsApp — we come to you.\n\n#KanduraCleaning #DryCleaning #DubaiStyle #LaundryKhalas #UAE`;
  }

  return `🧺 Fresh laundry, delivered.\n\nLaundryKhalas makes laundry effortless across Dubai, Abu Dhabi, and Sharjah.\n\n${serviceHighlight ?? '• Wash & Fold from AED 8/kg\n• Dry Cleaning from AED 15/item\n• Pickup & delivery included'}\n\n📲 Book via WhatsApp — slots available today.\n\n#LaundryKhalas #LaundryDubai #UAE #DubaiLifestyle #CleanLiving`;
}

export function runSocialContentAgent(brief: string, platform?: string): {
  task: MarketingTask;
  draft: MarketingDraft;
} {
  const task = createMarketingTask({
    agentId: AGENT_ID,
    agentName: AGENT_NAME,
    taskType: 'social_post',
    title: `Social Post — ${brief.slice(0, 50)}`,
    brief,
    platform: platform ?? 'Instagram',
    target: 'UAE audience',
  });

  const caption = generateCaption({ topic: brief, platform });
  const { score, issues } = reviewBrandSafety(caption);

  const draft = createMarketingDraft({
    taskId: task.id,
    type: 'social_post',
    title: task.title,
    content: caption,
    agentName: AGENT_NAME,
    platform: platform ?? 'Instagram',
    issues,
  });

  return { task, draft };
}
