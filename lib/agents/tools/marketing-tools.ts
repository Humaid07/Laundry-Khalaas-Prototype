import type { MarketingDraft, MarketingDraftType, MarketingTask } from '../types';

export function createMarketingTask(params: {
  agentId: string;
  agentName: string;
  taskType: string;
  title: string;
  brief: string;
  platform?: string;
  target?: string;
}): MarketingTask {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    ...params,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

export function createMarketingDraft(params: {
  taskId: string;
  type: MarketingDraftType;
  title: string;
  content: string;
  agentName: string;
  platform?: string;
  issues?: string[];
}): MarketingDraft {
  const issues = params.issues ?? [];
  const brandSafetyScore = Math.max(60, 100 - issues.length * 8 - Math.floor(Math.random() * 5));

  return {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    taskId: params.taskId,
    type: params.type,
    title: params.title,
    content: params.content,
    brandSafetyScore,
    issues,
    status: 'review',
    agentName: params.agentName,
    platform: params.platform,
    createdAt: new Date().toISOString(),
  };
}

export function reviewBrandSafety(content: string): { score: number; issues: string[] } {
  const issues: string[] = [];
  const lc = content.toLowerCase();

  if (lc.includes('guaranteed') || lc.includes('100%')) {
    issues.push('Avoid absolute guarantees — use "we aim" or "typically"');
  }
  if (lc.includes('free') && !lc.includes('free pickup')) {
    issues.push('"Free" claim detected — verify it is approved and accurate');
  }
  if (lc.includes('best in dubai') || lc.includes('number 1') || lc.includes('#1')) {
    issues.push('Superlative claims require substantiation');
  }
  if (lc.includes('24/7') && !lc.includes('booking')) {
    issues.push('24/7 availability claim — verify against actual operating hours');
  }
  if (content.length > 2200) {
    issues.push('Caption may be too long for optimal platform reach');
  }

  const score = Math.max(55, 100 - issues.length * 10);
  return { score, issues };
}
