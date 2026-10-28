import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CaretLeft, X } from '@phosphor-icons/react'
import { LegendPlate } from './LegendPlate'

/**
 * The legend, off the board until it is asked for. It is reference material —
 * read once by a new operator, never again by the people who live in front of
 * this screen — and it was costing a block of the one screen the floor has to
 * fit into.
 *
 * It opens on a press rather than on hover. A drawer that springs open because
 * a pointer drifted across the edge of a wall screen would be worse than the
 * space it saves.
 */
export function LegendDrawer() {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return createPortal(
    <>
      {/* The handle: a sign on a post at the inline end of the board. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="מקרא"
        className="plate fixed bottom-6 left-0 z-40 flex items-center gap-2 border-s-0 py-3 pe-3 ps-2 text-[length:var(--text-step-2)] text-paint transition-colors duration-[var(--t-2)] hover:bg-steel-hi"
      >
        <span className="reflect h-5 w-1.5 shrink-0" aria-hidden />
        <span className="stencil leading-none">מקרא</span>
        <CaretLeft
          size={14}
          weight="bold"
          className={`text-paint-faint transition-transform duration-[var(--t-3)] ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="סגור מקרא"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/55"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.12 }}
            />

            <motion.aside
              aria-label="מקרא"
              className="fixed bottom-0 left-0 top-0 z-50 flex w-[24rem] max-w-[90vw] flex-col justify-center p-4"
              initial={reduce ? false : { x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: reduce ? 0 : 0.24, ease: [0.22, 1, 0.28, 1] }}
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="סגור"
                  className="absolute end-3 top-3 z-10 text-paint-faint transition-colors duration-[var(--t-2)] hover:text-paint"
                >
                  <X size={16} weight="bold" aria-hidden />
                </button>
                <LegendPlate stacked />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>,
    document.body,
  )
}
