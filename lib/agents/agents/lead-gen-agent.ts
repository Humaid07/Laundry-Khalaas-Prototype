import type { MarketingDraft, MarketingTask } from '../types';
import { createMarketingTask, createMarketingDraft } from '../tools/marketing-tools';

const AGENT_NAME = 'Lead Generation Agent';
const AGENT_ID = 'lead-gen-agent';

function generateLeadNote(brief: string): string {
  const lc = brief.toLowerCase();
  const isHotel = lc.includes('hotel') || lc.includes('resort');
  const isRestaurant = lc.includes('restaurant') || lc.includes('cafe');
  const isGym = lc.includes('gym') || lc.includes('spa') || lc.includes('fitness');

  const vertical = isHotel ? 'Hotel/Hospitality' : isRestaurant ? 'F&B' : isGym ? 'Fitness/Wellness' : 'Corporate';

  return `# Lead Qualification Note\n\n**Vertical:** ${vertical}\n**Brief:** ${brief}\n\n## Qualification Score: 7/10\n\n### Qualifying Signals\n${isHotel ? '✅ Hotel/hospitality vertical — high linen volume, regular cadence\n✅ Likely weekly recurring contract potential\n✅ Enterprise billing via invoice' : isRestaurant ? '✅ F&B vertical — tablecloths, napkins, staff uniforms\n✅ High frequency, predictable volume\n✅ Price-sensitive but volume justifies discount' : isGym ? '✅ Wellness vertical — towels, uniforms, mat covers\n✅ Daily volume with consistent schedule\n✅ Brand-conscious — quality matters' : '✅ Corporate vertical — uniforms, formal wear\n✅ Employee-count scales volume\n✅ Potential for multi-location account'}\n\n### Recommended Follow-Up Sequence\n\n**Step 1 (Immediate):** Send WhatsApp introduction\n> "Hi [Name], thanks for reaching out to LaundryKhalas. We specialize in commercial laundry for ${vertical.toLowerCase()} businesses across UAE. Could you share your weekly laundry volume (approximate kg or items) and how many pickup locations you'd need?"\n\n**Step 2 (Day 2 if no reply):**\n> "Following up on my earlier message. We currently serve [similar businesses] in your area. I'd love to send you our B2B pricing sheet — takes 2 minutes to review. Would that be useful?"\n\n**Step 3 (Day 4 — final):**\n> "Last follow-up from LaundryKhalas. We have a free trial week offer for new B2B clients — no commitment. Happy to arrange a pickup this week so your team can experience the service first-hand. Let me know!"\n\n### Handoff Notes for Sales Team\n- Confirm: weekly volume, number of locations, preferred pickup days\n- Offer: 2-week trial at 20% below standard B2B rate\n- Flag: if volume > 500 kg/week → escalate to senior account manager\n- CRM: tag as b2b_lead_warm`;
}

export function runLeadGenAgent(brief: string): { task: MarketingTask; draft: MarketingDraft } {
  const task = createMarketingTask({
    agentId: AGENT_ID,
    agentName: AGENT_NAME,
    taskType: 'lead_qualification',
    title: `Lead Note — ${brief.slice(0, 50)}`,
    brief,
    target: 'B2B Sales',
  });

  const content = generateLeadNote(brief);
  const draft = createMarketingDraft({
    taskId: task.id,
    type: 'lead_note',
    title: task.title,
    content,
    agentName: AGENT_NAME,
  });

  return { task, draft };
}
