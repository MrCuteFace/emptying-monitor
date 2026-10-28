import type { ReactNode } from 'react'
import { UrgentMark } from '../yard/UrgentMark'

type SignHeadProps = {
  title: string
  aside?: ReactNode
  /** A block holding urgent containers carries the urgency mark on its head. */
  hazard?: boolean
}

/**
 * The world's section heading: a reflective bar bolted to the start of a
 * stencilled title, with a painted rule under it. Not a card header.
 */
export function SignHead({ title, aside, hazard }: SignHeadProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-3">
        <span className="reflect h-6 w-1.5 shrink-0" aria-hidden />
        <h2 className="stencil text-[length:var(--text-step-4)] leading-none text-paint">{title}</h2>
        {hazard && <UrgentMark size={18} />}
        {aside && (
          <span className="ms-auto text-[length:var(--text-step-2)] text-paint-worn tnum">
            {aside}
          </span>
        )}
      </div>
      <div className="marking mt-2 h-px w-full opacity-40" aria-hidden />
    </div>
  )
}
