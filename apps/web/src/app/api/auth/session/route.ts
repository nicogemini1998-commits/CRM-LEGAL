import { NextRequest, NextResponse } from 'next/server'
import { decode } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('iuralex.session-token')?.value
    if (!token) {
      return NextResponse.json({ user: null })
    }

    const secret = process.env.NEXTAUTH_SECRET || 'dev-secret-iuralex-jwt-2025-minimum-32-chars'
    const decoded = await decode({ token, secret })

    if (!decoded || !decoded.sub) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: decoded.id as string || decoded.sub,
        email: decoded.email as string,
        name: decoded.name as string | undefined,
        role: decoded.role as string,
      },
      expires: new Date((decoded.exp as number) * 1000).toISOString(),
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
