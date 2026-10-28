import { MagnifyingGlass, X } from '@phosphor-icons/react'

type ShipperSearchProps = {
  query: string
  onQuery: (value: string) => void
  /** Containers matching the forwarder, across every stage. */
  hits: number
  /** Containers on the terminal, before the search. */
  pool: number
}

/**
 * Finds a forwarder anywhere on the terminal. It sits above the route rather
 * than inside a gate because it narrows the whole pool: every gate then counts
 * that forwarder's containers only, so the rail itself answers "where are they"
 * instead of the question being answered by opening gates one at a time.
 *
 * It filters rather than marks, the opposite of the yard's search bar: on the
 * floor you cannot make a container disappear, so there the hits get painted.
 */
export function ShipperSearch({ query, onQuery, hits, pool }: ShipperSearchProps) {
  const searching = query.trim().length > 0

  return (
    <div className="plate mb-3 shrink-0 px-4 py-3">
      <label className="flex min-w-0 items-center gap-3">
        <MagnifyingGlass size={18} weight="bold" className="shrink-0 text-paint-worn" aria-hidden />
        <span className="sr-only">חיפוש משלח בכל השלבים</span>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="חיפוש משלח"
          className="field min-w-0 flex-1 px-3 py-2 text-[length:var(--text-step-2)]"
        />
      </label>

      {searching ? (
        <div className="mt-3">
          <div className="flex items-center gap-x-4">
            <span className="text-[length:var(--text-step-2)] text-paint tnum">
              {hits} מכולות מתוך {pool}
            </span>
            <button
              type="button"
              onClick={() => onQuery('')}
              aria-label="נקה חיפוש"
              className="ms-auto flex shrink-0 items-center gap-1.5 border border-white/12 px-3 py-1.5 text-[length:var(--text-step-2)] text-paint-worn transition-colors duration-[var(--t-2)] hover:border-paint-worn hover:text-paint active:translate-y-px"
            >
              <X size={14} weight="bold" aria-hidden />
              נקה
            </button>
          </div>
          <p className="mt-2 text-[length:var(--text-step-2)] text-paint-worn">
            כל השלבים סופרים את המשלח הזה בלבד
          </p>
        </div>
      ) : (
        <p className="mt-3 text-[length:var(--text-step-2)] text-paint-worn [@media(max-height:960px)]:xl:hidden">
          חיפוש משלח מצמצם את כל השלבים אליו, כך שהמספרים על המסלול הם שלו.
        </p>
      )}
    </div>
  )
}
