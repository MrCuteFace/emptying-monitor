/**
 * The static demo's back end: answers the four `/api/*` routes of `server/Program.cs` from the
 * in-browser simulation, by standing in for `fetch`. Everything else goes to the network as usual.
 */
import { TerminalSimulation } from './simulation'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

export function installMockServer() {
  const sim = new TerminalSimulation()
  const realFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url, window.location.href)
    const at = url.pathname.indexOf('/api/')
    if (at < 0) return realFetch(input, init)

    const route = url.pathname.slice(at)
    const method = (init?.method ?? 'GET').toUpperCase()

    if (method === 'GET' && route === '/api/flow') return json(sim.getFlow())
    if (method === 'GET' && route === '/api/floor') return json(sim.getFloor())
    if (method === 'GET' && route === '/api/health') return json({ status: 'ok', mode: 'prototype', store: 'in-browser' })

    if (method === 'GET' && route === '/api/deals') {
      const deals = sim.getDeals(url.searchParams.get('container') ?? '')
      return deals ? json(deals) : json({ error: 'not found' }, 404)
    }

    if (method === 'PATCH' && route === '/api/containers/urgent') {
      const body = JSON.parse(String(init?.body ?? '{}')) as { containerNumbers?: string[]; urgent?: boolean }
      const numbers = body.containerNumbers ?? []
      if (numbers.length === 0) return json({ error: 'containerNumbers is required' }, 400)
      return json({ changed: sim.setUrgent(numbers, Boolean(body.urgent)) })
    }

    return json({ error: 'not found' }, 404)
  }
}
