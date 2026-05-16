// Validación segura de archivos — OWASP A04 File Upload Security

// Magic bytes de tipos permitidos
const MAGIC_BYTES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    [0x50, 0x4B, 0x03, 0x04], // ZIP header (DOCX es ZIP)
  ],
  'text/plain': [], // Sin magic bytes — validar por extensión y contenido
}

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.txt'])
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILENAME_LENGTH = 255

// Caracteres peligrosos en nombres de archivo (path traversal, etc.)
const DANGEROUS_FILENAME_RE = /[<>:"/\\|?*\x00-\x1F]|^\.|\.\.$/

/**
 * Valida completamente un archivo subido.
 * Verifica: tamaño, extensión, nombre, magic bytes y que no sea ejecutable.
 */
export async function validateUploadedFile(file: File): Promise<void> {
  // 1. Tamaño
  if (file.size === 0) throw new Error('El archivo está vacío')
  if (file.size > MAX_FILE_SIZE) throw new Error('El archivo supera el límite de 10MB')

  // 2. Nombre de archivo
  const filename = file.name
  if (filename.length > MAX_FILENAME_LENGTH) throw new Error('Nombre de archivo demasiado largo')
  if (DANGEROUS_FILENAME_RE.test(filename)) throw new Error('Nombre de archivo contiene caracteres no permitidos')

  // 3. Extensión
  const ext = '.' + filename.split('.').pop()?.toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`Tipo de archivo no permitido. Solo PDF, DOCX o TXT`)
  }

  // 4. MIME type declarado
  const declaredMime = file.type
  const allowedMimes = Object.keys(MAGIC_BYTES)
  if (declaredMime && !allowedMimes.includes(declaredMime) && declaredMime !== 'text/plain') {
    throw new Error(`Tipo MIME no permitido: ${declaredMime}`)
  }

  // 5. Verificación de magic bytes (primeros 8 bytes del contenido real)
  if (ext === '.pdf' || ext === '.docx') {
    const slice = file.slice(0, 8)
    const buffer = await slice.arrayBuffer()
    const bytes = Array.from(new Uint8Array(buffer))

    if (ext === '.pdf') {
      const isPDF = MAGIC_BYTES['application/pdf'][0].every((b, i) => bytes[i] === b)
      if (!isPDF) throw new Error('El archivo no es un PDF válido')
    }

    if (ext === '.docx') {
      const isDOCX = MAGIC_BYTES['application/vnd.openxmlformats-officedocument.wordprocessingml.document'][0]
        .every((b, i) => bytes[i] === b)
      if (!isDOCX) throw new Error('El archivo no es un DOCX válido')
    }
  }

  // 6. Detectar intentos de polyglot / ejecutables embebidos
  if (ext === '.txt') {
    const text = await file.text()
    const dangerousPatterns = [
      /<script/i, /javascript:/i, /data:text\/html/i,
      /eval\s*\(/i, /document\.cookie/i, /window\.location/i,
    ]
    if (dangerousPatterns.some(re => re.test(text.slice(0, 2000)))) {
      throw new Error('El archivo contiene contenido potencialmente peligroso')
    }
  }
}

/**
 * Genera un nombre de archivo seguro para almacenamiento.
 * Elimina información de usuario del nombre original.
 */
export function generateSafeFilename(originalName: string, userId: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  // Nunca incluir el nombre original en el path — previene directory traversal
  return `${userId}/${timestamp}-${random}.${ext}`
}
