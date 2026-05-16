// Sanitización centralizada — OWASP A03:2021 Injection Prevention

/**
 * Escapa caracteres HTML peligrosos para prevenir XSS.
 * Usar en cualquier dato de usuario que se renderice en el DOM.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Elimina caracteres de control y normaliza espacios.
 * Aplicar a todos los inputs de texto antes de guardar en DB.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10000) // límite absoluto
}

/**
 * Valida y sanitiza un email.
 */
export function sanitizeEmail(input: unknown): string {
  const raw = sanitizeText(input)
  const emailRe = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  if (!emailRe.test(raw) || raw.length > 254) throw new Error('Email no válido')
  return raw.toLowerCase()
}

/**
 * Valida que un string sea un UUID v4 válido.
 * Usar para todos los IDs de recursos antes de queries DB.
 */
export function validateUUID(input: unknown): string {
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (typeof input !== 'string' || !uuidRe.test(input)) {
    throw new Error('ID no válido')
  }
  return input
}

/**
 * Sanitiza un objeto JSON eliminando claves con valores potencialmente peligrosos.
 * Límite: 50 claves, profundidad 3.
 */
export function sanitizeObject(
  obj: unknown,
  depth = 0,
  maxDepth = 3
): Record<string, unknown> {
  if (depth > maxDepth || typeof obj !== 'object' || obj === null) return {}
  const result: Record<string, unknown> = {}
  const entries = Object.entries(obj as Record<string, unknown>).slice(0, 50)
  for (const [key, val] of entries) {
    const safeKey = sanitizeText(key).slice(0, 100)
    if (typeof val === 'string') result[safeKey] = sanitizeText(val)
    else if (typeof val === 'number') result[safeKey] = Number.isFinite(val) ? val : 0
    else if (typeof val === 'boolean') result[safeKey] = val
    else if (typeof val === 'object') result[safeKey] = sanitizeObject(val, depth + 1, maxDepth)
  }
  return result
}

/**
 * Verifica que un Content-Type sea seguro para APIs JSON.
 */
export function requireJsonContentType(req: Request): void {
  const ct = req.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    throw new Error('Content-Type debe ser application/json')
  }
}

/**
 * Valida que el origen de la petición sea permitido (anti-CSRF para APIs).
 */
export function validateOrigin(req: Request): void {
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  if (!origin) return // Same-origin requests no envían Origin
  try {
    const originHost = new URL(origin).host
    if (originHost !== host) {
      throw new Error(`Origen no permitido: ${originHost}`)
    }
  } catch {
    throw new Error('Origen de petición inválido')
  }
}
