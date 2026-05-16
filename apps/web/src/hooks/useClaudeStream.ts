'use client'

import { useState, useCallback } from 'react'

interface StreamOptions {
  onDelta?: (text: string) => void
  onDone?: (data: Record<string, unknown>) => void
  onError?: (message: string) => void
}

export function useClaudeStream() {
  const [streaming, setStreaming] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const stream = useCallback(async (endpoint: string, body: Record<string, unknown>, options?: StreamOptions) => {
    setStreaming(true)
    setText('')
    setError(null)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, stream: true }),
      })

      if (!res.ok || !res.body) throw new Error('No se pudo conectar')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = JSON.parse(line.slice(6))
          if (data.type === 'delta') {
            setText(prev => prev + data.text)
            options?.onDelta?.(data.text)
          }
          if (data.type === 'done') {
            options?.onDone?.(data)
          }
          if (data.type === 'cached') {
            options?.onDone?.({ ...data, cached: true })
          }
          if (data.type === 'error') throw new Error(data.message)
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
      options?.onError?.(msg)
    } finally {
      setStreaming(false)
    }
  }, [])

  const reset = useCallback(() => { setText(''); setError(null) }, [])

  return { stream, streaming, text, error, reset }
}
