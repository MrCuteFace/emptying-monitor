import { useEffect, useRef, useState } from 'react'

/**
 * True for a moment after `signature` changes, so a cell can mark the swap.
 * Skips the very first render: everything is "new" on load, and flashing the
 * whole floor at once would say nothing.
 */
export function useStatusChange(signature: string, holdMs = 700): boolean {
  const previous = useRef<string | null>(null)
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    if (previous.current === null) {
      previous.current = signature
      return
    }
    if (previous.current === signature) return

    previous.current = signature
    setChanged(true)
    const id = window.setTimeout(() => setChanged(false), holdMs)
    return () => window.clearTimeout(id)
  }, [signature, holdMs])

  return changed
}
