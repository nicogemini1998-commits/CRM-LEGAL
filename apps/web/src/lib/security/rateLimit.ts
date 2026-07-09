// Rate limiting en memoria — per-user, sliding window
// Producción: reemplazar con Redis (Upstash o similar)

interface RLWindow { count: number; resetAt: number }
const store = new Map<string, RLWindow>()

export interface RateLimitConfig { maxRequests: number; windowMs: number }
export interface RateLimitResult { allowed: boolean; remaining: number; resetAt: number }

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs }
  }

  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count++
  return { allowed: true, remaining: config.maxRequests - existing.count, resetAt: existing.resetAt }
}

export const LIMITS = {
  CHAT:              { maxRequests: 30, windowMs: 60_000 },
  DOCUMENT_UPLOAD:   { maxRequests: 10, windowMs: 60_000 },
  DOCUMENT_ANALYSIS: { maxRequests: 20, windowMs: 60_000 },
}
