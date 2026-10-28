import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BrandMark, LoadingSphere } from './Brand'

/** Called by the first screen that has something real to show. */
const ReadyContext = createContext<() => void>(() => {})

export function useSignalReady() {
  return useContext(ReadyContext)
}

/** 12 clock units. Long enough that the mark is seen, short enough to ignore. */
const MINIMUM_MS = 720

/**
 * Covers the boot with the company mark until the board actually has data.
 * It lifts on the first snapshot, and also on the first error, so a dead feed
 * shows its own fault plate instead of an animation that never ends.
 */
export function BootGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const mountedAt = useRef(Date.now())
  const timer = useRef<number | null>(null)
  const reduce = useReducedMotion()

  const signal = useCallback(() => {
    if (timer.current !== null) return
    const waited = Date.now() - mountedAt.current
    const remaining = Math.max(MINIMUM_MS - waited, 0)
    timer.current = window.setTimeout(() => setReady(true), remaining)
  }, [])

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  return (
    <ReadyContext.Provider value={signal}>
      {children}

      <AnimatePresence>
        {!ready && (
          <motion.div
            key="boot"
            className="fixed inset-0 z-50 flex flex-col bg-asphalt"
            initial={false}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.24, ease: [0.22, 1, 0.28, 1] }}
            aria-busy="true"
          >
            <div className="hazard-chrome h-2 w-full opacity-90" aria-hidden />

            {/* The mark sits at the head of the sign, not stacked on the cube:
                the lockup contains a cube of its own and the two read as one
                object doubled when they touch. */}
            <div className="px-6 py-5">
              <BrandMark height={52} />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6 pb-16">
              <LoadingSphere size={112} label="טוען" />
              <p className="text-[length:var(--text-step-3)] text-paint-worn">
                טוען את תמונת המצב של מסוף הדגמה
              </p>
            </div>

            <div className="marking h-px w-full opacity-40" aria-hidden />
          </motion.div>
        )}
      </AnimatePresence>
    </ReadyContext.Provider>
  )
}
