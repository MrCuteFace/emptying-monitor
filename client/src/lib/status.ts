import type { ContainerStatus } from '../api/types'

type StatusMeta = {
  /** Short label used on the legend plate and in the hover plate. */
  short: string
  /** The paint on a container face, or null when the container is not on the yard yet. */
  paint: string | null
  /** Where the spec puts it. Empty for pre-arrival stages. */
  where: string
}

export const STATUS: Record<ContainerStatus, StatusMeta> = {
  expected_unescorted: {
    short: 'צפויה לכניסה, ללא ליווי',
    paint: null,
    where: '',
  },
  expected_escorted: {
    short: 'צפויה לכניסה, עם ליווי',
    paint: null,
    where: '',
  },
  work_order_issued: {
    short: 'נמסר סידור עבודה לנהג',
    paint: null,
    where: '',
  },
  at_terminal: {
    short: 'הגיעה למסוף, מתוכננת כניסה לשטח ריקון',
    paint: 'var(--color-st-terminal)',
    where: 'ערוגה עליונה',
  },
  placed_unopened: {
    short: 'הוצבה בשטח ריקון, טרם נפתחה',
    paint: 'var(--color-st-unopened)',
    where: 'שטח ריקון A / B',
  },
  emptying: {
    short: 'בתהליך ריקון פעיל',
    paint: 'var(--color-st-emptying)',
    where: 'שטח ריקון A / B',
  },
  emptied_in_lane: {
    short: 'רוקנה במלואה',
    paint: 'var(--color-st-done)',
    where: 'שטח ריקון A / B',
  },
  cleared: {
    short: 'יצאה משטח הריקון ורוקנה',
    paint: 'var(--color-st-cleared)',
    where: 'ערוגה תחתונה',
  },
  departed_terminal: {
    short: 'רוקנה ויצאה מהמסוף',
    paint: 'var(--color-st-departed)',
    where: 'איננה בשטח',
  },
}

export const URGENT = {
  short: 'מכולה דחופה לריקון',
  paint: 'var(--color-st-urgent)',
  where: 'סימון משולב על גבי כל סטטוס',
}

/** Status paints only ever land on a container face, never on chrome. */
export function facePaint(status: ContainerStatus): string {
  return STATUS[status].paint ?? 'var(--color-st-terminal)'
}

export function timeAgo(iso: string): string {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return 'עכשיו'
  if (diffMin < 60) return `לפני ${diffMin} דק׳`
  const hours = Math.floor(diffMin / 60)
  const rest = diffMin % 60
  return rest === 0 ? `לפני ${hours} שע׳` : `לפני ${hours} שע׳ ${rest} דק׳`
}

export function clockOf(iso: string): string {
  return new Date(iso).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Date and clock together, for the two moments that are facts about a finished
 * container rather than "how long ago": when it was emptied and when it left.
 * Those can be days old, and a bare clock reading would hide the day.
 */
export function stampOf(iso: string): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })
  return `${date} ${clockOf(iso)}`
}

/**
 * A clock reading for today and a dated one for anything older. A container
 * that left the terminal yesterday afternoon showed `14:03`, which reads as
 * this afternoon on a board that is mostly today.
 */
export function whenOf(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  return sameDay ? clockOf(iso) : stampOf(iso)
}
