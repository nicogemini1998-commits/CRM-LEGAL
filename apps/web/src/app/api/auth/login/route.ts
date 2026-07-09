import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcrypt'
import { encode } from 'next-auth/jwt'
import { createClient } from '@supabase/supabase-js'

const IS_DEV_WITHOUT_DB = process.env.NEXT_PUBLIC_DEMO_MODE === '1' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

const DEV_ADMIN_HASH = '$2b$12$xDyF71bm8bbPYt1nHoWNbOjZFwKGKENxuWl/snnaNLRtF5Tb.q3rm'

const DEV_USERS: Record<string, { id: string; email: string; name: string; password_hash: string; role: string }> = {
  'nicolas@cliender.com': {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'nicolas@cliender.com',
    name: 'Nicolas — Cliender',
    password_hash: DEV_ADMIN_HASH,
    role: 'Admin',
  },
  'socio@iuralex.es': {
    id: '00000000-0000-0000-0000-000000000010',
    email: 'socio@iuralex.es',
    name: 'Luis Roca — Socio fundador',
    password_hash: DEV_ADMIN_HASH,
    role: 'Socio',
  },
  'asociado@iuralex.es': {
    id: '00000000-0000-0000-0000-000000000011',
    email: 'asociado@iuralex.es',
    name: 'María González — Asociada senior',
    password_hash: DEV_ADMIN_HASH,
    role: 'Asociado',
  },
  'becario@iuralex.es': {
    id: '00000000-0000-0000-0000-000000000012',
    email: 'becario@iuralex.es',
    name: 'Pedro Martínez — Becario',
    password_hash: DEV_ADMIN_HASH,
    role: 'Becario',
  },
  'asistente@iuralex.es': {
    id: '00000000-0000-0000-0000-000000000013',
    email: 'asistente@iuralex.es',
    name: 'Carmen Ruiz — Asistente',
    password_hash: DEV_ADMIN_HASH,
    role: 'Asistente',
  },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Credenciales requeridas' }, { status: 400 })
    }

    let user: { id: string; email: string; name?: string; role: string } | null = null

    if (IS_DEV_WITHOUT_DB) {
      const devUser = DEV_USERS[email.toLowerCase()]
      if (!devUser) {
        return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
      }
      const match = await compare(password, devUser.password_hash)
      if (!match) {
        return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
      }
      user = { id: devUser.id, email: devUser.email, name: devUser.name, role: devUser.role }
    } else {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data, error } = await supabase
        .from('users')
        .select('id, email, password_hash, role')
        .eq('email', email.toLowerCase())
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
      }

      const match = await compare(password, data.password_hash)
      if (!match) {
        return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
      }

      user = { id: data.id, email: data.email, role: data.role }
    }

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret || secret.length < 32) throw new Error('NEXTAUTH_SECRET required (min 32 chars)')
    const token = await encode({
      token: {
        sub: user.id,
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      },
      secret,
    })

    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
    res.cookies.set('iuralex.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/',
    })

    return res
  } catch {
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 })
  }
}
