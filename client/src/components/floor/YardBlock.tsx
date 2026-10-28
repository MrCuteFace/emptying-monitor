import { AnimatePresence } from 'motion/react'
import type { ContainerCard } from '../../api/types'
import { ContainerBox } from '../yard/ContainerBox'
import { SignHead } from '../ui/SignHead'

type YardBlockProps = {
  title: string
  cards: ContainerCard[]
  emptyNote: string
  searching: boolean
  isHit: (containerNumber: string) => boolean
  showNumbers?: boolean
  /** Appended to the count on the sign head, e.g. the day a bed covers. */
  scope?: string
  className?: string
}

/** A yard bed: containers standing head-on in rows, no numbered slots. */
export function YardBlock({
  title,
  cards,
  emptyNote,
  searching,
  isHit,
  showNumbers,
  scope,
  className,
}: YardBlockProps) {
  const urgent = cards.filter((c) => c.urgent).length

  return (
    <section className={className}>
      <SignHead
        title={title}
        hazard={urgent > 0}
        aside={
          <span>
            {cards.length} מכולות
            {scope && <span className="text-paint-faint"> · {scope}</span>}
          </span>
        }
      />

      {cards.length === 0 ? (
        <p className="border-2 border-dashed border-paint-faint/55 bg-black/25 px-4 py-10 text-center text-[length:var(--text-step-2)] text-paint-faint">
          {emptyNote}
        </p>
      ) : (
        <div className="grid grid-cols-6 gap-2 2xl:grid-cols-8">
          <AnimatePresence initial={false}>
            {cards.map((card) => (
              <ContainerBox
                key={card.containerNumber}
                card={card}
                hit={isHit(card.containerNumber)}
                miss={searching && !isHit(card.containerNumber)}
                showNumber={showNumbers}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}
