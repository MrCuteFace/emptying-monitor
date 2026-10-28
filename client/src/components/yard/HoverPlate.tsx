import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ListChecks, PushPinSimple, X } from '@phosphor-icons/react'
import type { ContainerCard } from '../../api/types'
import { STATUS, URGENT, facePaint, stampOf, timeAgo, whenOf } from '../../lib/status'
import { UrgentMark } from './UrgentMark'

/**
 * Where the plate hangs. `above` and `below` are the two edges it can hang from (the box's top
 * and bottom, plus a gap); `y` is the one in use, nudged back on screen when neither side has
 * room for the whole plate.
 */
type Anchor = { x: number; y: number; above: number; below: number; hangsBelow: boolean }
type HoverState = { card: ContainerCard; anchor: Anchor; pinned: boolean } | null

type HoverApi = {
  show: (card: ContainerCard, el: HTMLElement) => void
  hide: () => void
  /** A press pins the plate open and reveals its actions. */
  pin: (card: ContainerCard, el: HTMLElement) => void
  pinnedNumber: string | null
}

const HoverContext = createContext<HoverApi>({
  show: () => {},
  hide: () => {},
  pin: () => {},
  pinnedNumber: null,
})

export function useHoverPlate() {
  return useContext(HoverContext)
}

const PLATE_WIDTH = 296
/** Keeps the plate this far from the window's edges. */
const MARGIN = 8

type ProviderProps = {
  children: ReactNode
  /** Flips urgency. Refused per card where urgency is meaningless. */
  onToggleUrgent?: (card: ContainerCard) => void
  onShowDeals?: (card: ContainerCard) => void
  /**
   * The same container out of the newest snapshot. A pinned plate stays open
   * across polls, and without this its figures would freeze at the values they
   * had when it was opened — which is exactly the emptying percentage that is
   * supposed to be moving.
   */
  resolve?: (containerNumber: string) => ContainerCard | undefined
}

/**
 * The containers carry no text, per the spec. This plate is where everything
 * readable about one of them lives: bolted steel, hung off the box it describes.
 *
 * Two states, one surface. Hovering peeks — the plate follows the pointer and
 * carries no controls. Pressing pins it to that container and reveals the two
 * things you can do with it. A separate popup menu would have been a second
 * floating object over the same box, and it could not have said which of sixty
 * identical containers you had just pressed.
 */
export function HoverPlateProvider({
  children,
  onToggleUrgent,
  onShowDeals,
  resolve,
}: ProviderProps) {
  const [state, setState] = useState<HoverState>(null)
  const reduce = useReducedMotion()

  const show = useCallback((card: ContainerCard, el: HTMLElement) => {
    setState((prev) => (prev?.pinned ? prev : { card, anchor: anchorOf(el), pinned: false }))
  }, [])

  const hide = useCallback(() => setState((prev) => (prev?.pinned ? prev : null)), [])

  const pin = useCallback((card: ContainerCard, el: HTMLElement) => {
    setState((prev) =>
      prev?.pinned && prev.card.containerNumber === card.containerNumber
        ? null
        : { card, anchor: anchorOf(el), pinned: true },
    )
  }, [])

  const pinnedNumber = state?.pinned ? state.card.containerNumber : null
  const api = useMemo(() => ({ show, hide, pin, pinnedNumber }), [show, hide, pin, pinnedNumber])

  // A pinned plate is dismissed the way every other pinned thing is: Escape, or
  // a press anywhere that is neither the plate nor another container.
  useEffect(() => {
    if (!state?.pinned) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setState(null)
    }
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('[data-plate]') || target?.closest('[data-container-box]')) return
      setState(null)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown)
    }
  }, [state?.pinned])

  const card = state ? (resolve?.(state.card.containerNumber) ?? state.card) : null

  // The plate's height depends on the container and on whether it is pinned (pinning adds the
  // actions), so the side it hangs from is settled after it is measured, before it is painted.
  const plateRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = plateRef.current
    if (!state || !el) return
    const placed = placeFor(state.anchor, el.offsetHeight)
    if (placed.y !== state.anchor.y || placed.hangsBelow !== state.anchor.hangsBelow) {
      setState((prev) => (prev ? { ...prev, anchor: placed } : prev))
    }
  }, [state])

  return (
    <HoverContext.Provider value={api}>
      {children}
      {createPortal(
        <AnimatePresence>
          {state && card && (
            <motion.div
              key="hover-plate"
              className={`z-50 ${state.pinned ? '' : 'pointer-events-none'}`}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                transform: `translate3d(${state.anchor.x}px, ${state.anchor.y}px, 0)`,
              }}
              initial={false}
              animate={{
                transform: `translate3d(${state.anchor.x}px, ${state.anchor.y}px, 0)`,
              }}
              transition={{ duration: reduce ? 0 : 0.18, ease: [0.22, 1, 0.28, 1] }}
            >
              <div
                ref={plateRef}
                style={{
                  transform: state.anchor.hangsBelow
                    ? 'translate(-50%, 0)'
                    : 'translate(-50%, -100%)',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, transform: 'translateY(4px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  exit={{ opacity: 0, transform: 'translateY(2px)' }}
                  transition={{ duration: reduce ? 0.06 : 0.12, ease: [0.22, 1, 0.28, 1] }}
                >
                  <PlateBody
                    card={card}
                    pinned={state.pinned}
                    onToggleUrgent={onToggleUrgent}
                    onShowDeals={onShowDeals}
                    onClose={() => setState(null)}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </HoverContext.Provider>
  )
}

/** First guess: above the box, the side a sign hangs from. `placeFor` corrects it once measured. */
function anchorOf(el: HTMLElement): Anchor {
  const rect = el.getBoundingClientRect()
  const half = PLATE_WIDTH / 2 + 12
  const centre = rect.left + rect.width / 2
  const above = rect.top - 10
  return {
    x: Math.min(Math.max(centre, half), window.innerWidth - half),
    y: above,
    above,
    below: rect.bottom + 10,
    hangsBelow: false,
  }
}

/**
 * Hangs a plate of the measured height above the box if it fits, else below it, else on the
 * roomier side, shifted just enough to stay on screen (covering part of the box, never cut off).
 */
function placeFor(anchor: Anchor, height: number): Anchor {
  const bottom = window.innerHeight - MARGIN
  const fitsAbove = anchor.above - height >= MARGIN
  const fitsBelow = anchor.below + height <= bottom
  const hangsBelow = fitsAbove ? false : fitsBelow ? true : bottom - anchor.below > anchor.above - MARGIN

  const y = hangsBelow
    ? Math.max(MARGIN, Math.min(anchor.below, bottom - height))
    : Math.min(bottom, Math.max(anchor.above, MARGIN + height))
  return { ...anchor, y, hangsBelow }
}

function pct(part: number, whole: number): string {
  return whole <= 0 ? '—' : `${Math.round((part / whole) * 100)}%`
}

function PlateBody({
  card,
  pinned,
  onToggleUrgent,
  onShowDeals,
  onClose,
}: {
  card: ContainerCard
  pinned: boolean
  onToggleUrgent?: (card: ContainerCard) => void
  onShowDeals?: (card: ContainerCard) => void
  onClose: () => void
}) {
  // Urgency is a request to hurry an emptying. There is nothing left to hurry
  // once the container has gone, so that action is simply absent there.
  const canRush = Boolean(onToggleUrgent) && card.status !== 'departed_terminal'

  return (
    <div data-plate className={`plate w-[296px] ${pinned ? 'ring-1 ring-signal/70' : ''}`}>
      {/* The paint on this container's face, repeated as the plate's head. */}
      <div className="flex items-stretch">
        <span className="w-2 shrink-0" style={{ background: facePaint(card.status) }} aria-hidden />
        <div className="flex-1 px-4 py-3">
          <p className="flex items-center gap-2 whitespace-nowrap font-mono text-[length:var(--text-step-3)] leading-none text-paint">
            {card.containerNumber}
            {pinned && <PushPinSimple size={14} weight="fill" className="text-signal" aria-hidden />}
          </p>
          <p className="mt-2 text-[length:var(--text-step-2)] text-paint-worn">
            {STATUS[card.status].short}
          </p>
        </div>
        {pinned && (
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className="shrink-0 px-3 text-paint-faint transition-colors duration-[var(--t-2)] hover:text-paint"
          >
            <X size={16} weight="bold" aria-hidden />
          </button>
        )}
      </div>

      {card.urgent && (
        <div className="flex items-center gap-3 border-t border-black bg-[#17120a] px-4 py-2">
          <UrgentMark size={16} />
          <span className="text-[length:var(--text-step-2)] font-medium text-st-urgent">
            {URGENT.short}
          </span>
        </div>
      )}

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-black px-4 py-3 text-[length:var(--text-step-2)]">
        <dt className="text-paint-faint">מניפסט</dt>
        <dd className="font-mono text-paint-worn tnum">{card.manifestNumber}</dd>

        <dt className="text-paint-faint">סוג מכולה</dt>
        <dd dir="ltr" className="text-end font-mono text-paint-worn tnum">
          {card.sizeFeet} {card.typeCode}
        </dd>

        <dt className="text-paint-faint">משלח</dt>
        <dd className="text-paint-worn">{card.shipper}</dd>

        <dt className="text-paint-faint">סוכן אוניה</dt>
        <dd className="text-paint-worn">{card.shippingAgent}</dd>

        <dt className="text-paint-faint">לקוח</dt>
        <dd className="text-paint-worn">{card.customer}</dd>

        {/* The two emptying figures. Each is a count first and a percentage
            second: "6 מתוך 18" is what a yard hand acts on, 33% is only what it
            rounds to. */}
        {card.packages > 0 && (
          <>
            <dt className="text-paint-faint">ריקון</dt>
            <dd className="text-paint-worn tnum">
              {/* dir on the figure isolates it: without it the percent sign and
                  the count beside it are one bidi run and swap places. */}
              <span dir="ltr" className="font-mono text-paint">
                {pct(card.packagesEmptied, card.packages)}
              </span>
              <span className="ms-2">
                {card.packagesEmptied} מתוך {card.packages} אריזות
              </span>
            </dd>
          </>
        )}

        {card.dealCount > 0 && (
          <>
            <dt className="text-paint-faint">שידור זמינות</dt>
            <dd className="text-paint-worn tnum">
              <span dir="ltr" className="font-mono text-paint">
                {pct(card.dealsWithAvailability, card.dealCount)}
              </span>
              <span className="ms-2">
                {card.dealsWithAvailability} מתוך {card.dealCount} עסקאות
              </span>
            </dd>
          </>
        )}

        {card.driver && (
          <>
            <dt className="text-paint-faint">נהג</dt>
            <dd className="text-paint-worn">{card.driver}</dd>
          </>
        )}

        {card.position && (
          <>
            <dt className="text-paint-faint">נתיב</dt>
            <dd className="font-mono text-paint-worn">{card.position}</dd>
          </>
        )}


        {card.emptiedAt && (
          <>
            <dt className="text-paint-faint">תאריך ריקון</dt>
            <dd dir="ltr" className="text-end font-mono text-paint-worn tnum">
              {stampOf(card.emptiedAt)}
            </dd>
          </>
        )}

        {card.departedAt && (
          <>
            <dt className="text-paint-faint">תאריך יציאה</dt>
            <dd dir="ltr" className="text-end font-mono text-paint-worn tnum">
              {stampOf(card.departedAt)}
            </dd>
          </>
        )}

        <dt className="text-paint-faint">עודכן</dt>
        <dd className="text-paint-worn tnum">
          <span className="font-mono">{whenOf(card.updatedAt)}</span> · {timeAgo(card.updatedAt)}
        </dd>
      </dl>

      {/* The actions exist only on a pinned plate. A plate that appears under the
          pointer must not carry buttons you can trip over. */}
      {pinned && (
        <div className="flex flex-col gap-2 border-t border-black px-4 py-3">
          {canRush && (
            <button
              type="button"
              onClick={() => onToggleUrgent?.(card)}
              className="flex items-center justify-center gap-2 border border-signal px-3 py-2 text-[length:var(--text-step-2)] text-signal transition-colors duration-[var(--t-2)] hover:bg-signal hover:text-asphalt active:translate-y-px"
            >
              <UrgentMark size={15} />
              {card.urgent ? 'בטל סימון דחיפות' : 'סמן כדחופה לריקון'}
            </button>
          )}

          <button
            type="button"
            onClick={() => onShowDeals?.(card)}
            className="flex items-center justify-center gap-2 border border-white/14 px-3 py-2 text-[length:var(--text-step-2)] text-paint transition-colors duration-[var(--t-2)] hover:border-paint-worn active:translate-y-px"
          >
            <ListChecks size={16} weight="bold" aria-hidden />
            הצג עסקאות
          </button>
        </div>
      )}
    </div>
  )
}
