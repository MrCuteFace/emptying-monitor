import type { EmptyingArea } from '../../api/types'
import { ContainerBox, EmptyBay } from '../yard/ContainerBox'
import { SignHead } from '../ui/SignHead'

type BayBlockProps = {
  area: EmptyingArea
  searching: boolean
  isHit: (containerNumber: string) => boolean
  showNumbers?: boolean
}

/**
 * One emptying area: ten numbered bays painted side by side on the asphalt,
 * a single container standing in each. Ten across reads as one area in a
 * glance; ten stacked reads as a list.
 */
export function BayBlock({ area, searching, isHit, showNumbers }: BayBlockProps) {
  const occupied = area.lanes.filter((l) => l.container).length
  const urgent = area.lanes.filter((l) => l.container?.urgent).length

  return (
    <section>
      {/* A plain count, no denominator: the lanes are a layout the screen
          invents, not ten real slots, so there is nothing to be out of. */}
      <SignHead
        title={`שטח ריקון ${area.name}`}
        hazard={urgent > 0}
        aside={<span>{occupied} מכולות</span>}
      />

      <ol className="grid grid-cols-10 gap-x-2">
        {area.lanes.map((lane) => (
          <li key={lane.number} className="min-w-0">
            {lane.container ? (
              <ContainerBox
                card={lane.container}
                hit={isHit(lane.container.containerNumber)}
                miss={searching && !isHit(lane.container.containerNumber)}
                showNumber={showNumbers}
              />
            ) : (
              <EmptyBay />
            )}

            {/* The lane number is painted on the asphalt under the bay. */}
            <span className="stencil mt-2 block text-center text-[length:var(--text-step-2)] leading-none text-paint-worn tnum">
              {lane.number}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
