'use client'

/**
 * Lightweight in-memory cache + deduplication for client-side fetches.
 *
 * Why: Multiple pages (dashboard, cases, clients, documents, generate, …)
 * hit the same `/api/...` endpoints on every navigation, causing duplicate
 * (sometimes triplicate) network round-trips. This module returns cached
 * data instantly if the same URL was fetched within TTL, and dedupes
 * concurrent in-flight requests so we never have two requests for the
 * same URL at the same time.
 *
 * Intentionally tiny — no SWR/React Query dependency to avoid bundle bloat
 * before tomorrow's demo.
 */

import { useEffect, useRef, useState, useCallback } from 'react'

const DEFAULT_TTL_MS = 30_000 // 30s

type CacheEntry<T> = {
  data: T
  ts: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

export function getCached<T>(url: string, ttl = DEFAULT_TTL_MS): T | undefined {
  const hit = cache.get(url)
  if (!hit) return undefined
  if (Date.now() - hit.ts > ttl) {
    cache.delete(url)
    return undefined
  }
  return hit.data as T
}

export function setCached<T>(url: string, data: T): void {
  cache.set(url, { data, ts: Date.now() })
}

export function invalidate(urlOrPrefix: string): void {
  for (const key of cache.keys()) {
    if (key === urlOrPrefix || key.startsWith(urlOrPrefix)) {
      cache.delete(key)
    }
  }
}

export function clearCache(): void {
  cache.clear()
}

/**
 * Fetch JSON with cache + in-flight dedup. Always returns a Promise.
 * Errors do NOT poison the cache — they simply reject so the caller can
 * decide how to render fallback UI.
 */
export async function cachedFetchJSON<T = unknown>(
  url: string,
  { ttl = DEFAULT_TTL_MS, force = false }: { ttl?: number; force?: boolean } = {},
): Promise<T> {
  if (!force) {
    const hit = getCached<T>(url, ttl)
    if (hit !== undefined) return hit
    const pending = inflight.get(url)
    if (pending) return pending as Promise<T>
  }

  const promise = fetch(url, { credentials: 'same-origin' })
    .then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status} on ${url}`)
      return (await r.json()) as T
    })
    .then((data) => {
      setCached(url, data)
      return data
    })
    .finally(() => {
      inflight.delete(url)
    })

  inflight.set(url, promise)
  return promise
}

/**
 * React hook wrapper: returns `{ data, loading, error, refresh }`.
 * - Reads cache synchronously on mount (no blank flash on revisit).
 * - Revalidates in background if stale or `force` is true.
 */
export function useCachedFetch<T = unknown>(
  url: string | null,
  options: { ttl?: number; revalidateOnMount?: boolean } = {},
) {
  const { ttl = DEFAULT_TTL_MS, revalidateOnMount = true } = options

  const initial = url ? getCached<T>(url, ttl) : undefined
  const [data, setData] = useState<T | undefined>(initial)
  const [loading, setLoading] = useState<boolean>(!initial && !!url)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const run = useCallback(
    async (force = false) => {
      if (!url) return
      setError(null)
      if (getCached<T>(url, ttl) === undefined) setLoading(true)
      try {
        const fresh = await cachedFetchJSON<T>(url, { ttl, force })
        if (!mountedRef.current) return
        setData(fresh)
      } catch (err) {
        if (!mountedRef.current) return
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    },
    [url, ttl],
  )

  useEffect(() => {
    if (!url) return
    if (initial !== undefined && !revalidateOnMount) return
    run(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  const refresh = useCallback(() => run(true), [run])

  return { data, loading, error, refresh }
}
