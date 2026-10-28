import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Check, Minus, X } from '@phosphor-icons/react'
import type { ContainerCard, ContainerDeals } from '../../api/types'
import { fetchDeals } from '../../api/mutations'
import { clockOf } from '../../lib/status'

/**
 * The deals sitting inside one container, opened from the pinned plate. Both
 * figures on the plate are sums of this list, so this is where a disputed
 * percentage gets settled: which deals, how many packages each, and which of
 * them have had their availability transmitted.
 *
 * Every figure here is fabricated. שידור זמינות in particular has no source in
 * any system yet, so the column is a placeholder for a real
 * per-deal event, and says so at the foot of the panel.
 */
export function DealsPanel({ card, onClose }: { card: ContainerCard; onClose: () => void }) {
  const reduce = useReducedMotion()
  const [data, setData] = useState<ContainerDeals | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setData(null)
    setError(null)
    fetchDeals(card.containerNumber)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'שגיאה'))
    return () => {
      alive = false
    }
  }, [card.containerNumber])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Into the body, like the plate: the page sits inside an animated element
  // that makes its own stacking context, so a z-index set in the tree below it
  // cannot rise above the plate's portal however large the number.
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="סגור"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />

      <motion.div
        role="dialog"
        aria-label={`עסקאות במכולה ${card.containerNumber}`}
        initial={reduce ? false : { opacity: 0, transform: 'translateY(8px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: reduce ? 0 : 0.16, ease: [0.22, 1, 0.28, 1] }}
        className="galv relative flex max-h-full w-full max-w-[64rem] flex-col"
      >
        <header className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b border-black px-6 py-4">
          <h2 className="stencil text-[length:var(--text-step-4)] leading-none text-paint">
            עסקאות במכולה
          </h2>
          <p className="font-mono text-[length:var(--text-step-3)] leading-none text-paint">
            {card.containerNumber}
          </p>
          <p className="text-[length:var(--text-step-2)] text-paint-worn tnum">
            {card.packagesEmptied} מתוך {card.packages} אריזות רוקנו
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className="ms-auto flex items-center gap-1.5 border border-white/12 px-3 py-1.5 text-[length:var(--text-step-2)] text-paint-worn transition-colors duration-[var(--t-2)] hover:border-paint-worn hover:text-paint"
          >
            <X size={14} weight="bold" aria-hidden />
            סגור
          </button>
        </header>

        {error && (
          <p className="m-6 border-2 border-dashed border-st-unopened/60 px-6 py-8 text-center text-[length:var(--text-step-2)] text-paint-worn">
            {error}
          </p>
        )}

        {!data && !error && (
          <p className="m-6 px-6 py-8 text-center text-[length:var(--text-step-2)] text-paint-faint">
            טוען עסקאות…
          </p>
        )}

        {data && (
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full border-collapse text-right">
              <thead className="sticky top-0 z-10 bg-galv">
                <tr className="text-[length:var(--text-step-2)] text-paint-worn">
                  <th scope="col" className="px-6 py-2 font-medium">מזהה עסקה</th>
                  <th scope="col" className="px-3 py-2 font-medium">משלח</th>
                  <th scope="col" className="px-3 py-2 font-medium">תיאור המטען</th>
                  <th scope="col" className="px-3 py-2 font-medium">כמות</th>
                  <th scope="col" className="px-3 py-2 font-medium">משקל</th>
                  <th scope="col" className="px-6 py-2 font-medium">שידור זמינות</th>
                </tr>
              </thead>
              <tbody>
                {data.deals.map((deal) => {
                  const done = deal.packagesEmptied >= deal.packages
                  return (
                    <tr
                      key={deal.dealId}
                      className="border-t border-white/6 transition-colors duration-[var(--t-2)] hover:bg-white/5"
                    >
                      <td
                        dir="ltr"
                        className="whitespace-nowrap px-6 py-2.5 text-end font-mono text-[length:var(--text-step-2)] text-paint tnum"
                      >
                        {deal.dealId}
                      </td>
                      <td className="px-3 py-2.5 text-[length:var(--text-step-2)] text-paint-worn">
                        {deal.shipper}
                      </td>
                      <td className="px-3 py-2.5 text-[length:var(--text-step-2)] text-paint-worn">
                        {deal.cargo}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[length:var(--text-step-2)] tnum">
                        <span className="font-mono text-paint">{deal.packages}</span>
                        {/* How much of this deal is already off. Not a column of
                            its own, but without it the panel can no longer settle
                            where the container's emptying percentage came from. */}
                        <span
                          className={`ms-2 ${done ? 'text-st-done' : 'text-paint-faint'}`}
                        >
                          {done ? 'רוקנה' : `רוקנו ${deal.packagesEmptied}`}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[length:var(--text-step-2)] text-paint-worn tnum">
                        <span dir="ltr" className="inline-block font-mono">
                          {deal.weightKg.toLocaleString('he-IL')}
                        </span>
                        <span className="ms-1.5">ק"ג</span>
                      </td>
                      <td className="px-6 py-2.5 text-[length:var(--text-step-2)] tnum">
                        {deal.availabilityTransmitted ? (
                          <span className="flex items-center gap-2 text-paint">
                            <Check size={15} weight="bold" className="text-st-done" aria-hidden />
                            {deal.availabilityAt && (
                              <span className="font-mono text-paint-worn">
                                {clockOf(deal.availabilityAt)}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-paint-faint">
                            <Minus size={15} weight="bold" aria-hidden />
                            טרם שודרה
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <footer className="border-t border-black px-6 py-3 text-[length:var(--text-step-1)] text-paint-faint">
          נתוני הדגמה. שידור זמינות אינו קיים כיום באף מקור נתונים.
        </footer>
      </motion.div>
    </div>,
    document.body,
  )
}
