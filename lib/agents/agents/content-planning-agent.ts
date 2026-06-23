import type { MarketingDraft, MarketingTask, CalendarSlot } from '../types';
import { createMarketingTask, createMarketingDraft } from '../tools/marketing-tools';

const AGENT_NAME = 'Content Planning Agent';
const AGENT_ID = 'content-planning-agent';

export function runContentPlanningAgent(brief: string): {
  task: MarketingTask;
  draft: MarketingDraft;
  calendarSlots: CalendarSlot[];
} {
  const task = createMarketingTask({
    agentId: AGENT_ID,
    agentName: AGENT_NAME,
    taskType: 'content_calendar',
    title: `Content Calendar — ${new Date().toLocaleDateString('en-AE', { month: 'long', year: 'numeric' })}`,
    brief,
    platform: 'Multi-platform',
    target: 'UAE residential + B2B',
  });

  const calendarSlots: CalendarSlot[] = [
    { id: 's1', date: '2026-06-23', dayLabel: 'Mon', platform: 'instagram', contentType: 'Post', title: 'Morning freshness — Wash & Fold feature', status: 'review', draftId: undefined },
    { id: 's2', date: '2026-06-23', dayLabel: 'Mon', platform: 'whatsapp', contentType: 'Broadcast', title: 'Monday offer: Free pickup on orders over AED 100', status: 'review' },
    { id: 's3', date: '2026-06-24', dayLabel: 'Tue', platform: 'instagram', contentType: 'Reel', title: 'Behind the scenes: How we handle dry cleaning', status: 'pending' },
    { id: 's4', date: '2026-06-24', dayLabel: 'Tue', platform: 'blog', contentType: 'Article', title: 'Best laundry tips for Dubai summer heat', status: 'pending' },
    { id: 's5', date: '2026-06-25', dayLabel: 'Wed', platform: 'facebook', contentType: 'Post', title: 'Customer spotlight: Hotel linen excellence', status: 'review' },
    { id: 's6', date: '2026-06-25', dayLabel: 'Wed', platform: 'google_ads', contentType: 'Ad', title: 'Dry cleaning Dubai — Search campaign', status: 'review' },
    { id: 's7', date: '2026-06-26', dayLabel: 'Thu', platform: 'instagram', contentType: 'Story', title: 'Facility tour — Dubai Marina Hub', status: 'pending' },
    { id: 's8', date: '2026-06-26', dayLabel: 'Thu', platform: 'whatsapp', contentType: 'Broadcast', title: 'Thursday pickup reminder — book before noon', status: 'pending' },
    { id: 's9', date: '2026-06-27', dayLabel: 'Fri', platform: 'instagram', contentType: 'Carousel', title: 'Service guide: What we clean and how', status: 'pending' },
    { id: 's10', date: '2026-06-27', dayLabel: 'Fri', platform: 'facebook', contentType: 'Ad', title: 'Weekend B2B offer targeting hotels/restaurants', status: 'pending' },
    { id: 's11', date: '2026-06-28', dayLabel: 'Sat', platform: 'instagram', contentType: 'Post', title: 'Weekend refresh — Blankets & Duvet campaign', status: 'pending' },
    { id: 's12', date: '2026-06-28', dayLabel: 'Sat', platform: 'tiktok', contentType: 'Video', title: 'Satisfying laundry fold video — viral format', status: 'pending' },
    { id: 's13', date: '2026-06-29', dayLabel: 'Sun', platform: 'instagram', contentType: 'Post', title: 'Week recap — orders, reviews, milestones', status: 'pending' },
    { id: 's14', date: '2026-06-29', dayLabel: 'Sun', platform: 'blog', contentType: 'Article', title: 'How hotel laundry services work in Dubai', status: 'pending' },
  ];

  const calendarContent = `# Weekly Content Calendar — Jun 23–29, 2026\n\n` +
    calendarSlots.map(s =>
      `**${s.dayLabel} ${s.date}** | ${s.platform.toUpperCase()} | ${s.contentType}\n${s.title}`
    ).join('\n\n') +
    `\n\n---\n**Campaign Theme:** Summer Freshness · UAE Heat\n` +
    `**Priority Platforms:** Instagram, WhatsApp Broadcast, Google Ads\n` +
    `**Key Message:** Professional laundry service, delivered to your door.\n` +
    `**B2B Focus Days:** Wednesday, Friday`;

  const draft = createMarketingDraft({
    taskId: task.id,
    type: 'content_calendar',
    title: task.title,
    content: calendarContent,
    agentName: AGENT_NAME,
    platform: 'Multi-platform',
  });

  return { task, draft, calendarSlots };
}
