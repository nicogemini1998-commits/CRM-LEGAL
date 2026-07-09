import { NextResponse } from 'next/server'

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {}
  const issues: string[] = []

  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key.length < 20 || key.includes('REEMPLAZA')) {
    checks.anthropic = 'error'
    issues.push('ANTHROPIC_API_KEY no configurada o inválida — Lexia no funcionará')
  } else {
    checks.anthropic = 'ok'
  }

  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === '1'
  checks.persistence = isDemo ? 'error' : 'ok'
  if (isDemo) issues.push('DEMO_MODE activo — datos en memoria sin persistencia')

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supaUrl || supaUrl.includes('placeholder')) {
    checks.database = 'error'
    issues.push('Supabase no configurado')
  } else {
    checks.database = 'ok'
  }

  const allOk = Object.values(checks).every(v => v === 'ok')
  return NextResponse.json(
    { status: allOk ? 'healthy' : 'degraded', checks, issues, ts: new Date().toISOString() },
    { status: allOk ? 200 : 207 }
  )
}
