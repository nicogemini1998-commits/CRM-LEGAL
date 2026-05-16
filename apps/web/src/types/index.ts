export type UserRole = 'admin' | 'lawyer' | 'support' | 'client'

export interface User {
  id: string
  email: string
  role: UserRole
}

export interface Case {
  id: string
  title: string
  description?: string
  status: 'open' | 'closed' | 'archived'
  case_number?: string
  client_id?: string
  created_at: string
}

export interface Document {
  id: string
  title: string
  document_type: 'contract' | 'brief' | 'motion' | 'other'
  case_id?: string
  storage_path?: string
  confidential: boolean
  created_at: string
}

export interface DocumentAnalysis {
  id: string
  document_id: string
  analysis_type: 'FULL' | 'QUICK' | 'RISK_ONLY'
  content: Record<string, any>
  tokens_input: number
  tokens_output: number
  tokens_cache: number
  created_at: string
}

export interface ChatConversation {
  id: string
  user_id: string
  case_id?: string
  title?: string
  created_at: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  tokens_output: number
  created_at: string
}

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  type: 'individual' | 'company'
  created_at: string
}
