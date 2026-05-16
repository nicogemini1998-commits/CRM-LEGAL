import CredentialsProvider from 'next-auth/providers/credentials'
import { compare, hash } from 'bcrypt'
import { createClient } from '@supabase/supabase-js'
import { LoginSchema } from '@/lib/schemas'

// Dev mode: si Supabase no está configurado, usa credenciales locales hardcodeadas
// NUNCA usar en producción — en prod siempre usa Supabase real
const IS_DEV_WITHOUT_DB =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

// Hash de "Master123" con bcrypt salt 12 — precalculado para dev
// Se verifica con bcrypt.compare en runtime, no es bypass de seguridad
const DEV_ADMIN_HASH = '$2b$12$MyI0/f4ifgAp2znrpguP0eiDfSUkLge5kR6aRAerauoLlQcbI9kUy'

const DEV_USERS: Record<string, { id: string; email: string; password_hash: string; role: string }> = {
  'nicolas@cliender.com': {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'nicolas@cliender.com',
    password_hash: DEV_ADMIN_HASH,
    role: 'admin',
  },
}

function getSupabase() {
  if (IS_DEV_WITHOUT_DB) return null
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const parsed = LoginSchema.parse(credentials)

          // Modo dev sin DB configurada — usa usuarios locales
          if (IS_DEV_WITHOUT_DB) {
            const devUser = DEV_USERS[parsed.email.toLowerCase()]
            if (!devUser) throw new Error('Usuario no encontrado')
            const match = await compare(parsed.password, devUser.password_hash)
            if (!match) throw new Error('Contraseña incorrecta')
            return { id: devUser.id, email: devUser.email, role: devUser.role, name: 'Nicolas — Cliender' }
          }

          // Producción — usa Supabase
          const supabase = getSupabase()!
          const { data: user, error } = await supabase
            .from('users')
            .select('id, email, password_hash, role')
            .eq('email', parsed.email.toLowerCase())
            .single()

          if (error || !user) throw new Error('Usuario no encontrado')

          const passwordMatch = await compare(parsed.password, user.password_hash)
          if (!passwordMatch) throw new Error('Contraseña incorrecta')

          return { id: user.id, email: user.email, role: user.role }
        } catch (err) {
          // Nunca exponer detalles internos al cliente
          const msg = err instanceof Error ? err.message : 'Error de autenticación'
          if (msg === 'Usuario no encontrado' || msg === 'Contraseña incorrecta') {
            throw new Error('Credenciales incorrectas')
          }
          console.error('[Auth] Error interno:', msg)
          throw new Error('Error de autenticación. Inténtalo de nuevo.')
        }
      },
    }),
  ],

  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.name = user.name
      }
      return token
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        if (token.name) session.user.name = token.name as string
      }
      return session
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user }: any) {
      try {
        if (!IS_DEV_WITHOUT_DB) {
          const supabase = getSupabase()
          await supabase?.from('audit_logs').insert({
            user_id: user.id,
            action: 'LOGIN',
            resource_type: 'session',
            resource_id: user.id,
          })
        }
        return true
      } catch {
        return true // Fallo de auditoría nunca bloquea el login
      }
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60,
        path: '/',
      },
    },
  },

  pages: {
    signIn: '/login',
  },
}
