/**
 * POST /api/documents/parse
 *
 * Accepts a multipart form upload (PDF / DOCX / TXT).
 * Returns the parsed Markdown + metadata for AI processing.
 * The original file buffer is NOT stored here — caller saves it separately.
 *
 * Body: FormData { file: File, returnFormat?: 'markdown' | 'json' }
 * Response: ParsedDocument JSON
 */

import { NextRequest, NextResponse } from 'next/server'
import { parseBuffer } from '@/lib/document-parser'

const MAX_BYTES = 25 * 1024 * 1024 // 25 MB

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
])

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `Archivo demasiado grande (máx. 25 MB)` }, { status: 413 })
    }

    const mimeType = file.type || 'application/octet-stream'
    if (
      !ALLOWED_TYPES.has(mimeType) &&
      !file.name.endsWith('.pdf') &&
      !file.name.endsWith('.docx') &&
      !file.name.endsWith('.txt')
    ) {
      return NextResponse.json(
        { error: 'Formato no soportado. Use PDF, DOCX o TXT.' },
        { status: 415 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const parsed = await parseBuffer(buffer, mimeType, file.name)

    return NextResponse.json({
      success: true,
      filename: file.name,
      size: file.size,
      mimeType,
      ...parsed,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al procesar el documento'
    console.error('[parse] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
