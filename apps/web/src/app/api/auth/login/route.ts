import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcrypt'
import { encode } from 'next-auth/jwt'
import { createClient } from '@supabase/supabase-js'

const IS_DEV_WITHOUT_DB =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

const DEV_ADMIN_HASH = '$2b$12$MyI0/f4ifgAp2znrpguP0eiDfSUkLge5kR6aRAerauoLlQcbI9kUy'

const DEV_USERS: Record<string, { id: string; email: string; name: string; password_hash: string; role: string }> = {
  'nicolas@cliender.com': {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'nicolas@cliender.com',
    name: 'Nicolas — Cliender',
    password_hash: DEV_ADMIN_HASH,
    role: 'admin',
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

    const secret = process.env.NEXTAUTH_SECRET || 'dev-secret-iuralex-jwt-2025-minimum-32-chars'
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
