import type { ContainerCard, FloorSnapshot } from '../api/types'

/**
 * Container numbers are written `ZLDU 123456 7`, but nobody types the spaces.
 * Match on the bare characters so "123" finds the body digits and "zldu" finds
 * the owner prefix.
 */
export function normalize(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase()
}

/**
 * The digits of a container number, without the owner prefix: `ZLDU 726934 7`
 * becomes `7269347`. That is the form the yard uses out loud and the form the
 * terminal's own systems hold as a separate column, so it is what goes on the
 * box when the numbers are switched on.
 */
export function digitsOf(containerNumber: string): string {
  return containerNumber.replace(/\D/g, '')
}

export function makeMatcher(query: string): (containerNumber: string) => boolean {
  const needle = normalize(query)
  if (needle.length === 0) return () => false
  return (containerNumber) => normalize(containerNumber).includes(needle)
}

/** Every container standing anywhere on the floor, in reading order. */
export function allOnFloor(floor: FloorSnapshot): ContainerCard[] {
  return [
    ...floor.areaA.lanes.map((l) => l.container),
    ...floor.areaB.lanes.map((l) => l.container),
    ...floor.yard,
    ...floor.clearedYard,
    ...floor.departed,
  ].filter((c): c is ContainerCard => c !== null)
}

/**
 * Applies an urgency change to a snapshot locally, so a press lands on the
 * screen immediately instead of waiting out the poll interval. The server stays
 * the source of truth; the next snapshot overwrites this.
 */
export function applyUrgent(
  floor: FloorSnapshot,
  containerNumbers: string[],
  urgent: boolean,
): FloorSnapshot {
  const wanted = new Set(containerNumbers)
  const card = (c: ContainerCard): ContainerCard =>
    wanted.has(c.containerNumber) ? { ...c, urgent } : c

  return {
    ...floor,
    areaA: {
      ...floor.areaA,
      lanes: floor.areaA.lanes.map((l) => (l.container ? { ...l, container: card(l.container) } : l)),
    },
    areaB: {
      ...floor.areaB,
      lanes: floor.areaB.lanes.map((l) => (l.container ? { ...l, container: card(l.container) } : l)),
    },
    yard: floor.yard.map(card),
    clearedYard: floor.clearedYard.map(card),
    departed: floor.departed.map(card),
  }
}
