import { NextResponse } from 'next/server'

// Legacy next-auth route — disabled. Auth is handled by /api/auth/login, /api/auth/session, /api/auth/logout
export async function GET() {
  return NextResponse.json({ error: 'Endpoint not available' }, { status: 404 })
}

export async function POST() {
  return NextResponse.json({ error: 'Endpoint not available' }, { status: 404 })
}
