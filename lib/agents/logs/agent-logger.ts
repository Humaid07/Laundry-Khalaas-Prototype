import type { AgentRun, AgentRunStatus, IntentType } from '../types';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  level: LogLevel;
  agent: string;
  message: string;
  data?: unknown;
  timestamp: string;
}

const isDev = process.env.NODE_ENV !== 'production';

export function logAgentEvent(
  level: LogLevel,
  agent: string,
  message: string,
  data?: unknown
): LogEntry {
  const entry: LogEntry = {
    level,
    agent,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (isDev) {
    const prefix = `[Agent:${agent}]`;
    if (level === 'error') console.error(prefix, message, data ?? '');
    else if (level === 'warn') console.warn(prefix, message, data ?? '');
    else console.log(prefix, message, data ?? '');
  }

  return entry;
}

export function buildAgentRun(params: {
  agentName: string;
  conversationId?: string;
  inputSummary: string;
  intentDetected?: IntentType;
  toolsUsed: string[];
  outputSummary: string;
  durationMs: number;
  status: AgentRunStatus;
}): AgentRun {
  return {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...params,
  };
}

export function measureStart(): () => number {
  const start = Date.now();
  return () => Date.now() - start;
}
