import { Warning } from '@phosphor-icons/react'

/**
 * The urgency mark, wherever urgency is being reported away from a container
 * face: beside an urgent count, on a sign head whose block holds urgent boxes,
 * in the hover plate.
 *
 * One rule decides between this and hazard striping: **striping is decoration,
 * the triangle means urgent.** So the gantry band stays striped and the fault
 * plate stays striped, because neither is reporting container urgency, and
 * everything that is reporting it carries this instead.
 */
export function UrgentMark({ size = 16 }: { size?: number }) {
  return (
    <Warning
      size={size}
      weight="fill"
      color="var(--color-st-urgent)"
      className="shrink-0"
      aria-hidden
    />
  )
}
