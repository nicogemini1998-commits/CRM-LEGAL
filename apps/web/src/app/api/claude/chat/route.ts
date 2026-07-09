import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { streamClaudeAPI } from '@/lib/claude/client'
import { SYSTEM_PROMPT_LEGAL_CHAT } from '@/lib/claude/prompts'
import { sanitizeText, validateUUID } from '@/lib/security/sanitize'
import { withErrorHandler, ValidationError, UnauthorizedError } from '@/lib/security/apiResponse'
import { checkRateLimit, LIMITS } from '@/lib/security/rateLimit'
import { upsertConversation } from '@/lib/dev/persist'
import { shouldSearch, searchLegalSources, formatForClaude } from '@/lib/lexia/search'
import { auditLog } from '@/lib/security/gdpr'
import { DEMO_CLIENTS, DEMO_CASES, DEMO_DOCUMENTS, DEMO_ANALYSES } from '@/lib/dev/demo-data'

const MAX_HISTORY = 10
const MAX_MESSAGE_LENGTH = 4000
const IS_DEV_WITHOUT_DB =
  process.env.NEXT_PUBLIC_DEMO_MODE === '1' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

// ─── Build despacho context as a cacheable block ────────────────────────────
// Block changes only when data changes — uses cache_control ephemeral (5m)
// for ~90% token savings on re-reads inside the same conversation window.
function buildDespachoContext(opts: {
  userName: string
  userEmail: string
  clients: Array<{ name: string; type: string; nif_cif: string; id: string }>
  cases: Array<{ id: string; title: string; area: string; amount: number; status: string; client_name: string }>
  documents: Array<{ title: string; risk_level: string | null; summary: string | null }>
}): string {
  const activeCases = opts.cases.filter(c => c.status === 'open')
  const clientCaseCount: Record<string, number> = {}
  for (const c of activeCases) clientCaseCount[c.client_name] = (clientCaseCount[c.client_name] ?? 0) + 1

  const clientLines = opts.clients
    .slice(0, 20)
    .map(c => `- ${c.name} (${c.type === 'company' ? 'empresa' : 'particular'}, NIF ${c.nif_cif}) · ${clientCaseCount[c.name] ?? 0} casos activos`)
    .join('\n')

  const caseLines = activeCases
    .slice(0, 15)
    .map(c => `- [${c.area}] ${c.title} · cliente ${c.client_name} · €${c.amount.toLocaleString('es-ES')} · ${c.status}`)
    .join('\n')

  const docLines = opts.documents
    .slice(0, 10)
    .map(d => `- ${d.title} · riesgo ${d.risk_level ?? 'n/d'} · ${d.summary ?? 'sin resumen'}`)
    .join('\n')

  return `## CONTEXTO DEL DESPACHO
Abogado: ${opts.userName} (${opts.userEmail}) — Despacho IURALEX

## CARTERA DE CLIENTES (${opts.clients.length} total)
${clientLines || '_Sin clientes registrados._'}

## EXPEDIENTES ACTIVOS (${activeCases.length})
${caseLines || '_Sin expedientes activos._'}

## DOCUMENTOS RECIENTES (últimos ${Math.min(10, opts.documents.length)} con análisis)
${docLines || '_Sin documentos analizados._'}

Eres LEXIA, asistente jurídico + personal del abogado. Conoces toda su cartera. Si pregunta algo general (jurisprudencia, normativa) respondes como experto. Si pregunta sobre "su despacho" (ej: "qué casos urgentes tengo", "qué clientes con plazo este mes", "redacta resumen para X cliente") usas el contexto. Español formal jurídico. Sugiere acciones concretas.`
}

// ─── Retrieve despacho data (demo or real Supabase) ─────────────────────────
async function getDespachoData(
  userId: string,
  userName: string,
  userEmail: string,
  supabase: ReturnType<typeof createServerClient> | null,
) {
  if (IS_DEV_WITHOUT_DB || !supabase) {
    const docMap = new Map(DEMO_DOCUMENTS.map(d => [d.id, d]))
    const caseClientMap = new Map(DEMO_CASES.map(c => [c.id, c.clients.name]))
    return {
      userName,
      userEmail,
      clients: DEMO_CLIENTS.map(c => ({ name: c.name, type: c.type, nif_cif: c.nif_cif, id: c.id })),
      cases: DEMO_CASES.map(c => ({
        id: c.id,
        title: c.title,
        area: c.area,
        amount: c.amount,
        status: c.status,
        client_name: c.clients.name,
      })),
      documents: DEMO_ANALYSES
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(a => {
          const doc = docMap.get(a.document_id)
          const clientName = caseClientMap.get(a.case_id) ?? ''
          return {
            title: `${doc?.title ?? 'Documento'}${clientName ? ` (${clientName})` : ''}`,
            risk_level: a.content?.risk_level ?? null,
            summary: a.content?.summary ?? null,
          }
        }),
    }
  }

  // Real Supabase mode — parallel fetch of clients, cases, recent analyses
  type CaseRow = { id: string; title: string; area: string; amount: number; status: string; clients?: unknown }
  type AnalysisRow = {
    content?: { risk_level?: string; summary?: string } | null
    documents?: unknown
  }
  type ClientRow = { id: string; name: string; type: string; nif_cif?: string }

  const [clientsRes, casesRes, docsRes] = await Promise.all([
    supabase.from('clients').select('id, name, type, nif_cif').eq('user_id', userId).limit(50),
    supabase.from('cases').select('id, title, area, amount, status, clients(name)').eq('user_id', userId).limit(80),
    supabase
      .from('document_analyses')
      .select('content, documents(title, cases(clients(name)))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const extractName = (raw: unknown): string => {
    if (!raw) return ''
    if (Array.isArray(raw)) return (raw[0] as { name?: string })?.name ?? ''
    return (raw as { name?: string })?.name ?? ''
  }

  return {
    userName,
    userEmail,
    clients: ((clientsRes.data ?? []) as ClientRow[]).map(c => ({
      name: c.name,
      type: c.type,
      nif_cif: c.nif_cif ?? '',
      id: c.id,
    })),
    cases: ((casesRes.data ?? []) as CaseRow[]).map(c => ({
      id: c.id,
      title: c.title,
      area: c.area,
      amount: c.amount ?? 0,
      status: c.status,
      client_name: extractName(c.clients),
    })),
    documents: ((docsRes.data ?? []) as AnalysisRow[]).map(a => {
      const doc = Array.isArray(a.documents) ? a.documents[0] : a.documents
      const docTitle = (doc as { title?: string })?.title ?? 'Documento'
      const cases = (doc as { cases?: unknown })?.cases
      const caseRow = Array.isArray(cases) ? cases[0] : cases
      const clientName = extractName((caseRow as { clients?: unknown })?.clients)
      return {
        title: `${docTitle}${clientName ? ` (${clientName})` : ''}`,
        risk_level: a.content?.risk_level ?? null,
        summary: a.content?.summary ?? null,
      }
    }),
  }
}

// ─── Build CLIENT-scoped context block (per-client chat) ────────────────────
async function buildClientContextBlock(
  clientId: string,
  supabase: ReturnType<typeof createServerClient> | null,
): Promise<string | null> {
  interface ClientLite { id: string; name: string; nif_cif?: string | null; type: string; email?: string | null; phone?: string | null; address?: string | null; notes?: string | null }
  interface CaseLite { id: string; title: string; area: string; status: string; amount: number; description?: string | null; client_id: string }
  interface DocLite { id: string; title: string; file_type?: string; created_at: string; case_id?: string | null; content_markdown?: string | null }
  interface AnaContent { risk_level?: string; summary?: string; clauses_risks?: string[]; recommendations?: string[] }

  let client: ClientLite | null = null
  let cases: CaseLite[] = []
  let docs: DocLite[] = []
  const analysisByDoc = new Map<string, { content: AnaContent }>()

  if (IS_DEV_WITHOUT_DB || !supabase) {
    const { DEMO_ANALYSES_STORE } = await import('@/lib/dev/demo-data')
    client = (DEMO_CLIENTS.find(c => c.id === clientId) as unknown as ClientLite) || null
    if (!client) return null
    cases = DEMO_CASES.filter(c => c.client_id === clientId) as unknown as CaseLite[]
    const caseIds = new Set(cases.map(c => c.id))
    // Include docs via case_id OR directly via client_id
    docs = DEMO_DOCUMENTS.filter(d =>
      (d.case_id && caseIds.has(d.case_id)) ||
      (d as any).client_id === clientId
    ) as unknown as DocLite[]
    // Also include uploaded docs from persist store
    try {
      const { readStore } = await import('@/lib/dev/persist')
      const stored = readStore()
      const uploadedForClient = (stored.uploadedDocuments as any[]).filter(
        d => d.client_id === clientId || (d.case_id && caseIds.has(d.case_id))
      )
      for (const ud of uploadedForClient) {
        if (!docs.find((d: any) => d.id === ud.id)) {
          docs.push(ud as unknown as DocLite)
        }
      }
    } catch {}
    DEMO_ANALYSES_STORE.forEach(a => analysisByDoc.set(a.document_id, { content: a.content as AnaContent }))
  } else {
    const { data: c } = await supabase.from('clients').select('*').eq('id', clientId).single()
    if (!c) return null
    client = c as ClientLite
    const { data: cs } = await supabase
      .from('cases')
      .select('id, title, area, status, amount, description, client_id')
      .eq('client_id', clientId)
    cases = (cs ?? []) as CaseLite[]
    const caseIds = cases.map(x => x.id)
    if (caseIds.length) {
      const { data: ds } = await supabase
        .from('documents')
        .select('id, title, file_type, created_at, case_id, content_markdown')
        .in('case_id', caseIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(10)
      docs = (ds ?? []) as DocLite[]
      const docIds = docs.map(d => d.id)
      if (docIds.length) {
        const { data: as_ } = await supabase
          .from('document_analyses')
          .select('document_id, content')
          .in('document_id', docIds)
        ;(as_ ?? []).forEach((a: { document_id: string; content: AnaContent }) => analysisByDoc.set(a.document_id, { content: a.content }))
      }
    }
  }

  const lines: string[] = []
  lines.push('## CONTEXTO DEL CLIENTE')
  lines.push(`Nombre: ${client.name} · NIF/CIF: ${client.nif_cif ?? '—'} · Tipo: ${client.type === 'company' ? 'Empresa' : 'Persona física'}`)
  lines.push(`Email: ${client.email ?? '—'} · Tlf: ${client.phone ?? '—'}`)
  if (client.address) lines.push(`Dirección: ${client.address}`)
  if (client.notes) lines.push(`\n## NOTAS Y CONTRATOS\n${client.notes}`)
  lines.push('')
  lines.push(`## EXPEDIENTES (${cases.length})`)
  if (cases.length === 0) {
    lines.push('- Sin expedientes registrados.')
  } else {
    cases.forEach(c => {
      lines.push(`- [${c.area}] ${c.title} · estado ${c.status} · importe €${(c.amount || 0).toLocaleString('es-ES')}`)
      if (c.description) lines.push(`  Descripción: ${c.description}`)
    })
  }
  lines.push('')
  lines.push(`## DOCUMENTOS Y CONTRATOS DEL CLIENTE (${docs.length})`)
  if (docs.length === 0) {
    lines.push('- Sin documentos vinculados.')
  } else {
    docs.slice(0, 10).forEach(d => {
      const a = analysisByDoc.get(d.id)
      lines.push(`\n### ${d.title} (${d.file_type ?? 'doc'}) — ${new Date(d.created_at).toLocaleDateString('es-ES')}`)
      if (d.content_markdown) {
        lines.push('TEXTO COMPLETO DEL DOCUMENTO:')
        lines.push(d.content_markdown.slice(0, 8000))
      } else {
        lines.push('NOTA: El texto de este documento no está disponible todavía. Trabaja con lo que sabes del expediente y el contrato. NO pidas el texto — da tu análisis con la información que tienes.')
      }
      if (a?.content) {
        lines.push(`\nANÁLISIS IA — Riesgo: ${a.content.risk_level ?? '—'}`)
        if (a.content.summary) lines.push(`Resumen: ${a.content.summary}`)
        if (a.content.clauses_risks?.length) {
          lines.push('Riesgos detectados:')
          a.content.clauses_risks.forEach(r => lines.push(`  - ${r}`))
        }
        if (a.content.recommendations?.length) {
          lines.push('Recomendaciones:')
          a.content.recommendations.forEach(r => lines.push(`  - ${r}`))
        }
      }
    })
  }
  lines.push('')
  lines.push('INSTRUCCIÓN CRÍTICA: Tienes acceso COMPLETO al texto de los contratos y documentos del cliente arriba. NUNCA pidas al abogado que te comparta documentos que ya están en este contexto. Responde directamente con base en el texto que tienes. Eres LEXIA, asistente jurídico técnico. Respuestas: concisas, precisas, con artículos exactos y sus URLs oficiales. Sin introducción, sin rodeos.')
  return lines.join('\n')
}
// ─── Build CASE-scoped context block (per-expediente chat) ─────────────────
async function buildCaseContextBlock(
  caseId: string,
  supabase: ReturnType<typeof createServerClient> | null,
): Promise<string | null> {
  interface CaseFull { id: string; title: string; case_number?: string | null; area: string; status: string; amount: number; description?: string | null; client_id: string }
  interface DocLite { id: string; title: string; doc_type?: string | null; content_markdown?: string | null; created_at: string }
  interface AnaContent { risk_level?: string; summary?: string }

  let caseData: CaseFull | null = null
  let clientName = ''
  let docs: DocLite[] = []
  const analysisByDoc = new Map<string, { content: AnaContent }>()

  if (IS_DEV_WITHOUT_DB || !supabase) {
    const { DEMO_CASES, DEMO_CLIENTS, DEMO_DOCUMENTS, DEMO_ANALYSES_STORE } = await import('@/lib/dev/demo-data')
    caseData = (DEMO_CASES.find(c => c.id === caseId) as unknown as CaseFull) || null
    if (!caseData) return null
    const client = DEMO_CLIENTS.find(c => c.id === caseData!.client_id)
    clientName = client?.name ?? ''
    docs = DEMO_DOCUMENTS.filter(d => d.case_id === caseId) as unknown as DocLite[]
    DEMO_ANALYSES_STORE.forEach(a => {
      if (docs.some(d => d.id === a.document_id)) {
        analysisByDoc.set(a.document_id, { content: a.content as AnaContent })
      }
    })
  } else {
    const { data: c } = await supabase.from('cases').select('*, clients(name)').eq('id', caseId).single()
    if (!c) return null
    const raw = c as any
    clientName = Array.isArray(raw.clients) ? raw.clients[0]?.name ?? '' : raw.clients?.name ?? ''
    caseData = raw as CaseFull
    const { data: ds } = await supabase.from('documents').select('id, title, doc_type, content_markdown, created_at').eq('case_id', caseId).is('deleted_at', null).order('created_at', { ascending: false }).limit(10)
    docs = (ds ?? []) as DocLite[]
    const docIds = docs.map(d => d.id)
    if (docIds.length) {
      const { data: as_ } = await supabase.from('document_analyses').select('document_id, content').in('document_id', docIds)
      ;(as_ ?? []).forEach((a: { document_id: string; content: AnaContent }) => analysisByDoc.set(a.document_id, { content: a.content }))
    }
  }

  const lines: string[] = []
  lines.push('## CONTEXTO DEL EXPEDIENTE')
  lines.push(`Expediente: ${caseData.case_number ?? caseData.id} · ${caseData.title}`)
  lines.push(`Área: ${caseData.area} · Estado: ${caseData.status} · Cuantía: €${(caseData.amount || 0).toLocaleString('es-ES')}`)
  if (clientName) lines.push(`Cliente: ${clientName}`)
  if (caseData.description) lines.push(`Descripción: ${caseData.description}`)
  lines.push('')
  lines.push(`## DOCUMENTOS DEL EXPEDIENTE (${docs.length})`)
  if (docs.length === 0) {
    lines.push('- Sin documentos vinculados.')
  } else {
    docs.slice(0, 8).forEach(d => {
      const a = analysisByDoc.get(d.id)
      lines.push(`- ${d.title}${d.doc_type ? ` [${d.doc_type}]` : ''}`)
      if (d.content_markdown) lines.push(`  Extracto: ${d.content_markdown.slice(0, 400)}`)
      if (a?.content) {
        lines.push(`  Análisis IA: riesgo ${a.content.risk_level ?? 'n/d'} · ${(a.content.summary ?? '').slice(0, 200)}`)
      }
    })
  }
  lines.push('')
  lines.push('Eres LEXIA, asistente jurídico del abogado para ESTE EXPEDIENTE CONCRETO. Tienes acceso completo al contexto y documentos del caso. Responde en español formal jurídico con referencias normativas exactas cuando sea pertinente (ej: art. 59.3 ET). No inventes datos que no estén en el contexto.')
  return lines.join('\n')
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    // Validar API key antes de procesar
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes('REEMPLAZA')) {
      return NextResponse.json({ error: 'Servicio IA no configurado. Contacta al administrador.' }, { status: 503 })
    }

    // Rate limit: 30 msgs/min por usuario
    const rl = checkRateLimit(`chat:${session.user.id}`, LIMITS.CHAT)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Demasiadas peticiones. Espera ${Math.ceil((rl.resetAt - Date.now()) / 1000)}s.` },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      )
    }

    const body = await req.json()
    const message = sanitizeText(body.message)
    if (!message?.trim()) throw new ValidationError('Mensaje vacío')
    if (message.length > MAX_MESSAGE_LENGTH) throw new ValidationError(`Mensaje demasiado largo (máximo ${MAX_MESSAGE_LENGTH} caracteres)`)

    let conversationId: string | null = null
    if (body.conversationId && body.conversationId !== 'null') {
      conversationId = validateUUID(body.conversationId)
    }

    // optional — scope context to one client or one case (caseId takes priority)
    const clientId = body.clientId && typeof body.clientId === 'string' ? body.clientId : null
    const caseId = body.caseId && typeof body.caseId === 'string' ? body.caseId : null

    const supabase = IS_DEV_WITHOUT_DB ? null : createServerClient()

    // ── Demo mode: in-memory conversation store ──────────────────────
    let demoConvId: string | null = body.conversation_id || null
    if (IS_DEV_WITHOUT_DB) {
      const { DEMO_CONVERSATIONS, createDemoConversation, addDemoMessage } = await import('@/lib/dev/demo-data')
      if (!demoConvId || !DEMO_CONVERSATIONS.find(c => c.id === demoConvId)) {
        const conv = createDemoConversation(message, clientId)
        demoConvId = conv.id
      }
      // history from demo store
      const demoConv = DEMO_CONVERSATIONS.find(c => c.id === demoConvId)!
      const history = demoConv.messages.slice(-MAX_HISTORY)
      const messages = [
        ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user' as const, content: message },
      ]
      addDemoMessage(demoConvId, 'user', message)
      // Persist user message immediately
      const demoConvNow = DEMO_CONVERSATIONS.find(c => c.id === demoConvId)
      if (demoConvNow) upsertConversation(demoConvNow)

      // ── Context block + búsqueda en paralelo ──
      const [contextBlock, searchCtx] = await Promise.all([
        (async () => {
          if (caseId) return buildCaseContextBlock(caseId, null)
          if (clientId) return buildClientContextBlock(clientId, null)
          const data = await getDespachoData(session.user.id, session.user.name ?? session.user.email ?? 'Letrado', session.user.email ?? '', null)
          return buildDespachoContext(data)
        })(),
        shouldSearch(message) ? searchLegalSources(message, { limit: 5, timeout: 3500 }) : Promise.resolve(null),
      ])

      // Combina contexto del cliente + resultados de búsqueda en tiempo real
      const liveSearchBlock = searchCtx ? formatForClaude(searchCtx) : null

      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          let fullResponse = ''
          try {
            // Notify UI if live search was used
            if (liveSearchBlock && searchCtx && searchCtx.results.length > 0) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'searching', sources: searchCtx.sourcesSearched, count: searchCtx.results.length })}

`))
            }
            const extraBlocks = [
              ...(contextBlock ? [{ text: contextBlock, cache: true }] : []),
              ...(liveSearchBlock ? [{ text: liveSearchBlock, cache: false }] : []),
            ]
            const streamObj = streamClaudeAPI(SYSTEM_PROMPT_LEGAL_CHAT, messages, { maxTokens: 4000, extraSystemBlocks: extraBlocks.length > 0 ? extraBlocks : undefined })
            for await (const event of streamObj) {
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                fullResponse += event.delta.text
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`))
              }
            }
            addDemoMessage(demoConvId!, 'assistant', fullResponse)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', conversation_id: demoConvId, cost_eur_cents: 0 })}\n\n`))
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`))
          } finally {
            controller.close()
          }
        },
      })
      return new Response(readable, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' } }) as unknown as import('next/server').NextResponse
    }
    // ── End demo mode ─────────────────────────────────────────────────

    // Create conversation if needed, verify ownership if provided
    let convId = conversationId
    if (supabase) {
      if (!convId) {
        const { data: conv } = await supabase
          .from('chat_conversations')
          .insert({ user_id: session.user.id, title: message.slice(0, 60) })
          .select()
          .single()
        convId = conv?.id ?? null
      } else {
        const { data: convCheck } = await supabase
          .from('chat_conversations')
          .select('id')
          .eq('id', convId)
          .eq('user_id', session.user.id)
          .single()
        if (!convCheck) throw new ValidationError('Conversación no encontrada')
      }
    }

    // Recover history (last MAX_HISTORY messages)
    let history: Array<{ role: string; content: string }> = []
    if (supabase && convId) {
      const { data } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: false })
        .limit(MAX_HISTORY)
      history = data ?? []
    }

    const messages = [
      ...history.reverse().map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: message },
    ]

    // Save user message (real mode only)
    if (supabase && convId) {
      await supabase.from('chat_messages').insert({
        conversation_id: convId,
        role: 'user',
        content: message,
        tokens_output: 0,
      })
    }

    await auditLog({
      userId: session.user.id,
      action: 'CHAT_MESSAGE',
      resourceType: 'conversation',
      resourceId: convId ?? undefined,
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    })

    // ── Context block: case > client > global despacho
    let contextBlock: string | null = null
    if (caseId) {
      contextBlock = await buildCaseContextBlock(caseId, supabase)
    } else if (clientId) {
      contextBlock = await buildClientContextBlock(clientId, supabase)
    } else {
      const data = await getDespachoData(
        session.user.id,
        session.user.name ?? session.user.email ?? 'Letrado',
        session.user.email ?? '',
        supabase,
      )
      contextBlock = buildDespachoContext(data)
    }

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = ''
        try {
          // streamClaudeAPI takes the base system prompt as string and accepts
          // optional extraSystemBlocks (cacheable). Cast to array breaks Anthropic.
          const extraBlocks = contextBlock
            ? [{ text: contextBlock, cache: true }]
            : undefined

          const streamObj = streamClaudeAPI(
            SYSTEM_PROMPT_LEGAL_CHAT,
            messages,
            { maxTokens: 4000, extraSystemBlocks: extraBlocks },
          )

          for await (const event of streamObj) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              fullResponse += event.delta.text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`))
            }
          }

          const finalMessage = await streamObj.finalMessage()
          const outputTokens = finalMessage.usage.output_tokens
          const cacheRead = (finalMessage.usage as unknown as Record<string, number>).cache_read_input_tokens || 0
          const costCents = Math.round(
            ((finalMessage.usage.input_tokens / 1_000_000) * 0.80 +
              (outputTokens / 1_000_000) * 4.00 +
              (cacheRead / 1_000_000) * 0.08) * 0.92 * 100
          )

          if (supabase && convId) {
            await supabase.from('chat_messages').insert({
              conversation_id: convId,
              role: 'assistant',
              content: fullResponse,
              tokens_output: outputTokens,
            })
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', conversation_id: convId, cost_eur_cents: costCents })}\n\n`))
        } catch (err) {
          console.error('[chat] stream error:', err)
          const msg = err instanceof Error ? err.message : String(err)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    }) as unknown as NextResponse
  })
}

export async function GET() {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    if (IS_DEV_WITHOUT_DB) {
      return NextResponse.json({ conversations: [] })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('id, title, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw new Error(error.message)
    return NextResponse.json({ conversations: data })
  })
}
