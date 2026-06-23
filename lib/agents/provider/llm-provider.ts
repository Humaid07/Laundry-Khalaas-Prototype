/**
 * LLM Provider abstraction.
 * Currently runs in simulated mode — replace callLLM body with
 * real SDK calls (Anthropic, OpenAI, OpenRouter) by setting
 * LLM_PROVIDER in environment variables and implementing the
 * respective branch. No other file needs to change.
 */

export type LLMProvider = 'anthropic' | 'openai' | 'openrouter' | 'simulated';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMConfig {
  provider?: LLMProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  durationMs: number;
}

const DEFAULT_CONFIG: Required<LLMConfig> = {
  provider: 'simulated',
  model: 'simulated-v1',
  temperature: 0.3,
  maxTokens: 1024,
};

/**
 * Primary LLM call entry point.
 * In simulated mode, returns the last system message as a pass-through.
 * Replace this function body with real provider calls to go live.
 */
export async function callLLM(
  messages: LLMMessage[],
  config: LLMConfig = {}
): Promise<LLMResponse> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const start = Date.now();

  // Simulated mode — return the prepared response from the system message
  if (cfg.provider === 'simulated') {
    const systemMsg = messages.find(m => m.role === 'system');
    const content = systemMsg?.content ?? 'Understood. How can I help you further?';
    return {
      content,
      provider: 'simulated',
      model: 'simulated-v1',
      durationMs: Date.now() - start + Math.floor(Math.random() * 120 + 80),
    };
  }

  /**
   * TODO: replace with real provider integration
   *
   * Anthropic example:
   *   const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
   *   const res = await anthropic.messages.create({ model: cfg.model, messages, max_tokens: cfg.maxTokens });
   *   return { content: res.content[0].text, provider: 'anthropic', model: cfg.model, durationMs: ... };
   *
   * OpenAI example:
   *   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
   *   const res = await openai.chat.completions.create({ model: cfg.model, messages, temperature: cfg.temperature });
   *   return { content: res.choices[0].message.content, provider: 'openai', model: cfg.model, durationMs: ... };
   */

  throw new Error(`LLM provider "${cfg.provider}" not yet integrated. Set provider to "simulated" or implement the integration.`);
}

export function getActiveProvider(): LLMProvider {
  return 'simulated';
}

export function getProviderLabel(provider: LLMProvider): string {
  const labels: Record<LLMProvider, string> = {
    anthropic: 'Anthropic Claude',
    openai: 'OpenAI GPT',
    openrouter: 'OpenRouter',
    simulated: 'Simulated (No LLM)',
  };
  return labels[provider];
}
