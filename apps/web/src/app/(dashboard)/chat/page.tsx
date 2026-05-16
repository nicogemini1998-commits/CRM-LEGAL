'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MeshGradient } from '@/components/ui/mesh-gradient'
import { DuotoneIcon } from '@/components/ui/duotone-icon'
import { TypingIndicator } from '@/components/ui/typing-indicator'
import { ShimmerSkeleton } from '@/components/ui/shimmer-skeleton'
import { CommandShortcut } from '@/components/ui/command-shortcut'
import { ease } from '@/lib/motion'

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

const QUICK_QUESTIONS = [
  { icon: 'scales' as const,  q: '¿Plazos para recurrir un despido improcedente?',         area: 'Laboral' },
  { icon: 'shield' as const,  q: '¿Qué dice el RGPD sobre consentimiento de datos?',       area: 'Datos' },
  { icon: 'building' as const,q: '¿Cómo funciona la responsabilidad limitada en una S.L.?', area: 'Mercantil' },
  { icon: 'gavel' as const,   q: '¿Qué incluye obligatoriamente un contrato de arrendamiento?', area: 'Civil' },
]

// ── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, isLast, streaming }: { msg: Message; isLast: boolean; streaming: boolean }) {
  const isUser = msg.role === 'user'

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: ease.outExpo }}
        className="flex justify-end"
      >
        <div
          className="max-w-[76%] px-4 py-2.5 text-[14px] leading-relaxed"
          style={{ background: 'var(--obsidian)', color: '#fff', borderRadius: '18px 18px 4px 18px' }}
        >
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: ease.outExpo }}
      className="flex gap-3"
    >
      <div
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-display italic"
        style={{ background: 'linear-gradient(135deg, var(--obsidian) 0%, var(--plum) 100%)', color: 'var(--lime)', fontSize: 14, paddingBottom: 1 }}
      >L</div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-[14.5px] leading-[1.65] whitespace-pre-wrap" style={{ color: 'var(--ink-primary)' }}>
          {msg.content}
          {isLast && streaming && <span className="stream-cursor" />}
          {isLast && streaming && !msg.content && <TypingIndicator className="ml-1" />}
        </div>
        {!streaming && msg.cost_eur_cents !== undefined && msg.cost_eur_cents > 0 && (
          <p className="text-[10.5px] font-mono mt-2" style={{ color: 'var(--ink-tertiary)' }}>
            {msg.cost_eur_cents < 1 ? '<0.01€' : `${(msg.cost_eur_cents / 100).toFixed(2)}€`}
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ── Conversation Sidebar ─────────────────────────────────────────────────────

function ConversationSidebar({
  open,
  conversations,
  activeId,
  onSelect,
  onNew,
  onToggle,
  loading,
}: {
  open: boolean
  conversations: Conversation[]
  activeId: string | null
  onSelect: (conv: Conversation) => void
  onNew: () => void
  onToggle: () => void
  loading: boolean
}) {
  const grouped = conversations.reduce<Record<string, Conversation[]>>((acc, conv) => {
    const d = new Date(conv.updated_at || conv.created_at)
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)
    const label = d.toDateString() === today.toDateString() ? 'Hoy'
      : d.toDateString() === yesterday.toDateString() ? 'Ayer'
      : d >= weekAgo ? 'Esta semana' : 'Anteriores'
    if (!acc[label]) acc[label] = []
    acc[label].push(conv)
    return acc
  }, {})

  return (
    <motion.aside
      animate={{ width: open ? 252 : 52 }}
      transition={{ duration: 0.3, ease: ease.outExpo }}
      className="relative flex-shrink-0 flex flex-col h-[calc(100vh-80px)] overflow-hidden"
      style={{ borderRight: '1px solid var(--hairline)' }}
    >
      {/* Toggle button — always visible */}
      <div className={`flex-shrink-0 ${open ? 'px-3 pt-3' : 'p-2.5'}`}>
        {open ? (
          <div className="flex items-center gap-2">
            <motion.button
              onClick={onNew}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors duration-150"
              style={{ background: 'var(--obsidian)', color: 'var(--lime)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--obsidian-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--obsidian)' }}
            >
              <span className="flex items-center gap-2">
                <DuotoneIcon name="plus" size={13} primary="var(--lime)" />
                Nueva consulta
              </span>
              <CommandShortcut keys={['⌘', 'O']} variant="dark" />
            </motion.button>
            <motion.button
              onClick={onToggle}
              whileTap={{ scale: 0.95 }}
              title="Contraer panel"
              className="w-8 h-9 flex items-center justify-center rounded-lg transition-colors duration-150 flex-shrink-0"
              style={{ background: 'transparent', color: 'var(--ink-tertiary)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-elevated)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <motion.button
              onClick={onToggle}
              whileTap={{ scale: 0.95 }}
              title="Expandir panel"
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150"
              style={{ color: 'var(--ink-tertiary)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-elevated)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
            <motion.button
              onClick={onNew}
              whileTap={{ scale: 0.95 }}
              title="Nueva consulta"
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150"
              style={{ background: 'var(--obsidian)', color: 'var(--lime)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--obsidian-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--obsidian)' }}
            >
              <DuotoneIcon name="plus" size={14} primary="var(--lime)" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Conversation list — only when open */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex-1 overflow-y-auto px-2 pb-3 mt-1"
          >
            {loading ? (
              <div className="space-y-1.5 px-2 mt-2">
                {[1, 2, 3, 4].map(i => <ShimmerSkeleton key={i} className="h-7 w-full" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-3 mt-8 text-center">
                <DuotoneIcon name="chat" size={26} primary="var(--ink-quaternary)" secondary="var(--lime)" className="mx-auto opacity-40" />
                <p className="text-[11.5px] mt-2.5 leading-relaxed" style={{ color: 'var(--ink-tertiary)' }}>
                  Sin conversaciones aún
                </p>
              </div>
            ) : (
              Object.entries(grouped).map(([label, convs]) => (
                <div key={label} className="mb-3">
                  <p className="label-micro px-3 py-1.5">{label}</p>
                  <div className="space-y-px">
                    {convs.map(conv => {
                      const isActive = activeId === conv.id
                      return (
                        <motion.button
                          key={conv.id}
                          onClick={() => onSelect(conv)}
                          whileTap={{ scale: 0.98 }}
                          className="relative w-full text-left px-3 py-2 text-[12.5px] rounded-lg transition-colors duration-150 truncate"
                          style={{
                            background: isActive ? 'var(--surface)' : 'transparent',
                            color: isActive ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                            fontWeight: isActive ? 500 : 400,
                            boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                          }}
                          onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--ink-primary)' } }}
                          onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-secondary)' } }}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="convActive"
                              className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full"
                              style={{ background: 'var(--lime)' }}
                            />
                          )}
                          <span className="block truncate pl-1">{conv.title || 'Consulta sin título'}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}

// ── Main Chat Page ───────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [convLoading, setConvLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/claude/conversations')
      if (!res.ok) { setConvLoading(false); return }
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch {}
    setConvLoading(false)
  }, [])

  useEffect(() => {
    loadConversations()
    inputRef.current?.focus()
  }, [loadConversations])

  const loadConversation = async (conv: Conversation) => {
    setConversationId(conv.id)
    setMessages([])
    try {
      const res = await fetch(`/api/claude/conversations/${conv.id}`)
      if (!res.ok) return
      const data = await res.json()
      setMessages(data.messages || [])
    } catch {}
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || streaming) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setStreaming(true)

    let assistantText = ''
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, conversationId }),
      })

      if (!res.ok || !res.body) throw new Error('Error al conectar con LEXIA')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'delta') {
              assistantText += data.text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: assistantText }
                return updated
              })
            }
            if (data.type === 'done') {
              if (!conversationId) { setConversationId(data.conversation_id); loadConversations() }
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: assistantText, cost_eur_cents: data.cost_eur_cents }
                return updated
              })
            }
            if (data.type === 'error') throw new Error(data.message)
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'desconocido'}` }
        return updated
      })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setConversationId(null)
    setInput('')
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'o') { e.preventDefault(); handleNewChat() }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') { e.preventDefault(); setSidebarOpen(p => !p) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="relative" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
      <MeshGradient variant="chat" />

      <div className="relative flex h-full z-10">
        {/* ── Sidebar ── */}
        <ConversationSidebar
          open={sidebarOpen}
          conversations={conversations}
          activeId={conversationId}
          onSelect={loadConversation}
          onNew={handleNewChat}
          onToggle={() => setSidebarOpen(p => !p)}
          loading={convLoading}
        />

        {/* ── Chat Area — always centered ── */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Header */}
          <div
            className="px-6 py-4 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: '1px solid var(--hairline)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-display italic flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--obsidian) 0%, var(--plum) 100%)', color: 'var(--lime)', fontSize: 15, paddingBottom: 1 }}
              >L</div>
              <div>
                <h1 className="font-display text-[21px] leading-none" style={{ color: 'var(--ink-primary)' }}>LEXIA</h1>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-tertiary)' }}>
                  Copiloto jurídico · Derecho español
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-medium"
                style={{ background: 'var(--lime-bg-soft)', color: 'var(--lime-text-soft)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
                En línea
              </span>
              {/* Sidebar toggle shortcut hint */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-[11px] px-2 py-1 rounded-lg transition-colors duration-150"
                  style={{ color: 'var(--ink-tertiary)', border: '1px solid var(--hairline)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lime)'; e.currentTarget.style.color = 'var(--lime)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.color = 'var(--ink-tertiary)' }}
                >
                  Historial
                </button>
              )}
            </div>
          </div>

          {/* Messages — ALWAYS centered */}
          <div className="flex-1 overflow-y-auto py-8">
            <div className="w-full max-w-2xl mx-auto px-6 space-y-6">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: ease.outExpo }}
                  className="pt-10 pb-8"
                >
                  {/* Avatar */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-7"
                    style={{
                      background: 'linear-gradient(135deg, var(--obsidian) 0%, var(--plum) 100%)',
                      boxShadow: '0 12px 32px -8px rgba(24,24,27,0.4), 0 0 0 1px rgba(124,58,237,0.25)',
                    }}
                  >
                    <span className="font-display italic" style={{ color: 'var(--lime)', fontSize: 32, paddingBottom: 4 }}>L</span>
                  </div>

                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--ink-primary)' }}>
                    Hola, soy{' '}
                    <em style={{ fontStyle: 'italic', color: 'var(--obsidian)' }}>LEXIA</em>
                    <span style={{ color: 'var(--lime-hover)' }}>.</span>
                  </h2>
                  <p className="text-[15px] mt-3 leading-relaxed max-w-sm" style={{ color: 'var(--ink-secondary)' }}>
                    Tu copiloto jurídico. Pregúntame sobre plazos, doctrina y derecho español.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10">
                    {QUICK_QUESTIONS.map((item, idx) => (
                      <motion.button
                        key={item.q}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + idx * 0.06, duration: 0.3, ease: ease.outExpo }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => sendMessage(item.q)}
                        className="relative p-4 text-left rounded-xl group overflow-hidden"
                        style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lime-hover)'; e.currentTarget.style.boxShadow = '0 8px 20px -8px rgba(124,58,237,0.25)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-elevated)' }}>
                            <DuotoneIcon name={item.icon} size={15} primary="var(--ink-primary)" secondary="var(--lime)" />
                          </div>
                          <span className="label-meta text-[10px]">{item.area}</span>
                        </div>
                        <p className="text-[13px] font-medium leading-tight" style={{ color: 'var(--ink-primary)' }}>{item.q}</p>
                        <div className="mt-3 flex items-center gap-1 text-[11px]" style={{ color: 'var(--lime-hover)' }}>
                          <span>preguntar</span>
                          <DuotoneIcon name="arrow-right" size={10} primary="var(--lime-hover)" className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <MessageBubble
                      key={i}
                      msg={msg}
                      isLast={i === messages.length - 1}
                      streaming={streaming && i === messages.length - 1}
                    />
                  ))}
                </AnimatePresence>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input — floating bottom */}
          <div className="pb-5 pt-2 px-6 flex-shrink-0">
            <div className="w-full max-w-2xl mx-auto">
              <div
                className="flex gap-3 items-end px-4 py-3 transition-all duration-150"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-xl)',
                  boxShadow: 'var(--shadow-md)',
                }}
                onFocus={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--lime)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lime-glow)' }}
                onBlur={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--hairline)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)' }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pregunta a LEXIA… (Enter para enviar, Shift+Enter nueva línea)"
                  rows={1}
                  className="flex-1 text-[14px] resize-none focus:outline-none leading-relaxed bg-transparent max-h-36"
                  style={{ color: 'var(--ink-primary)' }}
                />
                <motion.button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || streaming}
                  whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.12 }}
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-150 disabled:opacity-30"
                  style={{
                    background: input.trim() && !streaming ? 'var(--lime)' : 'var(--obsidian)',
                    color: '#fff',
                  }}
                >
                  {streaming ? (
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--lime)' }} />
                  ) : (
                    <DuotoneIcon name="send" size={14} primary="currentColor" secondary="currentColor" />
                  )}
                </motion.button>
              </div>
              <p className="text-[10.5px] mt-2 text-center" style={{ color: 'var(--ink-quaternary)' }}>
                LEXIA ofrece información general · no sustituye asesoramiento jurídico profesional
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
