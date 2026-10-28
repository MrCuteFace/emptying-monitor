import { Warning } from '@phosphor-icons/react'
import type { ContainerStatus } from '../../api/types'
import { facePaint } from '../../lib/status'

type ContainerFaceProps = {
  status: ContainerStatus
  urgent: boolean
  /**
   * How much of the cargo is already off, 0 to 1. Drawn as a level: solid below
   * the line is what is still inside, hollow above it is what has come out.
   * Null on every container that is not being emptied right now.
   */
  emptiedShare?: number | null
  /**
   * The container's own number, stencilled across the foot of the door. Off by
   * default: the spec says the faces carry no text, and this is the switch that
   * overrides it for the times someone needs to read a box from the board.
   */
  label?: string
  /** Overlay rendered inside the front face, e.g. the status-change flash. */
  children?: React.ReactNode
}

/**
 * The container drawn head-on. A real box front is 2.44m wide by 2.59m high,
 * so the face is slightly taller than it is wide; anything wider stops reading
 * as a container and starts reading as a table row.
 *
 * The doors are always shut. An earlier version varied them by status (sealed,
 * closed, ajar, open) so status had a second carrier besides hue; the user's
 * call is that the paint says it clearly enough, so the drawing is constant and
 * only the colour changes.
 *
 * Urgency is the warning triangle, chosen over hazard striping after comparing
 * both on the live board. It is the one status signal that does not depend on
 * hue, and it separates on red, yellow and green alike.
 *
 * Shared by the yard, the bays and the legend so all three lean the same way.
 */
export function ContainerFace({
  status,
  urgent,
  emptiedShare,
  label,
  children,
}: ContainerFaceProps) {
  const paint = facePaint(status)
  const level =
    emptiedShare == null ? null : Math.round(Math.min(Math.max(emptiedShare, 0), 1) * 100)

  return (
    <>
      {/* Top face: seen from slightly above, receding to the left. */}
      <span
        className="block h-[9%] w-full"
        style={{
          background: `color-mix(in srgb, ${paint} 68%, #ffffff)`,
          transform: 'skewX(45deg)',
          transformOrigin: 'bottom right',
          transition: 'background var(--t-3) var(--ease-yard)',
        }}
        aria-hidden
      />

      {/* Front face: two corrugated door leaves. */}
      <span
        className="@container relative block aspect-[24/26] w-full overflow-hidden transition-[background,filter] duration-[var(--t-3)] ease-yard"
        style={{
          backgroundColor: paint,
          backgroundImage: [
            'linear-gradient(90deg, transparent 0 17%, rgb(0 0 0 / 0.32) 17% 19%, transparent 19% 31%, rgb(0 0 0 / 0.32) 31% 33%, transparent 33% 67%, rgb(0 0 0 / 0.32) 67% 69%, transparent 69% 81%, rgb(0 0 0 / 0.32) 81% 83%, transparent 83%)',
            'repeating-linear-gradient(90deg, rgb(0 0 0 / 0.20) 0 2px, rgb(255 255 255 / 0.11) 2px 4px, transparent 4px 11px)',
            'linear-gradient(180deg, rgb(255 255 255 / 0.18), transparent 46%, rgb(0 0 0 / 0.34))',
          ].join(','),
          boxShadow:
            'inset 0 4px 0 rgb(0 0 0 / 0.34), inset 0 -5px 0 rgb(0 0 0 / 0.42), inset 3px 0 0 rgb(0 0 0 / 0.26), inset -3px 0 0 rgb(0 0 0 / 0.26)',
        }}
      >
        {/* The seam between the two leaves: part of the object, not a status. */}
        <span
          className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-black/55"
          aria-hidden
        />

        {/*
          The emptying level. A quantity, not a status: the paint still carries
          the status on its own, which is the user's standing rule. It reads from
          across the room, which no number on a bay-sized box would.

          inset-0, not top-0: the band's height is a percentage, and a
          percentage height needs a parent with a definite one.
        */}
        {level !== null && (
          <span className="pointer-events-none absolute inset-0" aria-hidden>
            <span
              className="block w-full bg-black/45 transition-[height] duration-[var(--t-8)] ease-yard"
              style={{ height: `${level}%` }}
            />
            <span className="block h-[2px] w-full bg-white/60" />
          </span>
        )}

        {/*
          The road-sign form, sitting directly on the face. The dark halo is
          what keeps the orange legible where it lands on a yellow container,
          which is the weakest of the three backgrounds it has to work on.
        */}
        {urgent && (
          <span
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <Warning
              size="56%"
              weight="fill"
              color="var(--color-st-urgent)"
              style={{
                filter:
                  'drop-shadow(0 0 1px rgb(0 0 0 / 0.95)) drop-shadow(0 1px 2px rgb(0 0 0 / 0.7))',
              }}
            />
          </span>
        )}

        {/*
          The number is sized from the box, not from the type scale: it is part
          of the drawing of the object, like the corrugation, and it has to stay
          legible on a bay 56px wide and on a yard box twice that. The dark band
          is what carries it across six different paints.
        */}
        {label && (
          <span
            className="absolute inset-x-0 bottom-0 bg-black/60 py-[3%] text-center font-mono tabular-nums leading-none tracking-tight text-white/90"
            style={{ fontSize: 'clamp(7px, 13cqw, 13px)' }}
            aria-hidden
          >
            {label}
          </span>
        )}

        {children}
      </span>
    </>
  )
}
