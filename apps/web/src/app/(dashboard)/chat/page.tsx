'use client'

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const BRAND = '#8F7EE9'
const BRAND_HOVER = '#7C6BD6'
const BRAND_SOFT = 'rgba(143, 126, 233, 0.06)'
const APPLE_BG = '#F5F5F7'
const APPLE_SURFACE = '#FFFFFF'
const APPLE_DARK = '#1C1C1E'
const APPLE_GRAY = '#86868B'
const APPLE_BORDER = 'rgba(0,0,0,0.06)'
const APPLE_SHADOW = '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)'
const APPLE_SHADOW_LG = '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)'
const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'
const SF_DISPLAY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'

interface Message {
  role: 'user' | 'assistant'
  content: string
  cost_eur_cents?: number
}

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

const QUICK_PROMPTS = [
  { icon: '⚖️', title: 'Despido improcedente', desc: '¿Plazos para recurrir y la indemnización aplicable?' },
  { icon: '🛡️', title: 'RGPD y consentimiento', desc: '¿Qué exige el RGPD sobre el consentimiento?' },
  { icon: '🏢', title: 'Sociedad Limitada', desc: '¿Cómo funciona la responsabilidad limitada en una S.L.?' },
  { icon: '🏠', title: 'Contrato arrendamiento', desc: '¿Cláusulas obligatorias en un contrato de alquiler?' },
]

// Auto-link refs to BOE/CENDOJ official Spanish law sources
function linkifyLegalRefs(text: string): React.ReactNode[] {
  // Patterns: "art. 59.3 ET", "artículo 1967 CC", "Art. 458 LEC", "Ley 12/2023", "STS 735/2025"
  const LAW_MAP: Record<string, string> = {
    'CC': 'https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763',
    'Código Civil': 'https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763',
    'LEC': 'https://www.boe.es/buscar/act.php?id=BOE-A-2000-323',
    'LECrim': 'https://www.boe.es/buscar/act.php?id=BOE-A-1882-6036',
    'ET': 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430',
    'LRJS': 'https://www.boe.es/buscar/act.php?id=BOE-A-2011-15936',
    'LPACAP': 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565',
    'LJCA': 'https://www.boe.es/buscar/act.php?id=BOE-A-1998-16718',
    'LSC': 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544',
    'TRLC': 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-4859',
    'LAU': 'https://www.boe.es/buscar/act.php?id=BOE-A-1994-26003',
    'LCCI': 'https://www.boe.es/buscar/act.php?id=BOE-A-2019-3814',
    'LSE': 'https://www.boe.es/buscar/act.php?id=BOE-A-2019-2607',
    'LPI': 'https://www.boe.es/buscar/act.php?id=BOE-A-1996-8930',
    'LPRL': 'https://www.boe.es/buscar/act.php?id=BOE-A-1995-24292',
    'LGT': 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186',
    'RGPD': 'https://www.boe.es/doue/2016/119/L00001-00088.pdf',
    'LOPDGDD': 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673',
    'CP': 'https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444',
    'CE': 'https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229',
    'LOE': 'https://www.boe.es/buscar/act.php?id=BOE-A-1999-21567',
    'LCSP': 'https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902',
    'LSSI': 'https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758',
    'LCD': 'https://www.boe.es/buscar/act.php?id=BOE-A-1991-14346',
    'LAR': 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23184',
    'TRLGDCU': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555',
    'LISOS': 'https://www.boe.es/buscar/act.php?id=BOE-A-2000-14601',
    'LOI': 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6115',
    'LGSS': 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724',
    'LHL': 'https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214',
    'LIRPF': 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764',
    'LIS': 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328',
    'LIVA': 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740',
    'LITP': 'https://www.boe.es/buscar/act.php?id=BOE-A-1993-27945',
    'LISD': 'https://www.boe.es/buscar/act.php?id=BOE-A-1987-28141',
    'LMC': 'https://www.boe.es/buscar/act.php?id=BOE-A-1981-11198',
    'LOPJ': 'https://www.boe.es/buscar/act.php?id=BOE-A-1985-12666',
    'LO': 'https://www.boe.es/buscar/legislacion.php',
  }
  const codeUnion = Object.keys(LAW_MAP).sort((a, b) => b.length - a.length).join('|')
  const re = new RegExp(`\\b(art(?:\\.|ículo)\\s*\\d+(?:\\.\\d+)*(?:\\s+bis)?\\s+(${codeUnion})|Ley\\s+\\d+/\\d{4}|STS\\s+\\d+/\\d{4}|STC\\s+\\d+/\\d{4})\\b`, 'g')
  const out: React.ReactNode[] = []
  let last = 0
  let m
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const matched = m[0]
    const code = m[2]
    let url: string | null = null
    if (code && LAW_MAP[code]) url = LAW_MAP[code]
    else if (/^STS|^STC/.test(matched)) url = `https://www.poderjudicial.es/search/indexAN.jsp?q=${encodeURIComponent(matched)}`
    else if (/^Ley\s+\d+\/\d{4}/.test(matched)) url = `https://www.boe.es/buscar/legislacion.php?q=${encodeURIComponent(matched)}`
    if (url) {
      out.push(
        <a key={`l${i++}`} href={url} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 text-[#5B4FB8] hover:text-[#8F7EE9]" title="Ver en fuente oficial">{matched}</a>
      )
    } else {
      out.push(matched)
    }
    last = m.index + matched.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

// Strip markdown bold/italic, then linkify legal refs. Output plain text + emoji + auto-links.
// Render inline markdown: **bold**, `code`, plain text + legal links
function renderInline(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return tokens.map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**')) {
      const inner = tok.slice(2, -2)
      return <strong key={i} style={{ fontWeight: 650, color: 'inherit' }}>{linkifyLegalRefs(inner)}</strong>
    }
    if (tok.startsWith('`') && tok.endsWith('`')) {
      return <code key={i} style={{ fontFamily: 'monospace', fontSize: '0.85em', background: 'rgba(143,126,233,0.08)', padding: '1px 5px', borderRadius: 4, color: '#5B4FB8' }}>{tok.slice(1, -1)}</code>
    }
    return <React.Fragment key={i}>{linkifyLegalRefs(tok)}</React.Fragment>
  })
}

function LexiaText({ text, isUser }: { text: string; isUser: boolean }) {
  if (isUser) {
    return <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{text}</p>
  }

  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let numIdx = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (/^#{1,3} /.test(line)) {
      const content = line.replace(/^#{1,3} /, '')
      nodes.push(
        <p key={i} style={{ margin: i > 0 ? '14px 0 3px' : '0 0 3px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: BRAND }}>
          {content}
        </p>
      )
      numIdx = 0
      continue
    }

    const numMatch = line.match(/^(\d+)\. (.+)/)
    if (numMatch) {
      numIdx++
      nodes.push(
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 3, paddingLeft: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: BRAND, minWidth: 16, flexShrink: 0 }}>{numIdx}.</span>
          <span style={{ fontSize: 13, lineHeight: 1.65 }}>{renderInline(numMatch[2])}</span>
        </div>
      )
      continue
    }

    if (/^- /.test(line)) {
      numIdx = 0
      nodes.push(
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 3, paddingLeft: 2 }}>
          <span style={{ color: BRAND, flexShrink: 0, fontSize: 13, lineHeight: 1.65 }}>–</span>
          <span style={{ fontSize: 13, lineHeight: 1.65 }}>{renderInline(line.slice(2))}</span>
        </div>
      )
      continue
    }

    if (!line.trim()) {
      numIdx = 0
      nodes.push(<div key={i} style={{ height: 7 }} />)
      continue
    }

    numIdx = 0
    nodes.push(
      <p key={i} style={{ margin: '1px 0', fontSize: 13, lineHeight: 1.7, color: '#1e293b' }}>
        {renderInline(line)}
      </p>
    )
  }

  return <div style={{ minWidth: 0 }}>{nodes}</div>
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 0' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 8, height: 8, borderRadius: 4,
            background: 'rgba(120,120,128,0.5)',
            animation: `lexiaPulse 1.2s ${i * 0.18}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes lexiaPulse {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}


interface ClientOption { id: string; name: string; nif_cif: string | null }

function ChatInner() {
  const search = useSearchParams()
  const urlClientId = search.get('clientId')

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [convFilter, setConvFilter] = useState('')
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  // Client context selector
  const [clientList, setClientList] = useState<ClientOption[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(urlClientId)
  const [clientSelectorOpen, setClientSelectorOpen] = useState(false)
  const selectorRef = useRef<HTMLDivElement>(null)
  const [searchingSources, setSearchingSources] = useState<string[]>([])

  const clientId = selectedClientId
  const clientName = clientList.find(c => c.id === clientId)?.name ?? null

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (!inputRef.current) return
    inputRef.current.style.height = 'auto'
    inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 180) + 'px'
  }, [input])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const r = await fetch('/api/claude/conversations')
      if (!r.ok) return
      const data = await r.json()
      setConversations(data.conversations || [])
    } catch {}
  }, [])

  useEffect(() => { loadConversations() }, [loadConversations])

  // Load full client list for selector
  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(d => setClientList((d.clients || []).map((c: { id: string; name: string; nif_cif?: string }) => ({ id: c.id, name: c.name, nif_cif: c.nif_cif ?? null }))))
      .catch(() => {})
  }, [])

  // Sync URL param → selector on first load
  useEffect(() => {
    if (urlClientId) setSelectedClientId(urlClientId)
  }, [urlClientId])

  // Close selector on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) setClientSelectorOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNew = () => {
    setMessages([])
    setActiveConvId(null)
    inputRef.current?.focus()
  }

  const loadConversation = async (id: string) => {
    setActiveConvId(id)
    setSidebarOpen(false)
    try {
      const r = await fetch(`/api/claude/conversations/${id}`)
      if (!r.ok) return
      const data = await r.json()
      setMessages(data.messages || [])
    } catch {}
  }

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta conversación?')) return
    try {
      await fetch(`/api/claude/conversations/${id}`, { method: 'DELETE' })
      if (activeConvId === id) { setMessages([]); setActiveConvId(null) }
      loadConversations()
    } catch {}
  }

  const deleteAllConversations = async () => {
    if (!confirm('¿Borrar TODO el historial de conversaciones? Esta acción no se puede deshacer.')) return
    try {
      await fetch('/api/claude/conversations', { method: 'DELETE' })
      setMessages([])
      setActiveConvId(null)
      loadConversations()
    } catch {}
  }


  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || sending) return

    const userMsg: Message = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const r = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversation_id: activeConvId,
          clientId: clientId || undefined,
        }),
      })

      if (!r.ok || !r.body) throw new Error('Network')

      const reader = r.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const evt = JSON.parse(line.slice(6))
            if (evt.type === 'searching' && evt.sources) {
                setSearchingSources(evt.sources as string[])
              } else if (evt.type === 'delta' && evt.text) {
                setSearchingSources([]) // clear once text starts
              setMessages(prev => {
                const next = [...prev]
                next[next.length - 1] = { ...next[next.length - 1], content: next[next.length - 1].content + evt.text }
                return next
              })
            } else if (evt.type === 'done') {
              if (evt.conversation_id && !activeConvId) setActiveConvId(evt.conversation_id)
              loadConversations()
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { ...next[next.length - 1], content: 'Error al conectar con LEXIA. Inténtalo de nuevo.' }
        return next
      })
    } finally {
      setSending(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredConvs = conversations.filter(c =>
    !convFilter || c.title.toLowerCase().includes(convFilter.toLowerCase())
  )

  return (
    <div className="relative flex h-[calc(100vh-2rem)] overflow-hidden" style={{ background: APPLE_BG, borderRadius: 20, boxShadow: APPLE_SHADOW_LG, fontFamily: SF }}>

      {/* Backdrop when sidebar open */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 z-10 bg-slate-900/30"
          />
        )}
      </AnimatePresence>

      {/* Collapsible sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -340, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-0 z-20 flex h-full w-[300px] flex-col"
            style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', borderRight: `1px solid ${APPLE_BORDER}`, boxShadow: '4px 0 24px rgba(0,0,0,0.07)' }}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${APPLE_BORDER}` }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: APPLE_DARK, letterSpacing: '-0.01em', margin: 0, fontFamily: SF_DISPLAY }}>Conversaciones</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Cerrar"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 py-3">
              <button
                onClick={() => { handleNew(); setSidebarOpen(false) }}
                className="flex w-full items-center justify-center gap-2 text-white transition-all"
                style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_HOVER} 100%)`, borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, boxShadow: `0 2px 8px ${BRAND}40`, border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = `0 4px 16px ${BRAND}50` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 2px 8px ${BRAND}40` }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Nueva conversación
              </button>
            </div>

            <div className="px-4 pb-3">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  value={convFilter}
                  onChange={e => setConvFilter(e.target.value)}
                  placeholder="Buscar…"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-[#8F7EE9] focus:outline-none focus:ring-2 focus:ring-[#8F7EE9]/20"
                />
              </div>
            </div>

            {conversations.length > 0 && (
              <div className="px-4 pb-2">
                <button
                  onClick={deleteAllConversations}
                  className="w-full text-xs text-slate-500 hover:text-red-600 transition-colors py-1.5 border-t border-slate-100"
                >
                  Borrar todo el historial
                </button>
              </div>
            )}


            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {filteredConvs.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">Sin conversaciones</p>
              ) : (
                filteredConvs.map(c => (
                  <div
                    key={c.id}
                    className={`group flex items-center gap-1 rounded-lg pr-2 transition-colors ${
                      activeConvId === c.id
                        ? 'bg-[#8F7EE9]/10 text-[#5B4FB8]'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <button
                      onClick={() => loadConversation(c.id)}
                      className="flex-1 px-3 py-2.5 text-left min-w-0"
                    >
                      <p className="truncate text-sm font-medium">{c.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {new Date(c.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </p>
                    </button>
                    <button
                      onClick={(e) => deleteConversation(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      aria-label="Eliminar"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                      </svg>
                    </button>
                  </div>
                ))

              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main chat column */}
      <main className="flex flex-1 flex-col" style={{ background: APPLE_SURFACE }}>

        {/* Header — Apple style */}
        <header className="flex items-center justify-between px-5 py-3.5" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${APPLE_BORDER}`, WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center transition-all"
              style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(0,0,0,0)', border: 'none', cursor: 'pointer', color: APPLE_GRAY }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
              aria-label="Historial"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 6h16M4 12h10M4 18h16" />
              </svg>
            </button>

            {/* Lexia avatar — gradient premium */}
            <div
              className="flex items-center justify-center flex-none"
              style={{
                width: 38, height: 38, borderRadius: 12,
                background: `linear-gradient(145deg, ${BRAND} 0%, #6B5DD3 60%, #5B4FB8 100%)`,
                boxShadow: `0 2px 12px ${BRAND}60, 0 0 0 1px rgba(255,255,255,0.15) inset`,
                color: '#fff', fontFamily: SF_DISPLAY, fontSize: 17, fontWeight: 700, letterSpacing: '-0.5px'
              }}
            >
              L
            </div>

            <div style={{ lineHeight: 1.2 }}>
              <h1 style={{ fontFamily: SF_DISPLAY, fontSize: 16, fontWeight: 600, color: APPLE_DARK, margin: 0, letterSpacing: '-0.02em' }}>LEXIA</h1>
              <p style={{ fontFamily: SF, fontSize: 11, color: APPLE_GRAY, margin: 0, letterSpacing: '0.01em' }}>Asistente jurídico · derecho español</p>
            </div>

            {/* ── Client context selector ── */}
            <div ref={selectorRef} className="relative ml-2">
              <button
                onClick={() => setClientSelectorOpen(o => !o)}
                className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all"
                style={{
                  borderColor: clientId ? 'rgba(143,126,233,0.5)' : '#e2e8f0',
                  background: clientId ? 'rgba(143,126,233,0.08)' : '#fff',
                  color: clientId ? '#5B4FB8' : '#64748b',
                }}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full flex-none"
                  style={{ backgroundColor: clientId ? BRAND : '#94a3b8' }}
                />
                {clientId && clientName ? clientName : 'Consulta general'}
                <svg className="h-3 w-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {clientSelectorOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute left-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                  >
                    {/* General mode */}
                    <button
                      onClick={() => { setSelectedClientId(null); setClientSelectorOpen(false); setMessages([]); setActiveConvId(null) }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors"
                    >
                      <span className="inline-block h-2 w-2 rounded-full bg-slate-300 flex-none" />
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">Consulta general</p>
                        <p className="text-[11px] text-slate-400">Sin contexto de cliente</p>
                      </div>
                      {!clientId && <svg className="ml-auto h-3.5 w-3.5 text-[#8F7EE9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </button>

                    {clientList.length > 0 && (
                      <div className="border-t border-slate-100 px-3 py-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Clientes</p>
                      </div>
                    )}

                    {clientList.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedClientId(c.id); setClientSelectorOpen(false); setMessages([]); setActiveConvId(null) }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors"
                      >
                        <span className="inline-block h-2 w-2 rounded-full flex-none" style={{ backgroundColor: BRAND }} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800 text-xs">{c.name}</p>
                          {c.nif_cif && <p className="font-mono text-[11px] text-slate-400">{c.nif_cif}</p>}
                        </div>
                        {clientId === c.id && <svg className="ml-auto h-3.5 w-3.5 flex-none text-[#8F7EE9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={handleNew}
            className="transition-all"
            style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: BRAND, background: BRAND_SOFT, border: `1px solid ${BRAND}30`, cursor: 'pointer', fontFamily: SF }}
            onMouseEnter={e => e.currentTarget.style.background = `${BRAND}15`}
            onMouseLeave={e => e.currentTarget.style.background = BRAND_SOFT}
          >
            + Nueva
          </button>
        </header>

        {/* Live search indicator */}
        {searchingSources.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 20px', background: 'rgba(143,126,233,0.06)', borderBottom: `1px solid ${APPLE_BORDER}` }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: BRAND, animation: 'lexiaCursor 0.8s infinite' }} />
            <span style={{ fontSize: 11, color: BRAND, fontFamily: SF, fontWeight: 500 }}>
              Consultando: {searchingSources.join(' · ')}
            </span>
          </div>
        )}

        {/* Client context banner — Apple pill style */}
        {clientId && clientName && (
          <div
            className="flex items-center justify-between px-5 py-2"
            style={{ background: `linear-gradient(90deg, ${BRAND_SOFT} 0%, rgba(143,126,233,0.03) 100%)`, borderBottom: `1px solid ${APPLE_BORDER}` }}
          >
            <div className="flex items-center gap-2">
              <div style={{ width: 6, height: 6, borderRadius: 3, background: BRAND, boxShadow: `0 0 6px ${BRAND}` }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#4B3FA0', fontFamily: SF }}>
                Expediente:{' '}
                <Link href={`/clients/${clientId}`} style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }} onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration='underline'} onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.textDecoration='none'}>{clientName}</Link>
              </span>
            </div>
            <Link href="/chat" style={{ fontSize: 11, color: APPLE_GRAY, textDecoration: 'none', fontFamily: SF }} onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color=APPLE_DARK} onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color=APPLE_GRAY}>Salir ×</Link>
          </div>
        )}

        {/* Disclaimer — banner prominente con título */}
        <div style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FFF8E1 100%)', borderBottom: '1px solid #F59E0B40', padding: '10px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Badge título */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
              background: '#F59E0B', color: '#fff', borderRadius: 6,
              padding: '3px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              fontFamily: SF, textTransform: 'uppercase' as const,
              boxShadow: '0 1px 4px rgba(245,158,11,0.4)'
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Aviso Legal
            </div>
            <p style={{ fontSize: 11, color: '#78350F', fontFamily: SF, lineHeight: 1.4, margin: 0 }}>
              No constituye asesoramiento jurídico · No crea relación de abogacía · Verificar siempre en{' '}
              <a href="https://www.boe.es" target="_blank" rel="noopener" style={{ color: '#B45309', fontWeight: 600, textDecoration: 'underline' }}>BOE.es</a>
              {' '}y{' '}
              <a href="https://www.poderjudicial.es/search/indexAN.jsp" target="_blank" rel="noopener" style={{ color: '#B45309', fontWeight: 600, textDecoration: 'underline' }}>CENDOJ</a>
              {' '}antes de actuar profesionalmente
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8" style={{ background: APPLE_BG }}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-lg pt-8"
            >
              {/* Avatar hero */}
              <div className="flex flex-col items-center mb-10">
                <div
                  style={{
                    width: 72, height: 72, borderRadius: 22,
                    background: `linear-gradient(145deg, #A599ED 0%, ${BRAND} 40%, #6B5DD3 100%)`,
                    boxShadow: `0 8px 32px ${BRAND}50, 0 0 0 1px rgba(255,255,255,0.2) inset`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: SF_DISPLAY, fontSize: 28, fontWeight: 700, color: '#fff',
                    letterSpacing: '-0.5px', marginBottom: 20
                  }}
                >
                  L
                </div>
                <h2 style={{ fontFamily: SF_DISPLAY, fontSize: 26, fontWeight: 600, color: APPLE_DARK, margin: 0, letterSpacing: '-0.03em', textAlign: 'center' }}>
                  Soy LEXIA
                </h2>
                <p style={{ fontFamily: SF, fontSize: 14, color: APPLE_GRAY, marginTop: 6, textAlign: 'center', lineHeight: 1.5 }}>
                  Asistente jurídico IA · Derecho español
                </p>
              </div>

              {/* Quick prompts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {QUICK_PROMPTS.map((p, idx) => (
                  <motion.button
                    key={p.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => sendMessage(p.desc)}
                    style={{
                      padding: '14px 16px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                      background: APPLE_SURFACE, border: `1px solid ${APPLE_BORDER}`,
                      boxShadow: APPLE_SHADOW, transition: 'all 0.2s ease', fontFamily: SF
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = APPLE_SHADOW; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{p.icon}</div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: APPLE_DARK, margin: '0 0 3px' }}>{p.title}</p>
                    <p style={{ fontSize: 11, color: APPLE_GRAY, margin: 0, lineHeight: 1.4 }}>{p.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="mx-auto max-w-2xl" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'flex', gap: 10, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end' }}
                >
                  {/* Lexia avatar */}
                  {m.role === 'assistant' && (
                    <div
                      style={{
                        width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginBottom: 2,
                        background: `linear-gradient(145deg, ${BRAND} 0%, #6B5DD3 100%)`,
                        boxShadow: `0 2px 8px ${BRAND}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: SF_DISPLAY, fontSize: 12, fontWeight: 700, color: '#fff',
                      }}
                    >
                      L
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '78%' }}>
                    {/* Bubble */}
                    <div
                      style={m.role === 'user' ? {
                        background: `linear-gradient(145deg, ${BRAND} 0%, #7B6BCF 100%)`,
                        color: '#fff',
                        borderRadius: '18px 18px 4px 18px',
                        padding: '12px 16px',
                        boxShadow: `0 2px 12px ${BRAND}40`,
                        fontFamily: SF,
                      } : {
                        background: APPLE_SURFACE,
                        color: APPLE_DARK,
                        borderRadius: '18px 18px 18px 4px',
                        padding: '14px 18px',
                        boxShadow: APPLE_SHADOW,
                        border: `1px solid ${APPLE_BORDER}`,
                        fontFamily: SF,
                      }}
                    >
                      {m.content ? (
                        <>
                          <LexiaText text={m.content} isUser={m.role === 'user'} />
                          {sending && i === messages.length - 1 && m.role === 'assistant' && (
                            <span style={{
                              display: 'inline-block', width: 2, height: 15, borderRadius: 1,
                              background: BRAND, marginLeft: 1, verticalAlign: 'middle', opacity: 1,
                              animation: 'lexiaCursor 0.8s ease-in-out infinite',
                            }} />
                          )}
                          <style>{`@keyframes lexiaCursor { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }`}</style>
                        </>
                      ) : (sending && i === messages.length - 1) ? (
                        <TypingDots />
                      ) : null}
                    </div>
                    {/* Verification note */}
                    {m.role === 'assistant' && m.content && (
                      <p style={{ fontSize: 10, color: APPLE_GRAY, paddingLeft: 4, margin: 0, fontFamily: SF, letterSpacing: '0.01em' }}>
                        Solo orientativo · Verificar en BOE/CENDOJ
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input — Apple Messages style */}
        <div className="px-5 py-4" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${APPLE_BORDER}` }}>
          <div className="mx-auto flex max-w-2xl items-end gap-3">
            {/* Textarea container */}
            <div
              className="relative flex-1"
              style={{
                background: APPLE_SURFACE,
                borderRadius: 22,
                border: `1px solid ${APPLE_BORDER}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                onFocus={e => { e.currentTarget.parentElement!.style.boxShadow = `0 0 0 3px ${BRAND}20, 0 1px 4px rgba(0,0,0,0.06)`; e.currentTarget.parentElement!.style.borderColor = `${BRAND}60` }}
                onBlur={e => { e.currentTarget.parentElement!.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.parentElement!.style.borderColor = APPLE_BORDER }}
                placeholder="Pregunta a LEXIA…"
                rows={1}
                disabled={sending}
                style={{
                  display: 'block', width: '100%', resize: 'none',
                  background: 'transparent', border: 'none', outline: 'none',
                  padding: '13px 18px', fontSize: 14, lineHeight: 1.5, fontFamily: SF,
                  color: APPLE_DARK, minHeight: 46, maxHeight: 180,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={sending || !input.trim()}
              aria-label="Enviar"
              style={{
                width: 44, height: 44, borderRadius: 22, flexShrink: 0,
                background: (sending || !input.trim()) ? '#D1D1D6' : `linear-gradient(145deg, ${BRAND} 0%, #6B5DD3 100%)`,
                border: 'none', cursor: (sending || !input.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                boxShadow: (sending || !input.trim()) ? 'none' : `0 2px 10px ${BRAND}50`,
                transition: 'all 0.2s ease', transform: 'scale(1)',
              }}
              onMouseEnter={e => { if (!sending && input.trim()) e.currentTarget.style.transform = 'scale(1.06)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {sending ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
                  <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 10, color: '#C7C7CC', marginTop: 8, fontFamily: SF }}>
            Enter para enviar · Shift+Enter nueva línea
          </p>
        </div>
      </main>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Cargando…</div>}>
      <ChatInner />
    </Suspense>
  )
}
