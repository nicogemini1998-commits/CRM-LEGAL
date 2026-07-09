import Anthropic from '@anthropic-ai/sdk'

let _anthropic: Anthropic | null = null

function getClient(): Anthropic {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set')
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _anthropic
}

export const anthropic = { get client() { return getClient() } }

// Haiku 3.5: $0.80/MTok input, $4/MTok output — 10x más barato que Sonnet
// Con prompt caching: ~90% descuento en tokens del sistema repetidos
export const MODEL = 'claude-haiku-4-5-20251001'

export type MessageParam = {
  role: 'user' | 'assistant'
  content: string
}

export interface ClaudeUsage {
  input_tokens: number
  output_tokens: number
  cache_read_tokens: number
  cache_creation_tokens: number
  // Coste estimado en céntimos de euro
  cost_eur_cents: number
}

function calcCostCents(usage: Anthropic.Usage): number {
  const u = usage as unknown as Record<string, number>
  const inputCost = (usage.input_tokens / 1_000_000) * 0.80
  const outputCost = (usage.output_tokens / 1_000_000) * 4.00
  const cacheReadCost = ((u.cache_read_input_tokens || 0) / 1_000_000) * 0.08
  const cacheWriteCost = ((u.cache_creation_input_tokens || 0) / 1_000_000) * 1.00
  return Math.round((inputCost + outputCost + cacheReadCost + cacheWriteCost) * 0.92 * 100)
}

function getCacheTokens(usage: Anthropic.Usage): number {
  return ((usage as unknown as Record<string, number>).cache_read_input_tokens || 0)
}

export async function callClaudeAPI(
  systemPrompt: string,
  messages: MessageParam[],
  options?: { maxTokens?: number }
): Promise<{ content: string; usage: ClaudeUsage }> {
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: options?.maxTokens || 2048,
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages,
  })

  const content = response.content[0].type === 'text' ? response.content[0].text : ''
  return {
    content,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      cache_read_tokens: getCacheTokens(response.usage),
      cache_creation_tokens: ((response.usage as unknown as Record<string, number>).cache_creation_input_tokens || 0),
      cost_eur_cents: calcCostCents(response.usage),
    },
  }
}

export function streamClaudeAPI(
  systemPrompt: string,
  messages: MessageParam[],
  options?: { maxTokens?: number; extraSystemBlocks?: Array<{ text: string; cache?: boolean }> }
) {
  const baseBlock = { type: 'text' as const, text: systemPrompt, cache_control: { type: 'ephemeral' as const } }
  const extras = (options?.extraSystemBlocks || []).map(b =>
    b.cache
      ? { type: 'text' as const, text: b.text, cache_control: { type: 'ephemeral' as const } }
      : { type: 'text' as const, text: b.text }
  )
  return getClient().messages.stream({
    model: MODEL,
    max_tokens: options?.maxTokens || 2048,
    system: [baseBlock, ...extras],
    messages,
  })
}
