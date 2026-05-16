import { NextRequest, NextResponse } from 'next/server'
import { GoogleDriveProvider } from '@/lib/storage/providers/google-drive'

export async function GET(request: NextRequest) {
  try {
    const provider = new GoogleDriveProvider()
    const authUrl = provider.getAuthUrl()

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Google OAuth authorize error:', error)
    return NextResponse.json(
      { error: 'Failed to get authorization URL' },
      { status: 500 }
    )
  }
}
