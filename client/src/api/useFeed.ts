import { useCallback, useEffect, useRef, useState } from 'react'

type FeedState<T> = {
  data: T | null
  error: string | null
  loading: boolean
  stale: boolean
}

/**
 * Polls one of the prototype endpoints. The server hands back a fresh snapshot
 * and nudges its in-memory scenario forward every few seconds, so the screens
 * behave like a live feed without anything being stored.
 */
export function useFeed<T>(path: string, intervalMs = 4000, live = true) {
  const [state, setState] = useState<FeedState<T>>({
    data: null,
    error: null,
    loading: true,
    stale: false,
  })
  const mounted = useRef(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch(path, { headers: { accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as T
      if (!mounted.current) return
      setState({ data: json, error: null, loading: false, stale: false })
    } catch (err) {
      if (!mounted.current) return
      setState((prev) => ({
        data: prev.data,
        error: err instanceof Error ? err.message : 'שגיאה לא ידועה',
        loading: false,
        stale: prev.data !== null,
      }))
    }
  }, [path])

  useEffect(() => {
    mounted.current = true
    void load()
    if (!live) return () => { mounted.current = false }

    const id = window.setInterval(() => void load(), intervalMs)
    return () => {
      mounted.current = false
      window.clearInterval(id)
    }
  }, [load, intervalMs, live])

  /**
   * Applies a local change to the current snapshot so a user action lands
   * immediately. The next poll replaces it with the server's own answer.
   */
  const mutate = useCallback((updater: (current: T) => T) => {
    setState((prev) => (prev.data ? { ...prev, data: updater(prev.data) } : prev))
  }, [])

  return { ...state, refresh: load, mutate }
}
