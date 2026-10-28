import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { UrgentMark } from '../yard/UrgentMark'

type MarkBarProps = {
  query: string
  onQuery: (value: string) => void
  hits: number
  unmarkedHits: number
  onMarkHits: () => void
  busy: boolean
}

/**
 * Find containers by number and flag the hits. The search itself paints in
 * chrome, because finding is wayfinding; urgency stays the yard's own colour.
 */
export function MarkBar({
  query,
  onQuery,
  hits,
  unmarkedHits,
  onMarkHits,
  busy,
}: MarkBarProps) {
  const searching = query.trim().length > 0

  return (
    <div className="plate flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
      {/* A floor big enough to need a min width: the toggle and the hint used to
          squeeze this field down to a couple of characters. */}
      <label className="flex min-w-[16rem] flex-1 items-center gap-3">
        <MagnifyingGlass size={18} weight="bold" className="shrink-0 text-paint-worn" />
        <span className="sr-only">חיפוש מספר מכולה</span>
        <input
          dir="ltr"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="123 / ZLDU"
          className="field min-w-0 flex-1 px-3 py-2 text-start font-mono text-[length:var(--text-step-2)] tnum"
        />
      </label>

      {searching && (
        <>
          <span className="text-[length:var(--text-step-2)] text-paint-worn tnum">
            {hits} מסומנות
          </span>

          <button
            type="button"
            onClick={onMarkHits}
            disabled={busy || unmarkedHits === 0}
            className="flex items-center gap-2 border border-signal px-3 py-2 text-[length:var(--text-step-2)] text-signal transition-colors duration-[var(--t-2)] hover:bg-signal hover:text-asphalt active:translate-y-px disabled:border-rule disabled:text-paint-faint disabled:hover:bg-transparent disabled:hover:text-paint-faint"
          >
            <UrgentMark size={15} />
            סמן {unmarkedHits > 0 ? unmarkedHits : ''} כדחופות
          </button>

          <button
            type="button"
            onClick={() => onQuery('')}
            aria-label="נקה חיפוש"
            className="flex items-center gap-1.5 border border-white/12 px-3 py-2 text-[length:var(--text-step-2)] text-paint-worn transition-colors duration-[var(--t-2)] hover:border-paint-worn hover:text-paint active:translate-y-px"
          >
            <X size={14} weight="bold" />
            נקה
          </button>
        </>
      )}

      {!searching && (
        <span className="text-[length:var(--text-step-2)] text-paint-worn">
          חיפוש מסמן את המכולות התואמות. לחיצה על מכולה פותחת את לוחית הפרטים שלה.
        </span>
      )}
    </div>
  )
}
