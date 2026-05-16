import { StorageProvider_Base, StorageAuth, StorageFile, GoogleDriveAuth } from '../types'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const GOOGLE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/storage/auth/google/callback`
const GOOGLE_API_BASE = 'https://www.googleapis.com'
const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export class GoogleDriveProvider implements StorageProvider_Base {
  name: 'google_drive' = 'google_drive'

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
    ]

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    })

    return `${GOOGLE_OAUTH_URL}?${params.toString()}`
  }

  async authorize(code: string): Promise<GoogleDriveAuth> {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_REDIRECT_URI,
    })

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      body: params.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (!response.ok) throw new Error('Failed to authorize Google Drive')

    const data = await response.json()

    // Get user info
    const userRes = await fetch(`${GOOGLE_API_BASE}/oauth2/v2/userinfo?access_token=${data.access_token}`)
    const userInfo = await userRes.json()

    return {
      provider: 'google_drive',
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      userId: userInfo.id,
      scope: ['drive.file', 'userinfo.email'],
    }
  }

  async refreshToken(refreshToken: string): Promise<GoogleDriveAuth> {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    })

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      body: params.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (!response.ok) throw new Error('Failed to refresh Google Drive token')

    const data = await response.json()

    return {
      provider: 'google_drive',
      accessToken: data.access_token,
      refreshToken: refreshToken, // May be undefined if not returned
      expiresAt: Date.now() + data.expires_in * 1000,
      userId: '', // Will be set from context
      scope: ['drive.file', 'userinfo.email'],
    }
  }

  async listFiles(accessToken: string, folderId: string = 'root'): Promise<StorageFile[]> {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed=false`,
      pageSize: '100',
      spaces: 'drive',
      fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink)',
    })

    const response = await fetch(`${GOOGLE_API_BASE}/drive/v3/files?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) throw new Error('Failed to list Google Drive files')

    const data = await response.json()

    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
      mimeType: file.mimeType,
      size: file.size,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      provider: 'google_drive',
    }))
  }

  async uploadFile(
    accessToken: string,
    file: Buffer,
    fileName: string,
    folderId: string = 'root'
  ): Promise<StorageFile> {
    // Google Drive uses multipart upload
    const boundary = '===============7330845974216740156=='
    const metadata = {
      name: fileName,
      parents: [folderId],
    }

    const body = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      `--${boundary}`,
      'Content-Type: application/octet-stream',
      '',
    ]
      .join('\n')
      .concat('\n')
      .concat(file.toString('binary'))
      .concat(`\n--${boundary}--`)

    const response = await fetch(`${GOOGLE_API_BASE}/upload/drive/v3/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body,
    })

    if (!response.ok) throw new Error('Failed to upload file to Google Drive')

    const data = await response.json()

    return {
      id: data.id,
      name: data.name,
      type: 'file',
      mimeType: data.mimeType,
      size: data.size,
      modifiedTime: data.modifiedTime,
      webViewLink: data.webViewLink,
      provider: 'google_drive',
    }
  }

  async shareFile(accessToken: string, fileId: string, emails: string[]): Promise<boolean> {
    for (const email of emails) {
      const body = JSON.stringify({
        role: 'reader',
        type: 'user',
        emailAddress: email,
      })

      const response = await fetch(`${GOOGLE_API_BASE}/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body,
      })

      if (!response.ok) return false
    }

    return true
  }

  async downloadFile(accessToken: string, fileId: string): Promise<Buffer> {
    const response = await fetch(
      `${GOOGLE_API_BASE}/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (!response.ok) throw new Error('Failed to download file from Google Drive')

    return Buffer.from(await response.arrayBuffer())
  }
}
