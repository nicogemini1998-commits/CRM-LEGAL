// Persistencia JSON para demo mode — datos sobreviven reinicios del contenedor
// Lee/escribe en DEMO_DATA_DIR (variable de entorno, por defecto /tmp/iuralex-data)
// En producción con Supabase real este módulo no se usa.

import fs from 'fs'
import path from 'path'

const DATA_DIR = process.env.DEMO_DATA_DIR || '/tmp/iuralex-data'
const STORE_FILE = path.join(DATA_DIR, 'demo-store.json')

interface PersistedStore {
  conversations: unknown[]
  uploadedDocuments: unknown[]
  version: number
}

function ensureDir(): void {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }) } catch {}
}

export function readStore(): PersistedStore {
  ensureDir()
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as PersistedStore
  } catch {
    return { conversations: [], uploadedDocuments: [], version: 1 }
  }
}

function writeStore(store: PersistedStore): void {
  ensureDir()
  try { fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8') }
  catch (e) { console.error('[persist] write failed:', e instanceof Error ? e.message : e) }
}

export function upsertConversation(conv: unknown): void {
  const store = readStore()
  const list = store.conversations as Array<Record<string, unknown>>
  const id = (conv as Record<string, unknown>).id
  const idx = list.findIndex(c => c.id === id)
  if (idx >= 0) list[idx] = conv as Record<string, unknown>; else list.unshift(conv as Record<string, unknown>)
  writeStore({ ...store, conversations: list })
}

export function removeConversation(convId: string): void {
  const store = readStore()
  store.conversations = (store.conversations as Array<{ id: string }>).filter(c => c.id !== convId)
  writeStore(store)
}

export function clearConversations(): void {
  const store = readStore()
  writeStore({ ...store, conversations: [] })
}

export function appendUploadedDoc(doc: unknown): void {
  const store = readStore()
  ;(store.uploadedDocuments as unknown[]).unshift(doc)
  writeStore(store)
}
