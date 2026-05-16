import { NextRequest, NextResponse } from 'next/server'

// ─── Rutas protegidas ───────────────────────────────────────────────────────
const PROTECTED = ['/dashboard', '/cases', '/documents', '/clients', '/generate', '/chat', '/settings', '/admin']
const AUTH_ROUTES = ['/login', '/register']
const API_PROTECTED = ['/api/documents', '/api/cases', '/api/clients', '/api/claude', '/api/skills', '/api/storage']

// ─── Rate limiting en memoria (Edge-compatible) ─────────────────────────────
// En producción: reemplazar por Upstash Redis con @upstash/ratelimit
const rateLimitMap = new Map<string, { count: number; reset: number }>()

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

// Limpiar entradas expiradas cada 100 requests para evitar memory leak
let cleanupCounter = 0
function cleanupRateLimit() {
  if (++cleanupCounter % 100 !== 0) return
  const now = Date.now()
  for (const [key, val] of rateLimitMap) {
    if (now > val.reset) rateLimitMap.delete(key)
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') || '127.0.0.1'

  cleanupRateLimit()

  // ─── Rate limiting ────────────────────────────────────────────────────────
  // API Claude + Skills: 20 req/min (protege costes de IA)
  if (pathname.startsWith('/api/claude') || pathname.startsWith('/api/skills/execute')) {
    if (!rateLimit(`claude:${ip}`, 20, 60_000)) {
      return new NextResponse(
        JSON.stringify({ error: 'Demasiadas solicitudes. Espera un momento.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
      )
    }
  }

  // API general: 100 req/min
  if (pathname.startsWith('/api/')) {
    if (!rateLimit(`api:${ip}`, 100, 60_000)) {
      return new NextResponse(
        JSON.stringify({ error: 'Demasiadas solicitudes.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
      )
    }
  }

  // Auth endpoints: 10 intentos/15 min (anti-brute force)
  if (pathname.startsWith('/api/auth')) {
    if (!rateLimit(`auth:${ip}`, 10, 15 * 60_000)) {
      return new NextResponse(
        JSON.stringify({ error: 'Demasiados intentos. Espera 15 minutos.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '900' } }
      )
    }
  }

  // ─── Auth check ──────────────────────────────────────────────────────────
  const sessionToken = request.cookies.get('iuralex.session-token')?.value

  const isProtected = PROTECTED.some(r => pathname.startsWith(r)) ||
    API_PROTECTED.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))

  if (isProtected && !sessionToken) {
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // ─── Security headers (OWASP 2025) ───────────────────────────────────────
  const response = NextResponse.next()
  const h = response.headers

  // HSTS — fuerza HTTPS, 1 año
  h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  // Previene clickjacking
  h.set('X-Frame-Options', 'DENY')

  // Previene MIME sniffing
  h.set('X-Content-Type-Options', 'nosniff')

  // XSS auditor legacy
  h.set('X-XSS-Protection', '1; mode=block')

  // No enviar Referer a sitios externos
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permisos de APIs del navegador
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()')

  // CSP estricto — solo permite recursos de orígenes explícitos
  const isDev = process.env.NODE_ENV === 'development'
  const csp = [
    "default-src 'self'",
    // Scripts: solo self + nonces en prod, unsafe-inline en dev para HMR
    isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self'",
    // Estilos: unsafe-inline necesario para Tailwind
    "style-src 'self' 'unsafe-inline'",
    // Imágenes
    "img-src 'self' data: blob: https:",
    // Fuentes
    "font-src 'self' data:",
    // Conexiones API — solo Supabase y Anthropic
    "connect-src 'self' https://*.supabase.co https://*.supabase.io wss://*.supabase.co",
    // Frames: ninguno
    "frame-src 'none'",
    "frame-ancestors 'none'",
    // Workers
    "worker-src 'self' blob:",
    // Manifests
    "manifest-src 'self'",
    // Base URI
    "base-uri 'self'",
    // Solo enviar formularios a self
    "form-action 'self'",
    // Evitar upgrades mixtos
    'upgrade-insecure-requests',
  ].join('; ')

  h.set('Content-Security-Policy', csp)

  // CORS — solo para API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'https://lexia-os.vercel.app',
    ]
    if (origin && allowedOrigins.includes(origin)) {
      h.set('Access-Control-Allow-Origin', origin)
      h.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      h.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      h.set('Access-Control-Max-Age', '86400')
    }
    // Bloquear CORS preflight de orígenes no permitidos
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: h })
    }
  }

  // Cache — no cachear páginas protegidas
  if (isProtected || pathname.startsWith('/api/')) {
    h.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    h.set('Pragma', 'no-cache')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
