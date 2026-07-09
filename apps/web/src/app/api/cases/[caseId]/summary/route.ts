import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { streamClaudeAPI } from '@/lib/claude/client'
import type { DemoAnalysisRecord } from '@/lib/dev/demo-data'

const SYSTEM = `Eres LEXIA, asistente jurídico español. Genera un resumen ejecutivo del expediente recibido. Idioma: español formal jurídico.

Formato OBLIGATORIO (con headings markdown ##):
## Estado actual
[1-2 párrafos sobre fase procesal y situación]

## Hechos clave
- [hecho 1]
- [hecho 2]
- [hecho 3]

## Posición jurídica
[Análisis breve, citas normativas con artículo exacto]

## Riesgos identificados
- ALTO: [riesgo crítico si lo hay]
- MEDIO: [riesgo moderado]
- BAJO: [riesgo menor]

## Próximos pasos recomendados
1. [Acción inmediata]
2. [Acción siguiente]
3. [Acción seguimiento]

## Plazos críticos
- [Acción / plazo / norma] si aplica

Reglas:
- SIN markdown bold (**), SIN cursivas (*), SIN backticks
- Solo texto plano + headings ##
- Cada cita normativa cita el artículo exacto (ej: art. 59.3 ET)
- NO inventes datos, hechos ni nombres que no aparezcan en el contexto
- NO añadas disclaimer al final (UI lo muestra fijo)`

export async function GET(req: NextRequest, { params }: { params: Promise<{ caseId: string }> }) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  const { caseId } = await params

  let contextBlock = ''
  try {
    const { DEMO_CASES, DEMO_CLIENTS, DEMO_DOCUMENTS, DEMO_ANALYSES_STORE } = await import('@/lib/dev/demo-data')
    const c = DEMO_CASES.find(x => x.id === caseId)
    if (!c) {
      return new Response(JSON.stringify({ error: 'Caso no encontrado' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    const client = DEMO_CLIENTS.find(x => x.id === c.client_id)
    const docs = DEMO_DOCUMENTS.filter(d => d.case_id === caseId)
    const analyses = (DEMO_ANALYSES_STORE || []).filter((a: { document_id: string }) => docs.some(d => d.id === a.document_id))

    contextBlock = `## CONTEXTO DEL EXPEDIENTE
Nº ${c.case_number || 'sin nº'} · Área ${c.area} · Estado ${c.status} · Importe €${c.amount || 0}
Título: ${c.title}
Descripción: ${c.description}

## CLIENTE
${client ? `${client.name} (${client.type}, NIF ${client.nif_cif || 'sin NIF'})` : 'sin cliente vinculado'}

## DOCUMENTOS DEL EXPEDIENTE (${docs.length})
${docs.slice(0, 10).map(d => `- ${d.title}${d.doc_type ? ` [${d.doc_type}]` : ''}\n  Contenido (extracto): ${(d.content_markdown || '').slice(0, 800)}`).join('\n\n')}

## ANÁLISIS IA PREVIOS (${analyses.length})
${analyses.slice(0, 5).map((a: DemoAnalysisRecord) => `- Riesgo ${(a.content as { risk_level?: string }).risk_level || 'N/D'}: ${(a.content as { summary?: string }).summary || 'sin resumen'}`).join('\n')}`
  } catch (err) {
    console.error('[summary] context error:', err)
  }

  const userPrompt = contextBlock || `Genera resumen del expediente ${caseId}. Datos no disponibles.`

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }
      try {
        const streamObj = streamClaudeAPI(SYSTEM, [{ role: 'user', content: userPrompt }], { maxTokens: 2500 })
        for await (const event of streamObj) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            send({ type: 'delta', text: event.delta.text })
          }
        }
        send({ type: 'done' })
      } catch (err) {
        console.error('[summary] stream error:', err)
        send({ type: 'error', message: err instanceof Error ? err.message : 'Error' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
