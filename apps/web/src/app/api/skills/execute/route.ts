/**
 * POST /api/skills/execute
 *
 * Executes a claude-for-legal skill against provided document content.
 * Streams the response via Server-Sent Events.
 *
 * Body: {
 *   skillId: string          — e.g. "commercial-legal:review"
 *   documentMarkdown: string — parsed document content
 *   additionalContext?: string
 *   caseId?: string
 * }
 *
 * Response: SSE stream — data: {type, content, ...}
 */

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSkill } from '@/lib/legal-skills'
import { loadSkillPrompt, loadPluginProfile } from '@/lib/legal-skills-server'
import { z } from 'zod'

const client = new Anthropic()

const BodySchema = z.object({
  skillId: z.string().min(1),
  documentMarkdown: z.string().min(1),
  additionalContext: z.string().optional(),
  caseId: z.string().optional(),
})

function buildSystemPrompt(skillPrompt: string | null, pluginProfile: string | null): string {
  const parts: string[] = [
    `Eres LEXIA, asistente jurídico experto en derecho español de IURALEX.
Jurisdicción: España. Idioma: Español formal jurídico.
IMPORTANTE: Todo análisis es informativo. El usuario debe consultar con abogado colegiado para decisiones legales.`,
  ]

  if (pluginProfile) {
    parts.push(`\n## Perfil y Playbook del Despacho\n${pluginProfile}`)
  }

  if (skillPrompt) {
    // Strip YAML frontmatter from skill.md
    const body = skillPrompt.replace(/^---[\s\S]*?---\n/, '').trim()
    parts.push(`\n## Instrucciones de la Skill\n${body}`)
  }

  return parts.join('\n')
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const body = BodySchema.parse(await req.json())
        const skill = getSkill(body.skillId)

        if (!skill) {
          send({ type: 'error', message: `Skill desconocida: ${body.skillId}` })
          controller.close()
          return
        }

        const skillPrompt = loadSkillPrompt(body.skillId)
        const pluginProfile = loadPluginProfile(skill.plugin)
        const systemPrompt = buildSystemPrompt(skillPrompt, pluginProfile)

        send({ type: 'skill_start', skillId: body.skillId, skillLabel: skill.label })

        const userMessage = [
          `## Documento a Analizar\n\n${body.documentMarkdown}`,
          body.additionalContext ? `\n## Contexto Adicional\n${body.additionalContext}` : '',
          body.caseId ? `\n## ID de Expediente: ${body.caseId}` : '',
        ].filter(Boolean).join('\n')

        const claudeStream = client.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          system: [
            {
              type: 'text' as const,
              text: systemPrompt,
              cache_control: { type: 'ephemeral' as const },
            },
          ],
          messages: [{ role: 'user', content: userMessage }],
        })

        let fullText = ''
        let inputTokens = 0
        let outputTokens = 0
        let cacheTokens = 0

        for await (const event of claudeStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullText += event.delta.text
            send({ type: 'text', delta: event.delta.text })
          }

          if (event.type === 'message_delta' && event.usage) {
            outputTokens = event.usage.output_tokens ?? 0
          }

          if (event.type === 'message_start' && event.message.usage) {
            inputTokens = event.message.usage.input_tokens ?? 0
            // cache_read_input_tokens exists at runtime but may not be in SDK types
            cacheTokens = (event.message.usage as unknown as Record<string, number>).cache_read_input_tokens ?? 0
          }
        }

        // Cost estimation (Haiku pricing)
        const inputCostUsd = (inputTokens / 1_000_000) * 0.8
        const outputCostUsd = (outputTokens / 1_000_000) * 4
        const cacheCostUsd = (cacheTokens / 1_000_000) * 0.08
        const totalEurCents = Math.round((inputCostUsd + outputCostUsd + cacheCostUsd) * 92 * 100)

        send({
          type: 'done',
          skillId: body.skillId,
          tokens: { input: inputTokens, output: outputTokens, cache: cacheTokens },
          cost_eur_cents: totalEurCents,
          fullText,
        })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error inesperado'
        send({ type: 'error', message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
