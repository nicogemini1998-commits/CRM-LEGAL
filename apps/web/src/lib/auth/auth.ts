import { decode } from 'next-auth/jwt'
import { cookies } from 'next/headers'

export async function auth() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('iuralex.session-token')?.value

    if (!token) return null

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) throw new Error('NEXTAUTH_SECRET required')
    const decoded = await decode({ token, secret })

    if (!decoded || !decoded.sub) return null

    return {
      user: {
        id: (decoded.id as string) || decoded.sub,
        email: (decoded.email as string) || '',
        name: (decoded.name as string) || null,
        role: (decoded.role as string) || 'lawyer',
      },
      expires: new Date((decoded.exp as number) * 1000).toISOString(),
    }
  } catch {
    return null
  }
}
