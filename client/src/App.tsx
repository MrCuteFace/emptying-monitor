import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BootGate } from './components/brand/BootGate'
import { BrandMark } from './components/brand/Brand'
import { FlowPage } from './components/flow/FlowPage'
import { FloorPage } from './components/floor/FloorPage'

type RouteKey = 'flow' | 'floor'

const ROUTES: { key: RouteKey; label: string; note: string }[] = [
  { key: 'flow', label: 'חיי מכולה', note: 'מכניסה עד יציאה' },
  { key: 'floor', label: 'השטח', note: 'תמונת מצב חיה' },
]

export default function App() {
  const [route, setRoute] = useState<RouteKey>('flow')
  const [live, setLive] = useState(true)
  // Lives up here because its switch is on the gantry, beside the clock, even
  // though only the floor draws anything with it.
  const [showNumbers, setShowNumbers] = useState(false)
  const reduce = useReducedMotion()

  return (
    // The wall screen must fit exactly one viewport, whatever height the gantry
    // takes once it wraps. Narrow screens scroll the document normally.
    <BootGate>
    <div className="flex min-h-[100dvh] flex-col xl:h-[100dvh]">
      <GantrySign
        route={route}
        onRoute={setRoute}
        live={live}
        onLive={() => setLive((v) => !v)}
        showNumbers={showNumbers}
        onShowNumbers={setShowNumbers}
      />

      <main className="mx-auto w-full max-w-[1760px] px-6 py-7 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={route}
            className="xl:h-full"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.12, ease: [0.22, 1, 0.28, 1] }}
          >
            {route === 'flow' ? (
              <FlowPage live={live} />
            ) : (
              <FloorPage live={live} showNumbers={showNumbers} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
    </BootGate>
  )
}

type GantryProps = {
  route: RouteKey
  onRoute: (r: RouteKey) => void
  live: boolean
  onLive: () => void
  showNumbers: boolean
  onShowNumbers: (value: boolean) => void
}

/** The overhead gantry sign: hazard band, terminal name, route plates. */
function GantrySign({
  route,
  onRoute,
  live,
  onLive,
  showNumbers,
  onShowNumbers,
}: GantryProps) {
  return (
    <header className="z-30 shrink-0 border-b border-black bg-asphalt/95 backdrop-blur-sm">
      <div className="hazard-chrome h-2 w-full opacity-90" aria-hidden />

      <div className="mx-auto flex w-full max-w-[1760px] flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3">
        <div className="flex items-center gap-4">
          <BrandMark height={44} />
          <span className="text-[length:var(--text-step-3)] text-paint">ניטור ריקון מכולות</span>
        </div>

        <nav className="flex items-stretch gap-2" aria-label="מסכים">
          {ROUTES.map(({ key, label, note }) => {
            const active = key === route
            return (
              <button
                key={key}
                type="button"
                onClick={() => onRoute(key)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-stretch gap-3 border transition-colors duration-[var(--t-2)]
                  ${active ? 'border-signal bg-white/6' : 'border-white/12 hover:border-paint-worn'}`}
              >
                <span
                  className={`w-1.5 shrink-0 ${active ? 'reflect' : 'bg-paint-faint/40'}`}
                  aria-hidden
                />
                <span className="py-2 pe-4 text-start">
                  <span
                    className={`stencil block text-[length:var(--text-step-3)] leading-none ${
                      active ? 'text-paint' : 'text-paint-worn'
                    }`}
                  >
                    {label}
                  </span>
                  <span className="mt-1 block text-[length:var(--text-step-2)] text-paint-worn">
                    {note}
                  </span>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="ms-auto flex flex-wrap items-center gap-x-5 gap-y-2">
          <Clock />

          {/* Only the floor draws container numbers, so the switch appears only
              there rather than sitting dead on the other screen. */}
          {route === 'floor' && (
            <button
              type="button"
              onClick={() => onShowNumbers(!showNumbers)}
              aria-pressed={showNumbers}
              className={`border px-4 py-2 text-[length:var(--text-step-2)] transition-colors duration-[var(--t-2)] active:translate-y-px ${
                showNumbers
                  ? 'border-signal bg-signal text-asphalt'
                  : 'border-white/12 text-paint-worn hover:border-signal hover:text-paint'
              }`}
            >
              מספרי מכולות
            </button>
          )}

          <button
            type="button"
            onClick={onLive}
            aria-pressed={live}
            className="border border-white/12 px-4 py-2 text-[length:var(--text-step-2)] text-paint-worn transition-colors duration-[var(--t-2)] hover:border-signal hover:text-paint active:translate-y-px"
          >
            {live ? 'הקפא תצוגה' : 'חדש עדכון'}
          </button>

          <span className="flex items-center gap-3 text-[length:var(--text-step-2)] text-paint-worn">
            <span
              className={`h-2.5 w-2.5 transition-colors duration-[var(--t-3)] ${
                live ? 'bg-signal' : 'bg-paint-faint'
              }`}
              aria-hidden
            />
            {live ? 'נתוני הדגמה, מתעדכן' : 'מוקפא'}
          </span>
        </div>
      </div>
    </header>
  )
}

function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <time className="font-mono text-[length:var(--text-step-3)] text-paint tnum">
      {now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </time>
  )
}
