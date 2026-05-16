import { NextRequest, NextResponse } from 'next/server'
import { GoogleDriveProvider } from '@/lib/storage/providers/google-drive'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/documents?error=${error}&error_description=${searchParams.get('error_description')}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(new URL('/documents?error=missing_code', request.url))
    }

    // Authorize with Google
    const provider = new GoogleDriveProvider()
    const auth = await provider.authorize(code)

    // Store auth in database (encrypted)
    // TODO: Implement database storage with encryption
    // For now, return success redirect
    const redirectUrl = new URL('/documents', request.url)
    redirectUrl.searchParams.set('storage', 'google_drive')
    redirectUrl.searchParams.set('auth', 'success')

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/documents?error=callback_failed', request.url)
    )
  }
}
