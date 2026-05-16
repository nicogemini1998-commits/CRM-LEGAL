export type StorageProvider = 'google_drive' | 'dropbox' | 'onedrive'

export interface StorageFile {
  id: string
  name: string
  type: 'file' | 'folder'
  mimeType?: string
  size?: number
  modifiedTime?: string
  webViewLink?: string
  provider: StorageProvider
}

export interface StorageAuth {
  provider: StorageProvider
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  userId: string
}

export interface StorageProvider_Base {
  name: StorageProvider
  authorize(code: string): Promise<StorageAuth>
  refreshToken(refreshToken: string): Promise<StorageAuth>
  listFiles(accessToken: string, folderId?: string): Promise<StorageFile[]>
  uploadFile(
    accessToken: string,
    file: Buffer,
    fileName: string,
    folderId?: string
  ): Promise<StorageFile>
  shareFile(
    accessToken: string,
    fileId: string,
    emails: string[]
  ): Promise<boolean>
  downloadFile(accessToken: string, fileId: string): Promise<Buffer>
  getAuthUrl(): string
}

export interface GoogleDriveAuth extends StorageAuth {
  provider: 'google_drive'
  scope: string[]
}

export interface DropboxAuth extends StorageAuth {
  provider: 'dropbox'
}

export interface OneDriveAuth extends StorageAuth {
  provider: 'onedrive'
}
