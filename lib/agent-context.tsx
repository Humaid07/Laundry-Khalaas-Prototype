'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type {
  Conversation, Escalation, AgentRun,
  MarketingTask, MarketingDraft, AgentRegistration, CalendarSlot,
  IntentType, SentimentType,
} from './agents/types';
import { AGENT_REGISTRY } from './agents/registry';
import { classifyIntent } from './agents/intent-classifier';
import { runCustomerOrderAgent } from './agents/agents/customer-order-agent';
import { runEscalationAgent } from './agents/agents/escalation-agent';
import { runContentPlanningAgent } from './agents/agents/content-planning-agent';
import { runSocialContentAgent } from './agents/agents/social-content-agent';
import { runBrandReviewAgent } from './agents/agents/brand-review-agent';
import { runSEOAgent } from './agents/agents/seo-agent';
import { runAdsAgent } from './agents/agents/ads-agent';
import { runLeadGenAgent } from './agents/agents/lead-gen-agent';
import { runMarketingAnalyticsAgent } from './agents/agents/marketing-analytics-agent';
import { buildAgentMessage, buildCustomerMessage, detectSentiment } from './agents/tools/message-tools';
import { buildAgentRun } from './agents/logs/agent-logger';

// ── Seed Data ──────────────────────────────────────────────────────────────

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-001',
    customerId: 'c1',
    customerPhone: '+971 50 XXX 5566',
    customerName: 'Humaid Al Mansoori',
    status: 'resolved',
    intent: 'new_order',
    activeOrderId: 'LK-AE-1024',
    orderDraft: {
      customerName: 'Humaid Al Mansoori',
      customerPhone: '+971 50 XXX 5566',
      address: 'Apt 1204, Marina Heights, Dubai Marina',
      emirate: 'Dubai',
      serviceType: 'Wash & Fold + Dry Cleaning',
      items: '6 shirts, 3 trousers, 1 suit, 1 duvet',
      pickupSlot: 'Today, 6:00 PM – 8:00 PM',
      estimatedAmount: 145,
    },
    missingFields: [],
    lastAgentAction: 'order_confirmed',
    summary: 'Customer booked Wash & Fold and Dry Cleaning. Order LK-AE-1024 confirmed. Ahmed Khan assigned as driver.',
    sentiment: 'positive',
    channel: 'whatsapp',
    messages: [
      { id: 'm1', conversationId: 'conv-001', role: 'customer', content: 'Hi, I need laundry pickup today.', timestamp: '2:28 PM' },
      { id: 'm2', conversationId: 'conv-001', role: 'agent', content: 'Hi Humaid! Welcome to LaundryKhalas 👋 I can help you with a laundry pickup today. Which service do you need?\n\n• Wash & Fold (AED 8/kg)\n• Dry Cleaning (AED 15/item)\n• Ironing & Pressing (AED 7/item)\n• Blankets & Duvets (AED 45/item)', timestamp: '2:28 PM', agentName: 'Customer Order Agent' },
      { id: 'm3', conversationId: 'conv-001', role: 'customer', content: 'Wash and fold plus dry cleaning.', timestamp: '2:29 PM' },
      { id: 'm4', conversationId: 'conv-001', role: 'agent', content: 'Great choice! Please share the item details — what would you like us to collect?', timestamp: '2:29 PM', agentName: 'Customer Order Agent' },
      { id: 'm5', conversationId: 'conv-001', role: 'customer', content: '6 shirts, 3 trousers, 1 suit, and 1 duvet.', timestamp: '2:30 PM' },
      { id: 'm6', conversationId: 'conv-001', role: 'agent', content: 'Got it! Please confirm your pickup address.', timestamp: '2:30 PM', agentName: 'Customer Order Agent' },
      { id: 'm7', conversationId: 'conv-001', role: 'customer', content: 'Marina Heights, Dubai Marina, Apartment 1204.', timestamp: '2:31 PM' },
      { id: 'm8', conversationId: 'conv-001', role: 'agent', content: 'When would you like us to collect? Available slots today:\n• 4:00 PM – 6:00 PM\n• 6:00 PM – 8:00 PM', timestamp: '2:31 PM', agentName: 'Customer Order Agent' },
      { id: 'm9', conversationId: 'conv-001', role: 'customer', content: '6pm to 8pm please.', timestamp: '2:32 PM' },
      { id: 'm10', conversationId: 'conv-001', role: 'agent', content: '✅ Order Confirmed!\n\nOrder ID: LK-AE-1024\nService: Wash & Fold + Dry Cleaning\nItems: 6 shirts, 3 trousers, 1 suit, 1 duvet\nPickup: Apt 1204, Marina Heights, Dubai Marina\nSlot: Today, 6:00 PM – 8:00 PM\nEstimated: AED 145\n\nDriver Ahmed Khan will be with you shortly.', timestamp: '2:32 PM', agentName: 'Customer Order Agent', toolCalls: [
        { name: 'create_order_draft', input: { serviceType: 'Wash & Fold + Dry Cleaning' }, output: { orderId: 'LK-AE-1024', estimatedAmount: 145 }, durationMs: 18 },
        { name: 'check_facility_availability', input: { emirate: 'Dubai' }, output: { facilityId: 'f1', name: 'Dubai Marina Hub', capacityPct: 87 }, durationMs: 22 },
        { name: 'assign_driver', input: { driverId: 'd1', orderId: 'LK-AE-1024' }, output: { assigned: true, driverName: 'Ahmed Khan' }, durationMs: 12 },
      ] },
    ],
    createdAt: '2024-01-15T14:28:00',
    updatedAt: '2024-01-15T14:33:00',
  },
  {
    id: 'conv-002',
    customerId: 'c3',
    customerPhone: '+971 52 XXX 1122',
    customerName: 'Omar Al Mansouri',
    status: 'resolved',
    intent: 'order_status',
    activeOrderId: 'LK-AE-1023',
    orderDraft: {},
    missingFields: [],
    lastAgentAction: 'status_provided',
    summary: 'Customer asked for status of order LK-AE-1023. Out for delivery — driver Fatima Noor en route.',
    sentiment: 'neutral',
    channel: 'whatsapp',
    messages: [
      { id: 'm1', conversationId: 'conv-002', role: 'customer', content: 'Hi, can you check my order status? LK-AE-1023', timestamp: '1:48 PM' },
      { id: 'm2', conversationId: 'conv-002', role: 'agent', content: '📦 Order LK-AE-1023\n\nStatus: Driver Fatima Noor is delivering your order now.\nFacility: Dubai Marina Facility\nDelivery ETA: Today by 2:00 PM\n\nYour order is on its way!', timestamp: '1:48 PM', agentName: 'Customer Order Agent', toolCalls: [
        { name: 'get_order_status', input: { orderId: 'LK-AE-1023' }, output: { found: true, status: 'out_for_delivery', driverName: 'Fatima Noor' }, durationMs: 8 },
      ] },
      { id: 'm3', conversationId: 'conv-002', role: 'customer', content: 'Thank you!', timestamp: '1:49 PM' },
      { id: 'm4', conversationId: 'conv-002', role: 'agent', content: 'You\'re welcome, Omar! Have a great day. 😊', timestamp: '1:49 PM', agentName: 'Customer Order Agent' },
    ],
    createdAt: '2024-01-15T13:48:00',
    updatedAt: '2024-01-15T13:49:00',
  },
  {
    id: 'conv-003',
    customerPhone: '+971 52 XXX 3310',
    customerName: 'Omar Farhan',
    status: 'escalated',
    intent: 'complaint',
    activeOrderId: 'LK-AE-1020',
    escalationId: 'esc-001',
    orderDraft: {},
    missingFields: [],
    lastAgentAction: 'escalation_created',
    summary: 'Customer very unhappy about delivery delay. Order LK-AE-1020 overdue by 3+ hours. Escalated to human team.',
    sentiment: 'negative',
    channel: 'whatsapp',
    messages: [
      { id: 'm1', conversationId: 'conv-003', role: 'customer', content: 'My order LK-AE-1020 was supposed to arrive 3 hours ago. This is unacceptable!', timestamp: '1:15 PM' },
      { id: 'm2', conversationId: 'conv-003', role: 'agent', content: 'We sincerely apologize for the inconvenience you have experienced. A member of our team will review your case and contact you personally within the next 30 minutes. We take every complaint seriously and will make this right.', timestamp: '1:15 PM', agentName: 'Human Escalation Agent', toolCalls: [
        { name: 'create_escalation', input: { conversationId: 'conv-003', intent: 'complaint' }, output: { created: true, escalationId: 'esc-001', priority: 'high' }, durationMs: 18 },
      ] },
    ],
    createdAt: '2024-01-15T13:15:00',
    updatedAt: '2024-01-15T13:15:00',
  },
  {
    id: 'conv-004',
    customerPhone: '+971 56 XXX 7821',
    customerName: 'Nadia Farhat',
    status: 'waiting_human',
    intent: 'refund_request',
    activeOrderId: 'LK-AE-1015',
    escalationId: 'esc-002',
    orderDraft: {},
    missingFields: [],
    lastAgentAction: 'escalation_created',
    summary: 'Customer requesting refund of AED 85 — driver missed 3-hour pickup window with no notification.',
    sentiment: 'negative',
    channel: 'whatsapp',
    messages: [
      { id: 'm1', conversationId: 'conv-004', role: 'customer', content: 'Your driver never showed up for my pickup. I waited 3 hours. I want a refund.', timestamp: '2 hrs ago' },
      { id: 'm2', conversationId: 'conv-004', role: 'agent', content: 'Thank you for bringing this to our attention. Your refund request has been received and escalated to our customer support team. You will hear back within 2 hours with a resolution.', timestamp: '2 hrs ago', agentName: 'Human Escalation Agent', toolCalls: [
        { name: 'create_escalation', input: { conversationId: 'conv-004', intent: 'refund_request' }, output: { created: true, escalationId: 'esc-002', priority: 'high' }, durationMs: 15 },
      ] },
    ],
    createdAt: '2024-01-15T11:00:00',
    updatedAt: '2024-01-15T11:01:00',
  },
  {
    id: 'conv-005',
    customerId: 'b1',
    customerPhone: '+971 4 XXX 5500',
    customerName: 'Jumeirah Grand Hotel',
    status: 'resolved',
    intent: 'new_order',
    activeOrderId: 'LK-AE-1026',
    orderDraft: {
      customerName: 'Jumeirah Grand Hotel',
      serviceType: 'Business Laundry',
      address: 'Jumeirah Grand Hotel, Jumeirah Beach Road',
      emirate: 'Dubai',
      pickupSlot: 'Today, 7:00 AM – 9:00 AM',
      items: '120 bed linen sets, 200 bath towels, 80 table cloths',
      estimatedAmount: 2800,
    },
    missingFields: [],
    lastAgentAction: 'order_confirmed',
    summary: 'Weekly B2B pickup confirmed. 400 items. Order LK-AE-1026. Premium fragrance requested.',
    sentiment: 'positive',
    channel: 'whatsapp',
    messages: [
      { id: 'm1', conversationId: 'conv-005', role: 'customer', content: 'Good morning, this is the Jumeirah Grand Hotel. Weekly pickup as usual today.', timestamp: '6:55 AM' },
      { id: 'm2', conversationId: 'conv-005', role: 'agent', content: 'Good morning! Weekly pickup confirmed for Jumeirah Grand Hotel. Today 7:00 AM – 9:00 AM. Order LK-AE-1026 created. Reminder: premium fragrance on all linen per standing instruction. Driver will be with your team shortly.', timestamp: '6:55 AM', agentName: 'Customer Order Agent' },
      { id: 'm3', conversationId: 'conv-005', role: 'customer', content: 'Perfect, thank you.', timestamp: '6:56 AM' },
    ],
    createdAt: '2024-01-15T06:55:00',
    updatedAt: '2024-01-15T06:56:00',
  },
  {
    id: 'conv-006',
    customerPhone: '+971 55 XXX 9912',
    customerName: 'Priya Kumar',
    status: 'active',
    intent: 'pricing_inquiry',
    orderDraft: {},
    missingFields: [],
    lastAgentAction: 'pricing_provided',
    summary: 'Customer asking about dry cleaning prices for upcoming event.',
    sentiment: 'neutral',
    channel: 'whatsapp',
    messages: [
      { id: 'm1', conversationId: 'conv-006', role: 'customer', content: 'Hi, how much does dry cleaning cost? I have a formal gown and 2 suits.', timestamp: '9:05 AM' },
      { id: 'm2', conversationId: 'conv-006', role: 'agent', content: 'Hi! Our dry cleaning prices:\n\n• Gown / formal dress: AED 35–55\n• Suit (2-piece): AED 30\n• Suit (3-piece): AED 40\n\nAll include free pickup and delivery. Turnaround is 24–48 hours. Would you like to book a pickup?', timestamp: '9:05 AM', agentName: 'Customer Order Agent' },
      { id: 'm3', conversationId: 'conv-006', role: 'customer', content: 'Yes please, can I book for tomorrow morning?', timestamp: '9:08 AM' },
      { id: 'm4', conversationId: 'conv-006', role: 'agent', content: 'Of course! Please share your pickup address and I\'ll confirm the slot.', timestamp: '9:08 AM', agentName: 'Customer Order Agent' },
    ],
    createdAt: '2024-01-15T09:05:00',
    updatedAt: '2024-01-15T09:08:00',
  },
];

const SEED_ESCALATIONS: Escalation[] = [
  {
    id: 'esc-001',
    conversationId: 'conv-003',
    orderId: 'LK-AE-1020',
    customerName: 'Omar Farhan',
    customerPhone: '+971 52 XXX 3310',
    reason: 'Customer expressed significant dissatisfaction about delivery delay',
    summary: 'Order LK-AE-1020 is overdue by 3+ hours with no update to the customer. Customer messaged expressing strong frustration.',
    recommendedAction: 'Call customer directly within 10 minutes. Apologize, provide updated ETA, and offer 20% discount on next order as goodwill. Check with driver on current location.',
    priority: 'high',
    status: 'open',
    createdAt: '2024-01-15T13:15:00',
  },
  {
    id: 'esc-002',
    conversationId: 'conv-004',
    orderId: 'LK-AE-1015',
    customerName: 'Nadia Farhat',
    customerPhone: '+971 56 XXX 7821',
    reason: 'Customer requesting refund — driver no-show for confirmed pickup slot',
    summary: 'Driver did not show up for a confirmed 3-hour pickup window. Customer waited and received no notification or update. Requesting AED 85 refund.',
    recommendedAction: 'Verify driver dispatch record for LK-AE-1015. If no-show confirmed, issue full refund within 2 hours via original payment method. Send personal apology and offer next pickup free of charge.',
    priority: 'high',
    status: 'open',
    createdAt: '2024-01-15T11:01:00',
  },
  {
    id: 'esc-003',
    conversationId: 'conv-003',
    orderId: 'LK-AE-1026',
    customerName: 'Marriott Downtown',
    customerPhone: '+971 4 XXX 8899',
    reason: 'Rush SLA request — 500 items same-day, non-standard turnaround',
    summary: 'B2B client Marriott Downtown is requesting same-day turnaround on 500 items. This exceeds standard SLA and requires facility capacity approval and additional pricing.',
    recommendedAction: 'Contact Jebel Ali Commercial facility manager to confirm capacity. Check if Dubai Marina Hub can take overflow. Quote rush surcharge of 30% and confirm with client before accepting.',
    priority: 'medium',
    status: 'assigned',
    assignedTo: 'Sara Al Blooshi',
    createdAt: '2024-01-15T10:00:00',
  },
];

const SEED_AGENT_RUNS: AgentRun[] = [
  { id: 'run-001', agentName: 'Customer Order Agent', conversationId: 'conv-001', inputSummary: '"Hi, I need laundry pickup today."', intentDetected: 'new_order', toolsUsed: ['create_order_draft', 'check_facility_availability', 'assign_driver'], outputSummary: 'Order LK-AE-1024 confirmed — Wash & Fold + Dry Cleaning, AED 145', durationMs: 312, status: 'success', createdAt: '2024-01-15T14:32:00' },
  { id: 'run-002', agentName: 'Intent Classifier', conversationId: 'conv-002', inputSummary: '"Hi, can you check my order status? LK-AE-1023"', intentDetected: 'order_status', toolsUsed: [], outputSummary: 'Intent: order_status, confidence: high', durationMs: 42, status: 'success', createdAt: '2024-01-15T13:48:00' },
  { id: 'run-003', agentName: 'Customer Order Agent', conversationId: 'conv-002', inputSummary: '"Hi, can you check my order status? LK-AE-1023"', intentDetected: 'order_status', toolsUsed: ['get_order_status'], outputSummary: 'Status provided: LK-AE-1023 out for delivery, Fatima Noor assigned', durationMs: 89, status: 'success', createdAt: '2024-01-15T13:48:00' },
  { id: 'run-004', agentName: 'Intent Classifier', conversationId: 'conv-003', inputSummary: '"My order was supposed to arrive 3 hours ago. This is unacceptable!"', intentDetected: 'complaint', toolsUsed: [], outputSummary: 'Intent: complaint, confidence: high, sentiment: negative', durationMs: 38, status: 'escalated', createdAt: '2024-01-15T13:15:00' },
  { id: 'run-005', agentName: 'Human Escalation Agent', conversationId: 'conv-003', inputSummary: '"My order was supposed to arrive 3 hours ago. This is unacceptable!"', intentDetected: 'complaint', toolsUsed: ['create_escalation'], outputSummary: 'Escalation esc-001 created — priority: high. Customer notified.', durationMs: 156, status: 'escalated', createdAt: '2024-01-15T13:15:00' },
  { id: 'run-006', agentName: 'Operations Orchestrator', conversationId: 'conv-001', inputSummary: 'Order LK-AE-1024 needs driver assignment — Dubai Marina', intentDetected: 'new_order', toolsUsed: ['check_driver_availability', 'check_facility_availability', 'assign_driver'], outputSummary: 'Ahmed Khan assigned. Dubai Marina Hub confirmed (87% capacity).', durationMs: 201, status: 'success', createdAt: '2024-01-15T14:33:00' },
  { id: 'run-007', agentName: 'Intent Classifier', conversationId: 'conv-004', inputSummary: '"Your driver never showed up. I waited 3 hours. I want a refund."', intentDetected: 'refund_request', toolsUsed: [], outputSummary: 'Intent: refund_request, confidence: high, sentiment: negative', durationMs: 41, status: 'escalated', createdAt: '2024-01-15T11:00:00' },
  { id: 'run-008', agentName: 'Human Escalation Agent', conversationId: 'conv-004', inputSummary: '"Your driver never showed up. I want a refund."', intentDetected: 'refund_request', toolsUsed: ['create_escalation'], outputSummary: 'Escalation esc-002 created — refund request AED 85, priority: high.', durationMs: 142, status: 'escalated', createdAt: '2024-01-15T11:01:00' },
  { id: 'run-009', agentName: 'Customer Order Agent', conversationId: 'conv-005', inputSummary: '"Good morning, this is Jumeirah Grand Hotel. Weekly pickup as usual."', intentDetected: 'new_order', toolsUsed: ['create_order_draft', 'assign_driver'], outputSummary: 'Weekly B2B pickup confirmed. Order LK-AE-1026. AED 2,800.', durationMs: 228, status: 'success', createdAt: '2024-01-15T06:55:00' },
  { id: 'run-010', agentName: 'Content Planning Agent', inputSummary: 'Generate June 2026 content calendar', toolsUsed: ['create_marketing_task', 'create_content_calendar'], outputSummary: '14-slot weekly content calendar created across 5 platforms.', durationMs: 892, status: 'success', createdAt: '2024-01-15T08:00:00' },
  { id: 'run-011', agentName: 'Social Media Agent', inputSummary: 'Generate Eid offer Instagram post', toolsUsed: ['create_social_post_draft', 'review_brand_safety'], outputSummary: 'Instagram caption created — brand safety score: 88/100.', durationMs: 740, status: 'success', createdAt: '2024-01-15T08:30:00' },
  { id: 'run-012', agentName: 'Brand Review Agent', inputSummary: 'Review Eid offer Instagram post draft', toolsUsed: ['review_brand_safety'], outputSummary: 'Score: 88/100. 1 minor issue flagged. Recommendation: Approve.', durationMs: 398, status: 'success', createdAt: '2024-01-15T08:45:00' },
];

const SEED_MARKETING_TASKS: MarketingTask[] = [
  { id: 'mtask-001', agentId: 'content-planning-agent', agentName: 'Content Planning Agent', taskType: 'content_calendar', title: 'Content Calendar — June 2026', status: 'review', brief: 'Generate weekly content calendar for June 2026', platform: 'Multi-platform', draftId: 'mdraft-001', createdAt: '2024-01-15T08:00:00' },
  { id: 'mtask-002', agentId: 'social-content-agent', agentName: 'Social Media Agent', taskType: 'social_post', title: 'Eid Offer — Instagram Post', status: 'review', brief: 'Eid special offer post for Instagram', platform: 'Instagram', draftId: 'mdraft-002', createdAt: '2024-01-15T08:30:00' },
  { id: 'mtask-003', agentId: 'brand-review-agent', agentName: 'Brand Review Agent', taskType: 'brand_review', title: 'Brand Review: Eid Post', status: 'approved', brief: 'Review the Eid offer Instagram post', draftId: 'mdraft-003', createdAt: '2024-01-15T08:45:00' },
  { id: 'mtask-004', agentId: 'seo-agent', agentName: 'SEO & Blog Agent', taskType: 'seo_brief', title: 'SEO Brief — Dry Cleaning Dubai', status: 'review', brief: 'dry cleaning dubai — blog article and landing page', platform: 'Blog / Website', draftId: 'mdraft-004', createdAt: '2024-01-14T15:00:00' },
  { id: 'mtask-005', agentId: 'ads-agent', agentName: 'Paid Ads Agent', taskType: 'ad_copy', title: 'Ramadan Campaign — Ad Variants', status: 'approved', brief: 'Ramadan campaign ad copy for Meta and Google', platform: 'Meta + Google', draftId: 'mdraft-005', createdAt: '2024-01-14T12:00:00' },
  { id: 'mtask-006', agentId: 'lead-gen-agent', agentName: 'Lead Generation Agent', taskType: 'lead_qualification', title: 'Lead Note — Palm Fitness Center', status: 'review', brief: 'Gym/spa lead inquiry from Palm Fitness Center', draftId: 'mdraft-006', createdAt: '2024-01-15T10:00:00' },
  { id: 'mtask-007', agentId: 'marketing-analytics-agent', agentName: 'Marketing Analytics Agent', taskType: 'analytics_report', title: 'Marketing Report — Week of Jun 16–22', status: 'approved', brief: 'Weekly marketing performance report', draftId: 'mdraft-007', createdAt: '2024-01-13T08:00:00' },
];

const SEED_MARKETING_DRAFTS: MarketingDraft[] = [
  {
    id: 'mdraft-001', taskId: 'mtask-001', type: 'content_calendar', title: 'Content Calendar — June 2026', agentName: 'Content Planning Agent', platform: 'Multi-platform', brandSafetyScore: 96, issues: [], status: 'review',
    content: '# Weekly Content Calendar — Jun 23–29, 2026\n\n**Mon Jun 23** | INSTAGRAM | Post\nMorning freshness — Wash & Fold feature\n\n**Mon Jun 23** | WHATSAPP | Broadcast\nMonday offer: Free pickup on orders over AED 100\n\n**Tue Jun 24** | INSTAGRAM | Reel\nBehind the scenes: How we handle dry cleaning\n\n**Tue Jun 24** | BLOG | Article\nBest laundry tips for Dubai summer heat\n\n**Wed Jun 25** | FACEBOOK | Post\nCustomer spotlight: Hotel linen excellence\n\n**Wed Jun 25** | GOOGLE ADS | Ad\nDry cleaning Dubai — Search campaign\n\n**Thu Jun 26** | INSTAGRAM | Story\nFacility tour — Dubai Marina Hub\n\n**Fri Jun 27** | INSTAGRAM | Carousel\nService guide: What we clean and how\n\n**Sat Jun 28** | TIKTOK | Video\nSatisfying laundry fold video — viral format\n\n**Sun Jun 29** | BLOG | Article\nHow hotel laundry services work in Dubai\n\n---\n**Campaign Theme:** Summer Freshness · UAE Heat\n**Priority Platforms:** Instagram, WhatsApp Broadcast, Google Ads',
    createdAt: '2024-01-15T08:00:00',
  },
  {
    id: 'mdraft-002', taskId: 'mtask-002', type: 'social_post', title: 'Eid Offer — Instagram Post', agentName: 'Social Media Agent', platform: 'Instagram', brandSafetyScore: 88, issues: ['Add "from" qualifier to AED 15/item price claim'], status: 'review',
    content: '✨ Eid Mubarak from LaundryKhalas!\n\nThis Eid, look your best — from fresh kanduras to perfectly pressed abayas, we handle it all.\n\n🎁 Special Eid Offer: AED 50 off on orders above AED 200\n\n📲 Book via WhatsApp in under 2 minutes.\n\n#EidMubarak #LaundryDubai #LaundryKhalas #UAE #DubaiLifestyle #DryCleaningDubai',
    createdAt: '2024-01-15T08:30:00',
  },
  {
    id: 'mdraft-003', taskId: 'mtask-003', type: 'campaign_brief', title: 'Brand Review: Eid Post', agentName: 'Brand Review Agent', brandSafetyScore: 88, issues: ['Add "from" qualifier to price'], status: 'approved', approvedBy: 'Sara Al Blooshi',
    content: '# Brand Review Report\n\n**Content:** Eid Offer Instagram Post\n**Score:** 88/100\n**Recommendation:** APPROVE\n\n## Issues Found (1)\n- Add "from" qualifier to AED 15/item price claim\n\n## Reviewer Notes\nContent meets brand standards with minor price wording adjustment. Approved for publishing.',
    createdAt: '2024-01-15T08:45:00',
  },
  {
    id: 'mdraft-004', taskId: 'mtask-004', type: 'blog_brief', title: 'SEO Brief — Dry Cleaning Dubai', agentName: 'SEO & Blog Agent', platform: 'Blog / Website', brandSafetyScore: 94, issues: [], status: 'review',
    content: '# SEO Brief: Dry Cleaning Dubai\n\n**Primary Keyword:** dry cleaning dubai\n**Secondary Keywords:** dry cleaning near me, kandura dry cleaning, suit dry cleaning uae\n**Search Volume:** ~3,200/mo\n**Difficulty:** Medium\n\n## Article Outline\n\n**H1:** Best Dry Cleaning Services in Dubai (2026 Guide)\n**H2:** How Dry Cleaning Works\n**H2:** What Can Be Dry Cleaned? (Kanduras, suits, gowns)\n**H2:** Dry Cleaning Prices in Dubai\n**H2:** How to Book with Pickup\n\n**Meta Title:** Dry Cleaning Dubai — Pickup & Delivery | LaundryKhalas\n**Meta Description:** Professional dry cleaning in Dubai with free pickup and delivery. From AED 15/item. Book in 2 min on WhatsApp.',
    createdAt: '2024-01-14T15:00:00',
  },
  {
    id: 'mdraft-005', taskId: 'mtask-005', type: 'ad_copy', title: 'Ramadan Campaign — Ad Variants', agentName: 'Paid Ads Agent', platform: 'Meta + Google', brandSafetyScore: 91, issues: [], status: 'approved', approvedBy: 'Mohammed Hassan',
    content: '# Ad Copy Variants — Ramadan Campaign\n\n## Variant A (Emotional)\n**Headline 1:** Fresh Kanduras for Eid\n**Headline 2:** Pickup & Delivery in Dubai\n**Headline 3:** From AED 15/Item\n**Description:** Professional dry cleaning with free pickup. Book on WhatsApp in 2 minutes.\n\n## Variant B (Offer-led)\n**Headline 1:** Eid Special — 20% Off Dry Cleaning\n**Headline 2:** LaundryKhalas — UAE Laundry Service\n**Headline 3:** Book via WhatsApp Today\n\n## Recommended A/B Test\nTest A vs B for 7 days. Min AED 150/day.',
    createdAt: '2024-01-14T12:00:00',
  },
  {
    id: 'mdraft-006', taskId: 'mtask-006', type: 'lead_note', title: 'Lead Note — Palm Fitness Center', agentName: 'Lead Generation Agent', brandSafetyScore: 97, issues: [], status: 'review',
    content: '# Lead Qualification Note\n\n**Vertical:** Fitness/Wellness\n**Lead:** Palm Fitness Center, Al Wasl, Dubai\n\n## Qualification Score: 7/10\n\n### Qualifying Signals\n✅ Fitness/wellness vertical — towels, uniforms, mat covers\n✅ Daily volume, predictable schedule\n✅ Brand-conscious — quality matters\n\n### Follow-Up Sequence\n**Step 1:** "Hi, thanks for reaching out. We specialize in commercial laundry for fitness centers. Could you share your weekly towel/uniform volume?"\n**Step 2 (Day 2):** "Following up — I\'d love to send our B2B pricing sheet."\n**Step 3 (Day 4):** "Free trial week offer — no commitment. Let us arrange a pickup this week."\n\n### Handoff Notes\n- Confirm: weekly volume, locations, preferred pickup days\n- Offer: 2-week trial at 20% below standard B2B rate',
    createdAt: '2024-01-15T10:00:00',
  },
  {
    id: 'mdraft-007', taskId: 'mtask-007', type: 'analytics_report', title: 'Marketing Report — Week of Jun 16–22', agentName: 'Marketing Analytics Agent', brandSafetyScore: 99, issues: [], status: 'approved', approvedBy: 'Mohammed Hassan',
    content: '# Marketing Performance Report\n**Period:** Week of Jun 16–22, 2026\n\n## Channel Performance\n| Channel | Reach | Clicks | Conversions |\n|---|---|---|---|\n| Instagram | 12,400 | 890 | 34 orders |\n| WhatsApp | 3,200 | 1,840 | 89 bookings |\n| Google Ads | 8,600 | 420 | 52 orders |\n| Meta Ads | 22,000 | 1,100 | 41 orders |\n\n## Key Metrics\n- Total New Customers: 234\n- Revenue Attributed: AED 82,500\n- Blended CAC: AED 18.4\n- WhatsApp Conversion Rate: 78%\n\n## Top Actions\n1. Increase WhatsApp broadcast frequency to 3x/week\n2. Publish 2 SEO blog posts this week\n3. Pause Google Ads "wash and fold" keyword (CAC too high)',
    createdAt: '2024-01-13T08:00:00',
  },
];

const SEED_CALENDAR: CalendarSlot[] = [
  { id: 'cs1', date: '2026-06-23', dayLabel: 'Mon', platform: 'instagram', contentType: 'Post', title: 'Morning freshness — Wash & Fold feature', status: 'review' },
  { id: 'cs2', date: '2026-06-23', dayLabel: 'Mon', platform: 'whatsapp', contentType: 'Broadcast', title: 'Monday offer: Free pickup on orders AED 100+', status: 'approved' },
  { id: 'cs3', date: '2026-06-24', dayLabel: 'Tue', platform: 'instagram', contentType: 'Reel', title: 'Behind the scenes: dry cleaning process', status: 'pending' },
  { id: 'cs4', date: '2026-06-24', dayLabel: 'Tue', platform: 'blog', contentType: 'Article', title: 'Best laundry tips for Dubai summer heat', status: 'pending' },
  { id: 'cs5', date: '2026-06-25', dayLabel: 'Wed', platform: 'facebook', contentType: 'Post', title: 'Customer spotlight: Hotel linen excellence', status: 'review' },
  { id: 'cs6', date: '2026-06-25', dayLabel: 'Wed', platform: 'google_ads', contentType: 'Ad', title: 'Dry cleaning Dubai — Search campaign', status: 'approved' },
  { id: 'cs7', date: '2026-06-26', dayLabel: 'Thu', platform: 'instagram', contentType: 'Story', title: 'Facility tour — Dubai Marina Hub', status: 'pending' },
  { id: 'cs8', date: '2026-06-26', dayLabel: 'Thu', platform: 'whatsapp', contentType: 'Broadcast', title: 'Thursday pickup reminder — book before noon', status: 'pending' },
  { id: 'cs9', date: '2026-06-27', dayLabel: 'Fri', platform: 'instagram', contentType: 'Carousel', title: 'Service guide: What we clean and how', status: 'pending' },
  { id: 'cs10', date: '2026-06-27', dayLabel: 'Fri', platform: 'facebook', contentType: 'Ad', title: 'Weekend B2B offer — Hotels & restaurants', status: 'pending' },
  { id: 'cs11', date: '2026-06-28', dayLabel: 'Sat', platform: 'instagram', contentType: 'Post', title: 'Weekend refresh — Blankets & Duvet campaign', status: 'review' },
  { id: 'cs12', date: '2026-06-28', dayLabel: 'Sat', platform: 'tiktok', contentType: 'Video', title: 'Satisfying laundry fold — viral format', status: 'pending' },
  { id: 'cs13', date: '2026-06-29', dayLabel: 'Sun', platform: 'instagram', contentType: 'Post', title: 'Week recap — orders, reviews, milestones', status: 'pending' },
  { id: 'cs14', date: '2026-06-29', dayLabel: 'Sun', platform: 'blog', contentType: 'Article', title: 'How hotel laundry services work in Dubai', status: 'pending' },
];

// ── Context Interface ──────────────────────────────────────────────────────

interface AgentContextState {
  conversations: Conversation[];
  escalations: Escalation[];
  agentRuns: AgentRun[];
  marketingTasks: MarketingTask[];
  marketingDrafts: MarketingDraft[];
  agentRegistry: AgentRegistration[];
  calendarSlots: CalendarSlot[];

  simulateIncomingMessage: (phone: string, message: string, customerName?: string) => void;
  createEscalation: (data: Omit<Escalation, 'id' | 'createdAt'>) => string;
  resolveEscalation: (id: string) => void;
  assignEscalation: (id: string, assignedTo: string) => void;
  runMarketingAgent: (agentId: string, brief: string, platform?: string) => void;
  approveDraft: (draftId: string, approvedBy: string) => void;
  rejectDraft: (draftId: string, notes: string) => void;
  toggleAgent: (agentId: string) => void;
  takeOverConversation: (conversationId: string) => void;
  resolveConversation: (conversationId: string) => void;
  updateCalendarSlot: (slotId: string, status: CalendarSlot['status']) => void;
}

const AgentContext = createContext<AgentContextState | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

export function AgentProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [escalations, setEscalations] = useState<Escalation[]>(SEED_ESCALATIONS);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>(SEED_AGENT_RUNS);
  const [marketingTasks, setMarketingTasks] = useState<MarketingTask[]>(SEED_MARKETING_TASKS);
  const [marketingDrafts, setMarketingDrafts] = useState<MarketingDraft[]>(SEED_MARKETING_DRAFTS);
  const [agentRegistry, setAgentRegistry] = useState<AgentRegistration[]>(AGENT_REGISTRY);
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlot[]>(SEED_CALENDAR);

  const simulateIncomingMessage = useCallback((phone: string, message: string, customerName?: string) => {
    const start = Date.now();

    setConversations(prev => {
      const existing = prev.find(c => c.customerPhone === phone);
      const convId = existing?.id ?? `conv-${Date.now()}`;
      const conv: Conversation = existing ?? {
        id: convId,
        customerPhone: phone,
        customerName,
        status: 'active',
        orderDraft: {},
        missingFields: [],
        sentiment: 'neutral',
        channel: 'simulated',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const customerMsg = buildCustomerMessage(convId, message);
      const { intent, confidence } = classifyIntent(message);
      const sentiment: SentimentType = detectSentiment(message);

      let agentResult;
      const isEscalationTrigger = intent === 'complaint' || intent === 'refund_request' || intent === 'human_required';

      if (isEscalationTrigger) {
        agentResult = runEscalationAgent(message, { ...conv, messages: [...conv.messages, customerMsg] }, intent as IntentType);
      } else {
        agentResult = runCustomerOrderAgent(message, { ...conv, messages: [...conv.messages, customerMsg] });
      }

      const agentMsg = buildAgentMessage(convId, agentResult.response, agentResult.agentName, agentResult.toolCalls);
      const updatedMessages = [...conv.messages, customerMsg, agentMsg];
      const durationMs = Date.now() - start;

      // Create escalation if needed
      if (agentResult.escalation) {
        const escId = `esc-${Date.now()}`;
        const newEsc: Escalation = {
          id: escId,
          createdAt: new Date().toISOString(),
          ...agentResult.escalation,
        };
        setEscalations(prev2 => [newEsc, ...prev2]);
        agentResult.conversationUpdates.escalationId = escId;
      }

      // Log the run
      const run = buildAgentRun({
        agentName: agentResult.agentName,
        conversationId: convId,
        inputSummary: `"${message.slice(0, 60)}"`,
        intentDetected: intent as IntentType,
        toolsUsed: agentResult.toolsUsed,
        outputSummary: agentResult.response.slice(0, 80),
        durationMs,
        status: agentResult.runStatus,
      });

      // Log intent classifier run too
      const classifierRun = buildAgentRun({
        agentName: 'Intent Classifier',
        conversationId: convId,
        inputSummary: `"${message.slice(0, 60)}"`,
        intentDetected: intent as IntentType,
        toolsUsed: [],
        outputSummary: `Intent: ${intent}, confidence: ${confidence}`,
        durationMs: 38 + Math.floor(Math.random() * 20),
        status: isEscalationTrigger ? 'escalated' : 'success',
      });

      setAgentRuns(prev2 => [run, classifierRun, ...prev2]);

      const updatedConv: Conversation = {
        ...conv,
        ...agentResult.conversationUpdates,
        sentiment,
        messages: updatedMessages,
        updatedAt: new Date().toISOString(),
      };

      if (existing) {
        return prev.map(c => c.id === convId ? updatedConv : c);
      } else {
        return [updatedConv, ...prev];
      }
    });
  }, []);

  const createEscalation = useCallback((data: Omit<Escalation, 'id' | 'createdAt'>): string => {
    const id = `esc-${Date.now()}`;
    const newEsc: Escalation = { id, createdAt: new Date().toISOString(), ...data };
    setEscalations(prev => [newEsc, ...prev]);
    return id;
  }, []);

  const resolveEscalation = useCallback((id: string) => {
    setEscalations(prev => prev.map(e => e.id === id ? { ...e, status: 'resolved', resolvedAt: new Date().toISOString() } : e));
  }, []);

  const assignEscalation = useCallback((id: string, assignedTo: string) => {
    setEscalations(prev => prev.map(e => e.id === id ? { ...e, status: 'assigned', assignedTo } : e));
  }, []);

  const runMarketingAgent = useCallback((agentId: string, brief: string, platform?: string) => {
    let task: MarketingTask | null = null;
    let draft: MarketingDraft | null = null;
    let additionalSlots: CalendarSlot[] = [];

    if (agentId === 'content-planning-agent') {
      const result = runContentPlanningAgent(brief);
      task = result.task;
      draft = result.draft;
      additionalSlots = result.calendarSlots;
    } else if (agentId === 'social-content-agent') {
      const result = runSocialContentAgent(brief, platform);
      task = result.task; draft = result.draft;
    } else if (agentId === 'brand-review-agent') {
      const result = runBrandReviewAgent(brief, 'Content Review');
      task = result.task; draft = result.draft;
    } else if (agentId === 'seo-agent') {
      const result = runSEOAgent(brief);
      task = result.task; draft = result.draft;
    } else if (agentId === 'ads-agent') {
      const result = runAdsAgent(brief, platform);
      task = result.task; draft = result.draft;
    } else if (agentId === 'lead-gen-agent') {
      const result = runLeadGenAgent(brief);
      task = result.task; draft = result.draft;
    } else if (agentId === 'marketing-analytics-agent') {
      const result = runMarketingAnalyticsAgent(brief);
      task = result.task; draft = result.draft;
    }

    if (task && draft) {
      const linkedTask = { ...task, draftId: draft.id };
      setMarketingTasks(prev => [linkedTask, ...prev]);
      setMarketingDrafts(prev => [draft!, ...prev]);

      if (additionalSlots.length > 0) {
        setCalendarSlots(prev => [...additionalSlots, ...prev]);
      }

      const run = buildAgentRun({
        agentName: task.agentName,
        inputSummary: brief.slice(0, 60),
        toolsUsed: ['create_marketing_task', 'create_marketing_draft'],
        outputSummary: `${task.title} — draft ready for review`,
        durationMs: 600 + Math.floor(Math.random() * 600),
        status: 'success',
      });
      setAgentRuns(prev => [run, ...prev]);

      setAgentRegistry(prev =>
        prev.map(a =>
          a.id === agentId
            ? { ...a, status: 'idle' as const, lastRun: 'Just now', runsToday: a.runsToday + 1 }
            : a
        )
      );
    }
  }, []);

  const approveDraft = useCallback((draftId: string, approvedBy: string) => {
    setMarketingDrafts(prev =>
      prev.map(d => d.id === draftId ? { ...d, status: 'approved' as const, approvedBy } : d)
    );
    setMarketingTasks(prev =>
      prev.map(t => t.draftId === draftId ? { ...t, status: 'approved' as const } : t)
    );
  }, []);

  const rejectDraft = useCallback((draftId: string, notes: string) => {
    setMarketingDrafts(prev =>
      prev.map(d => d.id === draftId ? { ...d, status: 'rejected' as const, reviewNotes: notes } : d)
    );
    setMarketingTasks(prev =>
      prev.map(t => t.draftId === draftId ? { ...t, status: 'rejected' as const } : t)
    );
  }, []);

  const toggleAgent = useCallback((agentId: string) => {
    setAgentRegistry(prev =>
      prev.map(a =>
        a.id === agentId
          ? { ...a, isEnabled: !a.isEnabled, status: (!a.isEnabled ? 'idle' : 'paused') as AgentRegistration['status'] }
          : a
      )
    );
  }, []);

  const takeOverConversation = useCallback((conversationId: string) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, status: 'waiting_human' as const, lastAgentAction: 'human_takeover' }
          : c
      )
    );
  }, []);

  const resolveConversation = useCallback((conversationId: string) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId
          ? { ...c, status: 'resolved' as const, lastAgentAction: 'resolved_by_human' }
          : c
      )
    );
  }, []);

  const updateCalendarSlot = useCallback((slotId: string, status: CalendarSlot['status']) => {
    setCalendarSlots(prev => prev.map(s => s.id === slotId ? { ...s, status } : s));
  }, []);

  return (
    <AgentContext.Provider value={{
      conversations, escalations, agentRuns, marketingTasks, marketingDrafts,
      agentRegistry, calendarSlots,
      simulateIncomingMessage, createEscalation, resolveEscalation, assignEscalation,
      runMarketingAgent, approveDraft, rejectDraft, toggleAgent,
      takeOverConversation, resolveConversation, updateCalendarSlot,
    }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgent must be used within AgentProvider');
  return ctx;
}
