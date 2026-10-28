/** The one write this prototype makes. Still in-memory on the server. */
export async function setUrgent(containerNumbers: string[], urgent: boolean): Promise<number> {
  const res = await fetch('/api/containers/urgent', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ containerNumbers, urgent }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = (await res.json()) as { changed: number }
  return json.changed
}

/** The deals inside one container, for the panel behind the plate's button. */
export async function fetchDeals(containerNumber: string) {
  const res = await fetch(`/api/deals?container=${encodeURIComponent(containerNumber)}`, {
    headers: { accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as import('./types').ContainerDeals
}
