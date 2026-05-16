import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { createServerClient } from '@/lib/supabase/server'
import { uploadDocument } from '@/lib/storage'
import { validateUploadedFile, generateSafeFilename } from '@/lib/security/fileValidation'
import { sanitizeText, validateUUID } from '@/lib/security/sanitize'
import { withErrorHandler, ValidationError, UnauthorizedError } from '@/lib/security/apiResponse'
import { auditLog } from '@/lib/security/gdpr'

const IS_DEV_WITHOUT_DB = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const session = await auth().catch(() => null)
    if (!session?.user?.id) throw new UnauthorizedError()

    if (IS_DEV_WITHOUT_DB) {
      const { DEMO_DOCUMENTS } = await import('@/lib/dev/demo-data')
      return NextResponse.json({ documents: DEMO_DOCUMENTS })
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

    let caseId: string | null = null
    if (rawCaseId && typeof rawCaseId === 'string' && rawCaseId !== 'null') {
      caseId = validateUUID(rawCaseId)
      // Verificar que el caso pertenece al usuario
      const supabase = createServerClient()
      const { data: caseCheck } = await supabase
        .from('cases').select('id').eq('id', caseId).eq('user_id', session.user.id).single()
      if (!caseCheck) throw new ValidationError('Caso no encontrado')
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

    return NextResponse.json({ document: data, url }, { status: 201 })
  })
}
