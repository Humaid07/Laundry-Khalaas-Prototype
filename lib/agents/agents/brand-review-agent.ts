import type { MarketingDraft, MarketingTask } from '../types';
import { createMarketingTask, createMarketingDraft, reviewBrandSafety } from '../tools/marketing-tools';

const AGENT_NAME = 'Brand Review Agent';
const AGENT_ID = 'brand-review-agent';

interface ReviewResult {
  passed: boolean;
  score: number;
  issues: string[];
  notes: string;
  recommendation: 'approve' | 'revise' | 'reject';
}

function fullBrandReview(content: string): ReviewResult {
  const { score, issues } = reviewBrandSafety(content);
  const lc = content.toLowerCase();
  const additionalIssues = [...issues];

  if (!lc.includes('laundrykhalas') && !lc.includes('laundry khalas') && content.length > 100) {
    additionalIssues.push('Brand name not mentioned — ensure brand attribution is clear');
  }
  if (lc.includes('contact us') && !lc.includes('whatsapp') && !lc.includes('+971')) {
    additionalIssues.push('CTA lacks specific contact method — add WhatsApp link or number');
  }
  if ((content.match(/aed\s*\d+/gi) ?? []).length > 0 && !lc.includes('from') && !lc.includes('starting')) {
    additionalIssues.push('Price stated without "from" qualifier — add "from" to avoid rigid price commitment');
  }

  const finalScore = Math.max(50, score - (additionalIssues.length - issues.length) * 8);
  const recommendation: ReviewResult['recommendation'] =
    finalScore >= 80 ? 'approve' : finalScore >= 60 ? 'revise' : 'reject';

  return {
    passed: finalScore >= 80,
    score: finalScore,
    issues: additionalIssues,
    recommendation,
    notes:
      recommendation === 'approve'
        ? 'Content meets brand standards. Approved for publishing.'
        : recommendation === 'revise'
        ? `${additionalIssues.length} issue(s) found. Please revise before publishing.`
        : 'Content does not meet brand standards. Please rewrite.',
  };
}

export function runBrandReviewAgent(contentToReview: string, contentTitle: string): {
  task: MarketingTask;
  draft: MarketingDraft;
  review: ReviewResult;
} {
  const review = fullBrandReview(contentToReview);

  const reportContent =
    `# Brand Review Report\n\n` +
    `**Content:** ${contentTitle}\n` +
    `**Score:** ${review.score}/100\n` +
    `**Recommendation:** ${review.recommendation.toUpperCase()}\n\n` +
    `## Issues Found (${review.issues.length})\n` +
    (review.issues.length > 0
      ? review.issues.map(i => `- ${i}`).join('\n')
      : '_No issues found._') +
    `\n\n## Reviewer Notes\n${review.notes}`;

  const task = createMarketingTask({
    agentId: AGENT_ID,
    agentName: AGENT_NAME,
    taskType: 'brand_review',
    title: `Brand Review: ${contentTitle.slice(0, 50)}`,
    brief: `Review brand safety and compliance of: ${contentTitle}`,
  });

  const draft = createMarketingDraft({
    taskId: task.id,
    type: 'campaign_brief',
    title: task.title,
    content: reportContent,
    agentName: AGENT_NAME,
    issues: review.issues,
  });

  return { task, draft, review };
}
