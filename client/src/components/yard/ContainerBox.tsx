import { motion, useReducedMotion } from 'motion/react'
import type { ContainerCard } from '../../api/types'
import { digitsOf } from '../../lib/marking'
import { STATUS } from '../../lib/status'
import { useStatusChange } from '../../lib/useStatusChange'
import { ContainerFace } from './ContainerFace'
import { useHoverPlate } from './HoverPlate'

type ContainerBoxProps = {
  card: ContainerCard
  /** A search is running and this container is a hit. */
  hit?: boolean
  /** A search is running and this container is not a hit. */
  miss?: boolean
  /** Stencil the container's digits across the foot of the face. */
  showNumber?: boolean
}

/**
 * One container standing in the yard or in a bay. The face carries no text by
 * design, per the spec; everything readable lives in the plate.
 *
 * Pressing pins that plate, which is where both actions now live. It used to
 * flip urgency directly, but the board grew a second thing you can do with a
 * container — read its deals — and one press cannot mean two things.
 */
export function ContainerBox({ card, hit, miss, showNumber }: ContainerBoxProps) {
  const reduce = useReducedMotion()
  const { show, hide, pin, pinnedNumber } = useHoverPlate()
  const changed = useStatusChange(`${card.containerNumber}:${card.status}:${card.urgent}`, 720)

  const pinnedHere = pinnedNumber === card.containerNumber

  // Only a container actually being emptied carries a level. Everywhere else the
  // figure would be a constant 0% or 100% and the line would be noise.
  const emptiedShare =
    card.status === 'emptying' && card.packages > 0
      ? card.packagesEmptied / card.packages
      : null

  const label =
    `מכולה ${card.containerNumber}, מניפסט ${card.manifestNumber}, ` +
    `${card.sizeFeet} ${card.typeCode}, ` +
    `${STATUS[card.status].short}` +
    (emptiedShare === null
      ? ''
      : `, רוקנו ${card.packagesEmptied} מתוך ${card.packages} אריזות`) +
    `${card.urgent ? ', מסומנת דחופה' : ''}` +
    `${hit ? ', תואמת לחיפוש' : ''}`

  return (
    <motion.button
      type="button"
      data-container-box
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.28, 1] }}
      onClick={(e) => pin(card, e.currentTarget)}
      onMouseEnter={(e) => show(card, e.currentTarget)}
      onMouseLeave={hide}
      onFocus={(e) => show(card, e.currentTarget)}
      onBlur={hide}
      aria-label={label}
      aria-expanded={pinnedHere}
      title="פרטים ופעולות"
      className={`group relative block w-full cursor-pointer transition-[filter] duration-[var(--t-3)] hover:brightness-115
        ${pinnedHere ? 'z-20 outline outline-2 outline-signal' : ''}
        ${hit ? 'search-hit z-10' : ''}
        ${miss ? 'search-miss' : ''}`}
    >
      <ContainerFace
        status={card.status}
        urgent={card.urgent}
        emptiedShare={emptiedShare}
        label={showNumber ? digitsOf(card.containerNumber) : undefined}
      >
        {changed && (
          <span className="motion-flash pointer-events-none absolute inset-0 bg-paint" aria-hidden />
        )}
      </ContainerFace>
    </motion.button>
  )
}

/** An empty bay: the slot painted on the asphalt with nothing standing in it. */
export function EmptyBay() {
  return (
    <div className="block w-full" aria-hidden>
      <span className="block h-[9%] w-full" />
      <span className="block aspect-[24/26] w-full border-2 border-dashed border-paint-faint/45 bg-black/35" />
    </div>
  )
}
