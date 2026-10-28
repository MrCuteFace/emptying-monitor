import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import type { FlowSnapshot } from '../../api/types'
import { useFeed } from '../../api/useFeed'
import { useSignalReady } from '../brand/BootGate'
import { FeedFault, LoadingGround } from '../ui/States'
import { GateMarker } from './GateMarker'
import { Manifest } from './Manifest'
import { ShipperSearch } from './ShipperSearch'

export function FlowPage({ live }: { live: boolean }) {
  const { data, error, loading, refresh } = useFeed<FlowSnapshot>('/api/flow', 3840, live)
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const term = query.trim().toLowerCase()

  // The search narrows the pool, not the open gate: every stage is rebuilt from
  // this forwarder's containers alone, so the counts, the urgent marks and the
  // block heights on the rail are all his. That is the whole point of putting
  // the field above the route — customer service reads where his containers are
  // off the rail instead of opening gates one by one looking for them.
  const stages = useMemo(() => {
    if (!data) return []
    if (!term) return data.stages
    return data.stages.map((s) => {
      const containers = s.containers.filter((c) => c.shipper.toLowerCase().includes(term))
      return {
        ...s,
        containers,
        count: containers.length,
        urgentCount: containers.filter((c) => c.urgent).length,
      }
    })
  }, [data, term])

  // Open on the gate that actually needs watching: the one holding the most
  // urgent containers, or the busiest if nothing is urgent.
  useEffect(() => {
    if (openKey || !data) return
    const ranked = [...data.stages].sort(
      (a, b) => b.urgentCount - a.urgentCount || b.count - a.count,
    )
    setOpenKey(ranked[0]?.key ?? null)
  }, [data, openKey])

  // A new search that leaves the open gate empty moves to where the hits
  // actually are. Without it the first thing a search shows is an empty table,
  // which reads as "nothing found" even when the rail beside it says otherwise.
  //
  // It fires on a change of term and nothing else. Re-running it whenever the
  // open gate happens to be empty would fight the user: clicking an empty gate
  // deliberately, to confirm the forwarder is not there, would bounce straight
  // back, and a tick that emptied the open gate would yank the view away.
  const jumpedFor = useRef<string | null>(null)
  useEffect(() => {
    if (jumpedFor.current === term) return
    if (stages.length === 0) return
    jumpedFor.current = term
    if (!term) return
    const current = stages.find((s) => s.key === openKey)
    if (current && current.count > 0) return
    const best = [...stages].sort((a, b) => b.count - a.count)[0]
    if (best && best.count > 0) setOpenKey(best.key)
  }, [term, stages, openKey])

  // Lift the boot cover once there is a real picture, or once the feed has
  // failed, so a dead server shows its fault plate instead of loading forever.
  const signalReady = useSignalReady()
  useEffect(() => {
    if (data || error) signalReady()
  }, [data, error, signalReady])

  if (loading && !data) return <LoadingGround rows={8} />
  if (!data) return <FeedFault message={error ?? 'no data'} onRetry={refresh} />

  const open = stages.find((s) => s.key === openKey) ?? stages[0]
  const openRaw = data.stages.find((s) => s.key === open.key) ?? open
  const maxCount = Math.max(...stages.map((s) => s.count), 1)
  const totalCount = stages.reduce((sum, s) => sum + s.count, 0)
  const poolCount = data.stages.reduce((sum, s) => sum + s.count, 0)

  const elsewhere = term
    ? stages
        .filter((s) => s.key !== open.key && s.count > 0)
        .map((s) => ({ name: s.name, count: s.count }))
    : []

  return (
    <div className="flex flex-col gap-6 xl:h-full">
      {error && <FeedFault message={error} onRetry={refresh} />}

      <div className="grid gap-x-8 gap-y-6 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(340px,27rem)_minmax(0,1fr)]">
        {/* Inline start, the right in RTL: the container's life, stage by
            stage. One linked field that re-proportions as stages fill. */}
        <div className="flex flex-col xl:min-h-0">
          <ShipperSearch query={query} onQuery={setQuery} hits={totalCount} pool={poolCount} />

          {/*
            Nine gates each need a legible block, and on a laptop-height window
            the column cannot hold them all. Before this the blocks simply
            overflowed their box and painted over the measures strip below.
            Scrolling the rail is the lesser evil: on the wall screen it never
            scrolls, and where it must, a route you can scroll beats two things
            drawn on top of each other.
          */}
          <nav
            aria-label="חיי המכולה במסוף"
            className="flex flex-col border-s border-white/8 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-contain"
          >
            {stages.map((stage, i) => (
              <GateMarker
                key={stage.key}
                stage={stage}
                index={i}
                selected={stage.key === open.key}
                maxCount={maxCount}
                totalCount={totalCount}
                onSelect={() => setOpenKey(stage.key)}
              />
            ))}
          </nav>

        </div>

        {/* Inline end, the left in RTL: the open gate's interior. */}
        <div className="flex min-w-0 flex-col xl:min-h-0">
          <AnimatePresence mode="wait">
            <Manifest
              key={open.key}
              stage={open}
              stageTotal={openRaw.count}
              searching={term.length > 0}
              totalHits={totalCount}
              elsewhere={elsewhere}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
