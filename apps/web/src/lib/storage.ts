import { createServerClient } from '@/lib/supabase/server'

const BUCKET = 'legal-documents'

export async function uploadDocument(
  file: File,
  userId: string,
  safePath?: string
): Promise<{ path: string; url: string }> {
  const supabase = createServerClient()
  const path = safePath || `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}`

  const bytes = await file.arrayBuffer()
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
    // Metadatos mínimos — no guardar nombre original (privacidad)
    duplex: 'half',
  } as Parameters<typeof supabase.storage.from>[0] extends never ? never : object)

  if (error) throw new Error(`Error al subir archivo: ${error.message}`)

  // URL firmada con expiración de 1 hora (no URL pública permanente)
  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600)

  const url = signedData?.signedUrl || ''
  if (signedError) console.error('[Storage] No se pudo generar URL firmada:', signedError.message)

  return { path, url }
}

export async function deleteDocument(storagePath: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath])
  if (error) throw new Error(`Error al eliminar archivo: ${error.message}`)
}

export async function getDocumentSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
  const supabase = createServerClient()
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, expiresIn)
  if (error || !data?.signedUrl) throw new Error('No se pudo generar URL de acceso')
  return data.signedUrl
}

export async function getDocumentText(storagePath: string): Promise<string> {
  const supabase = createServerClient()
  const { data, error } = await supabase.storage.from(BUCKET).download(storagePath)
  if (error) throw new Error(`Error al descargar archivo: ${error.message}`)
  const text = await data.text()
  return text.slice(0, 100_000) // Límite seguro de procesamiento
}
