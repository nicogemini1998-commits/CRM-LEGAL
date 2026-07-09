'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DEADLINE_RULES,
  calculateDeadline,
  buildICS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatAmount,
  type DeadlineRule,
  type Category,
  type DeadlineResult,
} from '@/lib/legal-deadlines'

const CATEGORIES = [
  { key: 'all',            label: 'Todos' },
  { key: 'civil',          label: 'Civil' },
  { key: 'penal',          label: 'Penal' },
  { key: 'laboral',        label: 'Laboral' },
  { key: 'administrativo', label: 'Administrativo' },
  { key: 'mercantil',      label: 'Mercantil' },
  { key: 'fiscal',         label: 'Fiscal' },
] as const
type CategoryKey = typeof CATEGORIES[number]['key']

type CaseSummary = { id: string; title: string }

function CategoryBadge({ category }: { category: Category }) {
  const c = CATEGORY_COLORS[category]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: c.bg, color: c.color }}>
      {CATEGORY_LABELS[category]}
    </span>
  )
}

function LawBadge({ law }: { law: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontFamily: 'monospace', fontWeight: 600, background: 'rgba(124,58,237,0.08)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}>
      {law}
    </span>
  )
}

function NormBadge({ norm }: { norm: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontFamily: 'monospace', fontWeight: 700, background: 'rgba(15,23,42,0.06)', color: 'var(--ink-secondary)', border: '1px solid var(--hairline)' }}>
      {norm}
    </span>
  )
}

function UnitBadge({ rule }: { rule: DeadlineRule }) {
  const map: Record<string, string> = { business: 'hábiles', calendar: 'naturales', months: 'meses', years: 'años' }
  const color = rule.unit === 'business' ? '#0369A1' : rule.unit === 'calendar' ? '#0F766E' : '#6D28D9'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, color, border: `1px solid ${color}33`, background: `${color}0d` }}>
      {map[rule.unit]}
    </span>
  )
}

function RuleCard({ rule, selected, onClick }: { rule: DeadlineRule; selected: boolean; onClick: () => void }) {
  const c = CATEGORY_COLORS[rule.category]
  return (
    <motion.button
      layout
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      whileTap={{ scale: 0.99 }}
      style={{
        width: '100%', textAlign: 'left', padding: '12px', borderRadius: 10, cursor: 'pointer',
        transition: 'all 0.15s',
        background: selected ? 'rgba(124,58,237,0.06)' : 'var(--surface)',
        border: selected ? '1px solid rgba(124,58,237,0.35)' : '1px solid var(--hairline)',
        boxShadow: selected ? '0 0 0 1px rgba(124,58,237,0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = c.color + '40'
          e.currentTarget.style.background = c.bg
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--hairline)'
          e.currentTarget.style.background = 'var(--surface)'
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-primary)', lineHeight: 1.3 }}>{rule.label}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          <LawBadge law={rule.law} />
          <NormBadge norm={rule.norm} />
          <CategoryBadge category={rule.category} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
          {formatAmount(rule)} <UnitBadge rule={rule} />
        </p>
      </div>
    </motion.button>
  )
}

function Timeline({ result }: { result: DeadlineResult }) {
  const oneDay = 86_400_000
  const totalMs = result.deadlineDate.getTime() - result.startDate.getTime()
  const totalDays = Math.max(1, Math.round(totalMs / oneDay))
  const isCompact = totalDays <= 60

  type Tick = { offset: number; date: Date; kind: 'start' | 'end' | 'weekend' | 'holiday' | 'normal' }
  const ticks: Tick[] = []

  if (isCompact) {
    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(result.startDate)
      d.setDate(d.getDate() + i)
      const dow = d.getDay()
      const isHoliday = result.holidays.some(h => h.toDateString() === d.toDateString())
      let kind: Tick['kind'] = 'normal'
      if (i === 0) kind = 'start'
      else if (i === totalDays) kind = 'end'
      else if (isHoliday) kind = 'holiday'
      else if (dow === 0 || dow === 6) kind = 'weekend'
      ticks.push({ offset: i / totalDays, date: d, kind })
    }
  } else {
    ticks.push({ offset: 0, date: result.startDate, kind: 'start' })
    ticks.push({ offset: 1, date: result.deadlineDate, kind: 'end' })
  }

  return (
    <div style={{ padding: '14px 0' }}>
      <div style={{ position: 'relative', height: 48 }}>
        <div style={{ position: 'absolute', top: 22, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #0369A1, #7C3AED)', borderRadius: 4 }} />
        {ticks.map((tick, i) => {
          const color =
            tick.kind === 'holiday' ? '#DC2626' :
            tick.kind === 'weekend' ? '#94a3b8' :
            tick.kind === 'start' ? '#0369A1' :
            tick.kind === 'end' ? '#7C3AED' : 'var(--ink-tertiary)'
          const size = tick.kind === 'start' || tick.kind === 'end' ? 14 : tick.kind === 'holiday' ? 10 : 6
          return (
            <div key={i} style={{ position: 'absolute', left: `calc(${tick.offset * 100}% - ${size / 2}px)`, top: 24 - size / 2 }}>
              <div title={tick.date.toLocaleDateString('es-ES')} style={{ width: size, height: size, borderRadius: '50%', background: color, border: '2px solid var(--surface)', boxShadow: '0 0 0 1px ' + color }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ink-tertiary)', marginTop: 4 }}>
        <span>{result.startDate.toLocaleDateString('es-ES')}</span>
        <span>{totalDays} días</span>
        <span>{result.deadlineDate.toLocaleDateString('es-ES')}</span>
      </div>
      {result.holidays.length > 0 && (
        <p style={{ fontSize: 10, color: '#DC2626', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          🔴 {result.holidays.length} festivos excluidos del cómputo
        </p>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 16 }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
        📅
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-secondary)' }}>Selecciona un plazo</p>
        <p style={{ fontSize: 12, color: 'var(--ink-tertiary)', marginTop: 4 }}>Elige una norma de la lista para calcular la fecha límite</p>
      </div>
    </div>
  )
}

function NoResults() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 8 }}>
      <p style={{ fontSize: 24 }}>🔍</p>
      <p style={{ fontSize: 13, color: 'var(--ink-tertiary)' }}>No se encontraron plazos</p>
    </div>
  )
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}

export default function PlazosPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [selectedRule, setSelectedRule] = useState<DeadlineRule | null>(null)
  const [startDate, setStartDate] = useState('')
  const [result, setResult] = useState<DeadlineResult | null>(null)
  const [cases, setCases] = useState<CaseSummary[]>([])
  const [linkedCaseId, setLinkedCaseId] = useState('')
  const [linkedToast, setLinkedToast] = useState('')

  useEffect(() => {
    fetch('/api/cases')
      .then(r => r.json())
      .then(d => setCases(d.cases || []))
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return DEADLINE_RULES.filter((r) => {
      const matchesCategory = activeCategory === 'all' || r.category === activeCategory
      if (!matchesCategory) return false
      if (!q) return true
      return (
        r.label.toLowerCase().includes(q) ||
        r.law.toLowerCase().includes(q) ||
        r.norm.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        String(r.amount).includes(q)
      )
    })
  }, [search, activeCategory])

  function handleSelectRule(rule: DeadlineRule) {
    setSelectedRule(rule)
    setResult(null)
    setStartDate('')
    setLinkedCaseId('')
    setLinkedToast('')
  }

  function handleCalculate() {
    if (!selectedRule || !startDate) return
    const date = new Date(startDate + 'T00:00:00')
    setResult(calculateDeadline(selectedRule.id, date))
  }

  function handleDownloadICS() {
    if (!result) return
    const ics = buildICS(result)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `iuralex-${result.rule.id}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleLinkToCase() {
    if (!result || !linkedCaseId) return
    const c = cases.find(cc => cc.id === linkedCaseId)
    if (!c) return
    setLinkedToast(`✓ Plazo vinculado a "${c.title}"`)
    setTimeout(() => setLinkedToast(''), 3500)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ paddingBottom: 32, borderBottom: '1px solid var(--hairline)', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, marginBottom: 16, background: 'rgba(3,105,161,0.08)', border: '1px solid rgba(3,105,161,0.2)', fontSize: 11, fontWeight: 600, color: '#0369A1', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          ⏱ Plazos Procesales · {DEADLINE_RULES.length} plazos · Normativa Española
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 8, lineHeight: 1.2 }}>
          Calculadora de{' '}
          <span style={{ background: 'linear-gradient(135deg, #0369A1, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            plazos procesales
          </span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-secondary)', lineHeight: 1.6, maxWidth: 640 }}>
          LEC · LECrim · LRJS · LPAC · LJCA · LSC · LGT · CC. Distingue días hábiles, naturales, meses y años. Excluye fines de semana y festivos nacionales españoles 2026.
        </p>
      </motion.div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-tertiary)' }}
            width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2" /><path d="m21 21-4.35-4.35" strokeWidth="2" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, artículo, norma o número…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10, borderRadius: 10, fontSize: 13, color: 'var(--ink-primary)', background: 'var(--surface)', border: '1px solid var(--hairline)', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                background: activeCategory === cat.key ? 'var(--obsidian)' : 'var(--surface)',
                color: activeCategory === cat.key ? 'var(--lime)' : 'var(--ink-secondary)',
                border: activeCategory === cat.key ? '1px solid var(--obsidian)' : '1px solid var(--hairline)',
              }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {filtered.length} plazos disponibles
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 'calc(100vh - 320px)', overflowY: 'auto', paddingRight: 4 }}>
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? <NoResults /> : filtered.map(rule => (
                <RuleCard key={rule.id} rule={rule} selected={selectedRule?.id === rule.id} onClick={() => handleSelectRule(rule)} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div style={{ borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--hairline)', minHeight: 480, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <AnimatePresence mode="wait">
            {!selectedRule ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 480 }}>
                <EmptyState />
              </motion.div>
            ) : (
              <motion.div key={selectedRule.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 22, padding: 28 }}>

                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    <LawBadge law={selectedRule.law} />
                    <NormBadge norm={selectedRule.norm} />
                    <CategoryBadge category={selectedRule.category} />
                    <UnitBadge rule={selectedRule} />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-primary)', marginBottom: 6 }}>{selectedRule.label}</h2>
                  <p style={{ fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.6 }}>{selectedRule.description}</p>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', borderRadius: 10, background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.15)' }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>El plazo empieza desde</p>
                    <p style={{ fontSize: 13, color: 'var(--ink-secondary)', lineHeight: 1.5 }}>{selectedRule.startFrom}</p>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)', marginBottom: 8 }}>Fecha de inicio del plazo</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => { setStartDate(e.target.value); setResult(null) }}
                    style={{ padding: '9px 14px', borderRadius: 10, fontSize: 13, color: 'var(--ink-primary)', background: 'var(--surface-elevated)', border: '1px solid var(--hairline)', outline: 'none' }}
                  />
                  <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 6 }}>
                    Cómputo: <strong style={{ color: 'var(--ink-secondary)' }}>{formatAmount(selectedRule)}</strong>
                  </p>
                </div>

                <button
                  onClick={handleCalculate}
                  disabled={!startDate}
                  style={{ alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 10, border: 'none', cursor: startDate ? 'pointer' : 'not-allowed', opacity: startDate ? 1 : 0.4, fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #7C3AED, #6366F1)', boxShadow: startDate ? '0 4px 16px rgba(124,58,237,0.3)' : 'none', transition: 'all 0.15s' }}>
                  Calcular fecha límite
                </button>

                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                    >
                      <div style={{
                        borderRadius: 12, padding: '20px 24px',
                        border: `1px solid ${result.status === 'expired' ? 'rgba(220,38,38,0.2)' : result.status === 'urgent' ? 'rgba(217,119,6,0.2)' : 'rgba(22,163,74,0.2)'}`,
                        background: result.status === 'expired' ? 'rgba(220,38,38,0.04)' : result.status === 'urgent' ? 'rgba(217,119,6,0.04)' : 'rgba(22,163,74,0.04)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-tertiary)', marginBottom: 6 }}>Fecha límite</p>
                            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-primary)', textTransform: 'capitalize' }}>{formatDate(result.deadlineDate)}</p>
                          </div>
                          <div style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                            background: result.status === 'expired' ? 'rgba(220,38,38,0.1)' : result.status === 'urgent' ? 'rgba(217,119,6,0.1)' : 'rgba(22,163,74,0.1)',
                            color: result.status === 'expired' ? '#DC2626' : result.status === 'urgent' ? '#D97706' : '#16A34A',
                            border: `1px solid ${result.status === 'expired' ? 'rgba(220,38,38,0.2)' : result.status === 'urgent' ? 'rgba(217,119,6,0.2)' : 'rgba(22,163,74,0.2)'}`,
                          }}>
                            {result.status === 'expired' ? `⚠️ VENCIDO hace ${Math.abs(result.daysLeft)} días`
                              : result.daysLeft === 0 ? '🔴 Vence HOY'
                              : result.status === 'urgent' ? `⏳ Por vencer en ${result.daysLeft} días`
                              : `✅ ${result.daysLeft} días restantes`}
                          </div>
                        </div>

                        <Timeline result={result} />

                        {selectedRule.unit === 'business' && (
                          <p style={{ fontSize: 11, color: 'var(--ink-tertiary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                            📅 Excluidos fines de semana y festivos nacionales españoles 2026
                          </p>
                        )}

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                          <button
                            onClick={handleDownloadICS}
                            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--surface-elevated)', fontSize: 12, color: 'var(--ink-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                            📆 Añadir a calendario (.ics)
                          </button>

                          {cases.length > 0 && (
                            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                              <select
                                value={linkedCaseId}
                                onChange={e => setLinkedCaseId(e.target.value)}
                                style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--surface-elevated)', fontSize: 12, color: 'var(--ink-primary)', outline: 'none' }}
                              >
                                <option value="">Vincular a expediente…</option>
                                {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                              </select>
                              <button
                                onClick={handleLinkToCase}
                                disabled={!linkedCaseId}
                                style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--obsidian)', background: 'var(--obsidian)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: linkedCaseId ? 'pointer' : 'not-allowed', opacity: linkedCaseId ? 1 : 0.5 }}
                              >
                                Vincular
                              </button>
                            </div>
                          )}
                        </div>

                        {linkedToast && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: '#16A34A', marginTop: 10, fontWeight: 600 }}>
                            {linkedToast}
                          </motion.p>
                        )}
                      </div>

                      {selectedRule.warning && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          style={{ display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)' }}>
                          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Advertencia</p>
                            <p style={{ fontSize: 12, color: 'var(--ink-secondary)', lineHeight: 1.6 }}>{selectedRule.warning}</p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
