import { motion, useReducedMotion } from 'motion/react'
import type { FlowStage } from '../../api/types'
import { STATUS, facePaint, timeAgo, whenOf } from '../../lib/status'
import { UrgentMark } from '../yard/UrgentMark'

type ManifestProps = {
  /** Already narrowed to the searched forwarder, if one is being searched. */
  stage: FlowStage
  /** What this stage holds before the search, for the "x of y" reading. */
  stageTotal: number
  searching: boolean
  /** Hits across every stage; zero means the forwarder is not on the terminal. */
  totalHits: number
  /**
   * Other gates holding containers of the searched forwarder, so an empty table
   * here does not read as "this forwarder has nothing on the terminal".
   */
  elsewhere: { name: string; count: number }[]
}

/**
 * The gate's interior: galvanized sheet behind the painted rail, carrying the
 * actual containers standing at that stage rather than a count of them.
 */
export function Manifest({
  stage,
  stageTotal,
  searching,
  totalHits,
  elsewhere,
}: ManifestProps) {
  const reduce = useReducedMotion()
  const onTheYard = STATUS[stage.key].paint !== null
  const showWho = stage.containers.some((c) => c.driver || c.position)
  const whoLabel = stage.containers.some((c) => c.driver) ? 'נהג' : 'נתיב'
  const rows = stage.containers

  return (
    <motion.section
      key={stage.key}
      initial={reduce ? false : { clipPath: 'inset(0 0 100% 0)', opacity: 0.4 }}
      animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.24, ease: [0.22, 1, 0.28, 1] }}
      className="galv flex flex-col xl:min-h-0 xl:flex-1"
    >
      <header className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b border-black px-6 py-5">
        <h2 className="stencil text-[length:var(--text-step-5)] leading-none text-paint">
          {stage.name}
        </h2>
        <p className="text-[length:var(--text-step-2)] text-paint-worn">{stage.note}</p>
        <p className="ms-auto text-[length:var(--text-step-2)] text-paint tnum">
          {stage.count} מכולות
          {searching && (
            <span className="ms-2 text-paint-worn">מתוך {stageTotal} בשלב</span>
          )}
        </p>
        {stage.urgentCount > 0 && (
          <p className="flex items-center gap-2 text-[length:var(--text-step-2)] text-st-urgent tnum">
            <UrgentMark size={16} />
            {stage.urgentCount} דחופות
          </p>
        )}
      </header>

      {rows.length > 0 ? null : searching && totalHits === 0 ? (
        <Blank>לא נמצאו מכולות של משלח בשם הזה באף שלב</Blank>
      ) : searching ? (
        <Blank>
          אין מכולות של משלח זה בשלב זה
          {elsewhere.length > 0 && (
            <span className="mt-3 block text-[length:var(--text-step-1)]">
              נמצאו בשלבים אחרים: {elsewhere.map((s) => `${s.name} (${s.count})`).join(' · ')}
            </span>
          )}
        </Blank>
      ) : (
        <Blank>אין מכולות בשלב זה כרגע</Blank>
      )}

      {rows.length > 0 && (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse text-right">
            <thead className="sticky top-0 z-10 bg-galv">
              <tr className="text-[length:var(--text-step-2)] text-paint-worn">
                <th scope="col" className="px-3 py-2 font-medium sm:px-6">משלח</th>
                <th scope="col" className="px-3 py-2 font-medium">מספר מכולה</th>
                <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">מניפסט</th>
                <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">
                  סוג מכולה
                </th>
                <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">
                  סוכן אוניה
                </th>
                <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">לקוח</th>
                {showWho && (
                  <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">
                    {whoLabel}
                  </th>
                )}
                <th scope="col" className="hidden px-6 py-2 font-medium sm:table-cell">עודכן</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.containerNumber}
                  className="border-t border-white/6 transition-colors duration-[var(--t-2)] hover:bg-white/5"
                >
                  {/* The row's head: this container's paint and its urgency stay
                      at the start of the line, where the eye lands. */}
                  <td className="px-3 py-2.5 sm:px-6">
                    <span className="flex items-center gap-3">
                      {onTheYard && (
                        <span
                          className="h-5 w-1.5 shrink-0"
                          style={{ background: facePaint(c.status) }}
                          aria-hidden
                        />
                      )}
                      {c.urgent && <UrgentMark size={16} />}
                      <span
                        className="min-w-0 max-w-[8rem] truncate text-[length:var(--text-step-2)] text-paint sm:max-w-[18rem]"
                        title={c.shipper}
                      >
                        {c.shipper}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="block whitespace-nowrap font-mono text-[length:var(--text-step-2)] text-paint">
                      {c.containerNumber}
                    </span>
                    {/* Narrow screens have no room for their own columns. */}
                    <span className="block text-[length:var(--text-step-1)] text-paint-worn sm:hidden">
                      {[
                        whenOf(c.updatedAt),
                        c.manifestNumber,
                        `${c.sizeFeet} ${c.typeCode}`,
                        c.shippingAgent,
                        c.customer,
                        c.driver ?? c.position,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </td>
                  <td className="hidden px-3 py-2.5 font-mono text-[length:var(--text-step-2)] text-paint-worn tnum sm:table-cell">
                    {c.manifestNumber}
                  </td>
                  <td
                    dir="ltr"
                    className="hidden whitespace-nowrap px-3 py-2.5 text-end font-mono text-[length:var(--text-step-2)] text-paint-worn tnum sm:table-cell"
                  >
                    {c.sizeFeet} {c.typeCode}
                  </td>
                  <td className="hidden px-3 py-2.5 text-[length:var(--text-step-2)] text-paint-worn sm:table-cell">
                    {c.shippingAgent}
                  </td>
                  <td className="hidden px-3 py-2.5 text-[length:var(--text-step-2)] text-paint-worn sm:table-cell">
                    {c.customer}
                  </td>
                  {showWho && (
                    <td className="hidden px-3 py-2.5 text-[length:var(--text-step-2)] text-paint-worn sm:table-cell">
                      {c.driver ?? c.position ?? ''}
                    </td>
                  )}
                  <td className="hidden whitespace-nowrap px-6 py-2.5 text-[length:var(--text-step-2)] tnum sm:table-cell">
                    <span className="font-mono text-paint">{whenOf(c.updatedAt)}</span>
                    <span className="ms-3 text-paint-worn">{timeAgo(c.updatedAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  )
}

function Blank({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-6 border-2 border-dashed border-paint-faint/50 px-6 py-12 text-center text-[length:var(--text-step-2)] text-paint-faint">
      {children}
    </p>
  )
}
