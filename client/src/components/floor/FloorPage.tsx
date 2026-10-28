import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ContainerCard, FloorSnapshot } from '../../api/types'
import { useFeed } from '../../api/useFeed'
import { useSignalReady } from '../brand/BootGate'
import { setUrgent } from '../../api/mutations'
import { allOnFloor, applyUrgent, makeMatcher } from '../../lib/marking'
import { HoverPlateProvider } from '../yard/HoverPlate'
import { FeedFault, LoadingGround } from '../ui/States'
import { BayBlock } from './BayBlock'
import { DealsPanel } from './DealsPanel'
import { LegendDrawer } from './LegendDrawer'
import { MarkBar } from './MarkBar'
import { YardBlock } from './YardBlock'

export function FloorPage({ live, showNumbers }: { live: boolean; showNumbers: boolean }) {
  const { data, error, loading, refresh, mutate } = useFeed<FloorSnapshot>(
    '/api/floor',
    3840,
    live,
  )
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [writeError, setWriteError] = useState<string | null>(null)
  const [dealsFor, setDealsFor] = useState<ContainerCard | null>(null)

  const isHit = useMemo(() => makeMatcher(query), [query])
  const searching = query.trim().length > 0

  const hits = useMemo(
    () => (data ? allOnFloor(data).filter((c) => isHit(c.containerNumber)) : []),
    [data, isHit],
  )
  // Containers that have left cannot be hurried, so a bulk mark skips them
  // even though the search still finds them.
  const unmarkedHits = useMemo(
    () => hits.filter((c) => !c.urgent && c.status !== 'departed_terminal'),
    [hits],
  )

  /** Writes urgency for a set of containers, showing the change straight away. */
  const write = useCallback(
    async (numbers: string[], urgent: boolean) => {
      if (numbers.length === 0) return
      setBusy(true)
      setWriteError(null)
      mutate((floor) => applyUrgent(floor, numbers, urgent))
      try {
        await setUrgent(numbers, urgent)
      } catch (err) {
        // Put the server's picture back rather than leave a lie on the wall.
        setWriteError(err instanceof Error ? err.message : 'שגיאה לא ידועה')
      } finally {
        await refresh()
        setBusy(false)
      }
    },
    [mutate, refresh],
  )

  const toggleUrgent = useCallback(
    (card: ContainerCard) => void write([card.containerNumber], !card.urgent),
    [write],
  )

  const markHits = useCallback(
    () => void write(unmarkedHits.map((c) => c.containerNumber), true),
    [write, unmarkedHits],
  )

  // The plate stays pinned across polls, so it re-reads its container out of
  // every new snapshot rather than holding the copy it was opened with — the
  // emptying percentage on it is supposed to be moving.
  const byNumber = useMemo(() => {
    const map = new Map<string, ContainerCard>()
    if (data) for (const c of allOnFloor(data)) map.set(c.containerNumber, c)
    return map
  }, [data])

  const resolve = useCallback((n: string) => byNumber.get(n), [byNumber])

  // Lift the boot cover once there is a real picture, or once the feed has
  // failed, so a dead server shows its fault plate instead of loading forever.
  const signalReady = useSignalReady()
  useEffect(() => {
    if (data || error) signalReady()
  }, [data, error, signalReady])

  if (loading && !data) return <LoadingGround rows={10} />
  if (!data) return <FeedFault message={error ?? 'no data'} onRetry={refresh} />

  const shared = { searching, isHit, showNumbers }

  return (
    <HoverPlateProvider
      onToggleUrgent={toggleUrgent}
      onShowDeals={setDealsFor}
      resolve={resolve}
    >
      {/* The bottom padding is deliberate: without it the last row of
          containers ends flush against the edge of the screen, which reads as a
          cut-off picture rather than the end of the list. */}
      <div className="flex flex-col gap-8 pb-16">
        {error && <FeedFault message={error} onRetry={refresh} />}
        {writeError && <FeedFault message={writeError} onRetry={refresh} />}

        <div className="grid gap-x-10 gap-y-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)]">
          {/* Right in RTL: the marking controls, then the two emptying areas. */}
          <div className="flex flex-col gap-7">
            <MarkBar
              query={query}
              onQuery={setQuery}
              hits={hits.length}
              unmarkedHits={unmarkedHits.length}
              onMarkHits={markHits}
              busy={busy}
            />
            <BayBlock area={data.areaA} {...shared} />
            <BayBlock area={data.areaB} {...shared} />

            {/* Gone from the terminal, and only today's exits: the bed empties itself at
                midnight, which is what keeps it to a bed's worth of containers.
                These open like any other container, but their plate has no
                urgency action — there is nothing left to hurry.

                It sits at the foot of this column so that it lands level with
                the cleared bed opposite it: both beds are the same height, and
                the grid stretches both columns to the same bottom line, so the
                two finished beds read as one band across the board. */}
            <YardBlock
              title="מכולות שרוקנו ויצאו מהמסוף"
              cards={data.departed}
              emptyNote="טרם יצאה מכולה מהמסוף היום"
              searching={searching}
              isHit={isHit}
              showNumbers={showNumbers}
              scope="היום"
              className="mt-auto"
            />
          </div>

          {/* Left in RTL: the yard beds still on the terminal. */}
          <div className="flex flex-col gap-8">
            <YardBlock
              title="מכולות במסוף הדגמה"
              cards={data.yard}
              emptyNote="אין מכולות הממתינות לשיבוץ"
              {...shared}
            />
            <YardBlock
              title="מכולות במסוף הדגמה שרוקנו"
              cards={data.clearedYard}
              emptyNote="טרם יצאה מכולה משטחי הריקון היום"
              {...shared}
            />
          </div>
        </div>
      </div>

      <LegendDrawer />

      {dealsFor && (
        <DealsPanel
          card={byNumber.get(dealsFor.containerNumber) ?? dealsFor}
          onClose={() => setDealsFor(null)}
        />
      )}
    </HoverPlateProvider>
  )
}
