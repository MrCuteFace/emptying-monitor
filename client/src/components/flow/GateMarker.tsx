import type { FlowStage } from '../../api/types'
import { UrgentMark } from '../yard/UrgentMark'

type GateMarkerProps = {
  stage: FlowStage
  index: number
  selected: boolean
  maxCount: number
  totalCount: number
  onSelect: () => void
}

/**
 * One gate on the route. Two things carry the count: the block's own height,
 * which makes the rail a chart rather than a nav list, and the painted bar's
 * length.
 *
 * Every gate stays on screen, because a route you have to scroll is not a
 * route — but nine gates only fit a window about 900px tall or more. Below
 * that the block sheds its second line, its numeral steps down a size and the
 * floor drops, and below roughly 820px the rail finally scrolls. It used to do
 * none of this and simply overflowed its box, painting the last gates on top
 * of the measures strip underneath.
 */
export function GateMarker({
  stage,
  index,
  selected,
  maxCount,
  totalCount,
  onSelect,
}: GateMarkerProps) {
  const share = maxCount > 0 ? Math.max(stage.count / maxCount, 0.015) : 0

  // The block's height is the count and nothing else. Two things broke this
  // before: flat bonuses added to every gate, which compressed the range that
  // carries the data, and reserving height for one gate's measures, which put
  // the emptiest stage among the tallest blocks. Selection is carried by the
  // reflective edge and the paint, never by size, and the measures now live in
  // their own strip under the rail.
  const grow = 0.25 + 8 * (totalCount > 0 ? stage.count / totalCount : 0)

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? 'true' : undefined}
      style={{ flexGrow: grow }}
      className={`group relative flex shrink-0 basis-auto items-stretch gap-3
        overflow-hidden text-right transition-[flex-grow,background] duration-[var(--t-8)] ease-yard
        xl:shrink xl:basis-0
        min-h-[4.5rem] [@media(max-height:960px)]:xl:min-h-[3.5rem]
        ${selected ? 'bg-steel' : 'hover:bg-white/4'}`}
    >
      <span
        className={`w-1.5 shrink-0 transition-colors duration-[var(--t-3)] ${
          selected ? 'reflect' : 'bg-paint-faint/40'
        }`}
        aria-hidden
      />

      <span className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-2 pe-4 [@media(max-height:960px)]:xl:gap-1.5 [@media(max-height:960px)]:xl:py-1.5">
        <span className="flex min-w-0 items-center gap-3">
          {/* The size is in classes, not an inline style, so it can step down
              on a short window — where the numeral is what squeezes everything
              else out of the block. */}
          <span
            className={`stencil shrink-0 leading-none tnum transition-colors duration-[var(--t-3)] ${
              selected
                ? 'text-signal text-[length:var(--text-step-6)] [@media(max-height:960px)]:xl:text-[length:var(--text-step-5)]'
                : 'text-paint text-[length:var(--text-step-5)] [@media(max-height:960px)]:xl:text-[length:var(--text-step-4)]'
            }`}
          >
            {stage.count}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[length:var(--text-step-2)] font-medium leading-tight text-paint">
              {stage.name}
            </span>
            {/* The second line is the first thing to go on a short window:
                nine gates, a search plate and the measures strip do not fit a
                laptop's height, and a clipped rail is worse than a terser one. */}
            <span className="block truncate text-[length:var(--text-step-2)] leading-tight text-paint-worn [@media(max-height:960px)]:xl:hidden">
              {stage.note}
            </span>
          </span>

          {stage.urgentCount > 0 && (
            <span className="flex shrink-0 items-center gap-1.5">
              <UrgentMark size={16} />
              <span className="font-mono text-[length:var(--text-step-2)] text-st-urgent tnum">
                {stage.urgentCount}
              </span>
            </span>
          )}

          <span
            className="stencil shrink-0 text-[length:var(--text-step-2)] leading-none text-paint-faint tnum"
            aria-hidden
          >
            {index + 1}
          </span>
        </span>

        {/* The road marking: its length is the count. It never shrinks away —
            it is the second carrier of the same figure, and on a short window
            the flex column was squeezing it to nothing. */}
        <span className="block h-1.5 w-full shrink-0 bg-black/45" aria-hidden>
          <span
            className={`block h-full origin-right transition-transform duration-[var(--t-8)] ease-yard ${
              selected ? 'bg-signal' : 'bg-paint-worn'
            }`}
            style={{ transform: `scaleX(${share})` }}
          />
        </span>

      </span>
    </button>
  )
}
