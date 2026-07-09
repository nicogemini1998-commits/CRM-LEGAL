import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { uploadDocument } from '@/lib/storage'
import { validateUploadedFile, generateSafeFilename } from '@/lib/security/fileValidation'
import { sanitizeText, validateUUID } from '@/lib/security/sanitize'
import { withErrorHandler, ValidationError, UnauthorizedError } from '@/lib/security/apiResponse'
import { auditLog } from '@/lib/security/gdpr'

const IS_DEV_WITHOUT_DB = process.env.NEXT_PUBLIC_DEMO_MODE === '1' || !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    if (IS_DEV_WITHOUT_DB) {
      const { DEMO_DOCUMENTS, DEMO_CASES, DEMO_CLIENTS } = await import('@/lib/dev/demo-data')
      const clientId = req.nextUrl.searchParams.get('clientId')
      const caseClientMap = new Map(DEMO_CASES.map(c => [c.id, c.client_id]))
      const clientNameMap = new Map(DEMO_CLIENTS.map(c => [c.id, c.name]))
      const enriched = DEMO_DOCUMENTS.map(d => {
        const cid = (d as any).client_id || (d.case_id ? caseClientMap.get(d.case_id) ?? null : null)
        return { ...d, client_id: cid, client_name: cid ? clientNameMap.get(cid) ?? null : null }
      })
      const filtered = clientId ? enriched.filter(d => d.client_id === clientId) : enriched
      return NextResponse.json({ documents: filtered })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, document_type, confidential, created_at, storage_path, case_id')
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw new Error(error.message)
    return NextResponse.json({ documents: data })
  })
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    // Validar Content-Type
    const ct = req.headers.get('content-type') || ''
    if (!ct.includes('multipart/form-data')) {
      throw new ValidationError('Se requiere multipart/form-data')
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const rawTitle = formData.get('title')
    const rawDocType = formData.get('document_type')
    const rawCaseId = formData.get('case_id')
    const confidential = formData.get('confidential') === 'true'

    if (!file) throw new ValidationError('Archivo requerido')

    // Sanitizar inputs
    const title = sanitizeText(rawTitle)
    if (!title || title.length < 2) throw new ValidationError('Título inválido (mínimo 2 caracteres)')
    if (title.length > 255) throw new ValidationError('Título demasiado largo (máximo 255 caracteres)')

    const allowedTypes = ['contract', 'brief', 'motion', 'other']
    const docType = sanitizeText(rawDocType)
    if (!allowedTypes.includes(docType)) throw new ValidationError('Tipo de documento no válido')

    const rawClientId = formData.get('client_id')
    let clientId: string | null = null
    if (rawClientId && typeof rawClientId === 'string' && rawClientId !== 'null') {
      clientId = rawClientId // validated shape, not UUID-enforced for demo

    }

    let caseId: string | null = null
    if (rawCaseId && typeof rawCaseId === 'string' && rawCaseId !== 'null') {
      caseId = IS_DEV_WITHOUT_DB ? rawCaseId : validateUUID(rawCaseId)
      if (!IS_DEV_WITHOUT_DB) {
        const supabase = createServerClient()
        const { data: caseCheck } = await supabase
          .from('cases').select('id').eq('id', caseId).eq('user_id', session.user.id).single()
        if (!caseCheck) throw new ValidationError('Caso no encontrado')
      }
    }

    // Demo mode: parsear archivo + insertar en memoria + encolar análisis IA
    if (IS_DEV_WITHOUT_DB) {
      const { DEMO_DOCUMENTS, enqueueDemoAnalysis } = await import('@/lib/dev/demo-data')
      const newId = `auto-doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      let content_markdown: string | null = null
      try {
        const ext = (file.name.split('.').pop() || '').toLowerCase()
        if (ext === 'txt') {
          content_markdown = await file.text()
        } else if (ext === 'pdf') {
          // Polyfill DOMMatrix para Node.js (pdf-parse lo usa en detección de entorno de test)
          if (typeof (globalThis as any).DOMMatrix === 'undefined') {
            (globalThis as any).DOMMatrix = class DOMMatrix { constructor() {} }
          }
          const { default: pdfParse } = await import('pdf-parse' as any)
          const buffer = Buffer.from(await file.arrayBuffer())
          const parsed = await pdfParse(buffer)
          content_markdown = parsed.text || null
        }
      } catch (e) { console.error('[doc-upload] parse failed:', e instanceof Error ? e.message : e) }
      const newDoc = {
        id: newId,
        user_id: session.user.id,
        case_id: caseId,
        client_id: clientId,
        title,
        document_type: docType,
        file_type: (file.name.split('.').pop() || 'pdf').toLowerCase(),
        confidential,
        storage_path: null as string | null,
        file_hash: null as string | null,
        deleted_at: null as string | null,
        content_markdown,
        created_at: new Date().toISOString(),
      }
      ;(DEMO_DOCUMENTS as unknown as Array<typeof newDoc>).unshift(newDoc)
      // Persist uploaded document to disk
      try {
        const { appendUploadedDoc } = await import('@/lib/dev/persist')
        appendUploadedDoc(newDoc)
      } catch { /* persist optional */ }
      enqueueDemoAnalysis({
        documentId: newId,
        caseId,
        userId: session.user.id,
        title,
        documentType: docType,
      })
      return NextResponse.json({ document: newDoc, url: null, autoAnalysis: 'pending' }, { status: 201 })
    }

    // Validación completa de archivo (magic bytes, extensión, contenido)
    await validateUploadedFile(file)

    // Generar nombre seguro (nunca usar el nombre original del usuario)
    const safePath = generateSafeFilename(file.name, session.user.id)

    // Upload a Supabase Storage
    const { path, url } = await uploadDocument(file, session.user.id, safePath)

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: session.user.id,
        title,
        document_type: docType,
        storage_path: path,
        case_id: caseId,
        confidential,
      })
      .select('id, title, document_type, confidential, created_at')
      .single()

    if (error) throw new Error(error.message)

    // Auditoría RGPD
    await auditLog({
      userId: session.user.id,
      action: 'UPLOAD_DOCUMENT',
      resourceType: 'document',
      resourceId: data.id,
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    })

    // Fire-and-forget: disparar análisis IA en background (no esperamos respuesta)
    // En prod real, esto se encolaría con Inngest. Por ahora, llamada interna no-await.
    const origin = req.headers.get('origin') || `http://localhost:3000`
    const cookie = req.headers.get('cookie') || ''
    fetch(`${origin}/api/claude/analyze-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ documentId: data.id, analysisType: 'FULL' }),
    }).catch(() => { /* fire-and-forget */ })

    return NextResponse.json({ document: data, url, autoAnalysis: 'pending' }, { status: 201 })
  })
}
