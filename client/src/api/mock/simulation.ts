/**
 * Browser port of `server/Mock/TerminalSimulation.cs`, for the static demo.
 *
 * Same opening scenario, same state machine, same rates: a fixed set of containers plus a tick
 * that walks a couple of them one stage forward every 64 clock units. Everything is invented and
 * lives in memory, so a reload starts the scenario over.
 */
import type {
  ContainerCard,
  ContainerDeals,
  ContainerStatus,
  DealLine,
  FlowSnapshot,
  FlowStage,
  FloorSnapshot,
  Lane,
  StageMeasure,
} from '../types'

const LANES_PER_AREA = 10
const YARD_CAPACITY = 27
const CLEARED_CAPACITY = 12
/** Today's exits only; the cap just keeps a fast-forwarded day from piling up. */
const DEPARTED_CAPACITY = 16
const WORK_ORDER_CAPACITY = 14
const TICK_MS = 64 * 60

const OWNER_PREFIXES = ['ZLDU', 'KRMU', 'NVSU', 'ARTU', 'HLDU', 'QSBU', 'VRNU', 'TMLU']

// One agent per owner prefix, in the same order: an agent represents a shipping line, so it
// follows from the container. The last two share one, as when an agency represents two lines.
const SHIPPING_AGENTS = [
  'דולפין סוכנויות ספנות',
  'ענבר סוכנות אוניות',
  'מגדלור שיפינג',
  'קשת ים סוכנויות',
  'אופק ספנות בע"מ',
  'לביא סוכנות אוניות',
  'צוק הים סוכנויות',
  'צוק הים סוכנויות',
]

const CUSTOMERS = [
  'אלון שינוע בע"מ',
  'דגן סחר ויבוא',
  'ק.ל.ש לוגיסטיקה',
  'מרכז היבוא הנגב',
  'אורלוג ים בע"מ',
  'שחם הפצה ארצית',
  'גלעד טרנס',
  'מ.ת.ן יבוא כללי',
  'נמרוד עמילות מכס',
  'בר-כוכבא שילוח',
]

// Deliberately shorter than the customer list: one forwarder brings containers for several
// customers, which is what makes searching by shipper useful.
const SHIPPERS = [
  'כרמל שילוח בינלאומי',
  'תבור לוגיסטיקה ימית',
  'אשד קרגו',
  'נווה שילוח בע"מ',
  'גל-ים פורוורדינג',
  'רימון שילוח ימי ואווירי',
  'שדות שילוח בינלאומי',
]

const CARGOES = [
  'רהיטים מפורקים',
  'מוצרי חשמל ביתיים',
  'חלקי חילוף לרכב',
  'אריחי קרמיקה',
  'מוצרי פלסטיק',
  'טקסטיל ובגדים',
  'כלי עבודה ידניים',
  'מזון יבש ארוז',
  'צעצועים',
  'ציוד משרדי',
  'צינורות PVC',
  'נייר ואריזות קרטון',
  'מכשור רפואי',
  'חומרי בניין ארוזים',
]

const DRIVERS = [
  'איתי ברזילי', 'ראמי חורי', 'ולדימיר סמוליאנוב', 'יוסי אבוקסיס',
  "ח'אלד מנסור", 'ניר שטיינברג', 'אמיר דהן', 'סרגיי קובלנקו',
]

/** Seeded PRNG (mulberry32), so every visit opens on the same board. */
function seeded(seed: number) {
  let s = seed >>> 0
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    double: next,
    /** Integer in [min, max), like System.Random.Next. */
    int: (min: number, max: number) => min + Math.floor(next() * (max - min)),
  }
}

/** A card before its four deal figures are filled in. */
type Card = Omit<ContainerCard, 'packages' | 'packagesEmptied' | 'dealCount' | 'dealsWithAvailability'>

const minutesAgo = (from: Date, minutes: number) => new Date(from.getTime() - minutes * 60_000)
const iso = (d: Date) => d.toISOString()
const isEmptied = (s: ContainerStatus) =>
  s === 'emptied_in_lane' || s === 'cleared' || s === 'departed_terminal'

export class TerminalSimulation {
  private rng = seeded(51853)
  private expectedUnescorted: Card[] = []
  private expectedEscorted: Card[] = []
  private workOrder: Card[] = []
  private yard: Card[] = []
  private areaA: (Card | null)[] = Array(LANES_PER_AREA).fill(null)
  private areaB: (Card | null)[] = Array(LANES_PER_AREA).fill(null)
  private cleared: Card[] = []
  private departed: Card[] = []
  /** The authoritative deal lines; a card's four figures are summed from these on every read. */
  private deals = new Map<string, DealLine[]>()
  private lastTick = 0
  private damageOrdersOpen = 2
  private serial = 0

  constructor() {
    this.seed()
  }

  private seed() {
    for (let i = 0; i < 18; i++) this.expectedUnescorted.push(this.newContainer('expected_unescorted', null, 0.08))
    for (let i = 0; i < 7; i++) this.expectedEscorted.push(this.newContainer('expected_escorted', null, 0.3))
    for (let i = 0; i < 11; i++) this.workOrder.push(this.newContainer('work_order_issued', null, 0.18))

    const openingA: (ContainerStatus | null)[] = [
      'placed_unopened', 'placed_unopened', null,
      'emptying', 'emptying', 'emptying',
      null, null, 'emptied_in_lane', 'emptied_in_lane',
    ]
    const openingB: (ContainerStatus | null)[] = [
      'placed_unopened', null, 'placed_unopened', null,
      'emptying', 'emptied_in_lane', null, null,
      'emptying', 'emptied_in_lane',
    ]
    for (let i = 0; i < LANES_PER_AREA; i++) {
      const a = openingA[i]
      const b = openingB[i]
      if (a) this.areaA[i] = this.newContainer(a, `A-${i + 1}`, 0.45)
      if (b) this.areaB[i] = this.newContainer(b, `B-${i + 1}`, 0.35)
    }

    for (let i = 0; i < YARD_CAPACITY; i++) this.yard.push(this.newContainer('at_terminal', null, 0.11))
    for (let i = 0; i < CLEARED_CAPACITY; i++) this.cleared.push(this.newContainer('cleared', null, 0.14))

    // The departed bed opens with this morning's exits; the emptying behind them can still
    // fall on yesterday, which is what makes the dated stamps worth showing.
    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sinceMidnight = Math.max(90, Math.floor((now.getTime() - midnight.getTime()) / 60_000))
    for (let i = 0; i < 9; i++) {
      this.departed.push(this.newContainer('departed_terminal', null, 0.05, this.rng.int(15, sinceMidnight)))
    }
    this.departed.sort((a, b) => (b.departedAt ?? b.updatedAt).localeCompare(a.departedAt ?? a.updatedAt))
  }

  private newContainer(status: ContainerStatus, position: string | null, urgentChance: number, minutesBack?: number): Card {
    const rng = this.rng
    this.serial++
    const owner = rng.int(0, OWNER_PREFIXES.length)
    const body = rng.int(100000, 999999)
    const check = (this.serial * 7 + body) % 10

    // High cubes and reefers are overwhelmingly forties, so the type is drawn given the length.
    const sizeFeet = rng.double() < 0.66 ? 40 : 20
    const roll = rng.double()
    const typeCode = sizeFeet === 40
      ? roll < 0.45 ? 'RG' : roll < 0.85 ? 'HC' : 'RH'
      : roll < 0.85 ? 'RG' : 'RH'

    const hasDriver = status === 'work_order_issued' || status === 'expected_escorted'
    const containerNumber = `${OWNER_PREFIXES[owner]} ${body} ${check}`
    const now = new Date()
    const updatedAt = minutesAgo(now, minutesBack ?? rng.int(3, 260))

    // Emptying always precedes the exit, because it did.
    const emptiedAt = isEmptied(status) ? minutesAgo(updatedAt, rng.int(25, 600)) : null
    const departedAt = status === 'departed_terminal' ? updatedAt : null

    this.deals.set(containerNumber.toUpperCase(), this.newDeals(status, updatedAt))

    return {
      containerNumber,
      shipper: SHIPPERS[rng.int(0, SHIPPERS.length)],
      shippingAgent: SHIPPING_AGENTS[owner],
      // Six digits, the first two being the year the manifest was opened.
      manifestNumber: `${String(now.getFullYear() % 100).padStart(2, '0')}${String(rng.int(0, 10000)).padStart(4, '0')}`,
      sizeFeet,
      typeCode,
      status,
      customer: CUSTOMERS[rng.int(0, CUSTOMERS.length)],
      urgent: rng.double() < urgentChance,
      updatedAt: iso(updatedAt),
      position,
      driver: hasDriver ? DRIVERS[rng.int(0, DRIVERS.length)] : null,
      emptiedAt: emptiedAt && iso(emptiedAt),
      departedAt: departedAt && iso(departedAt),
    }
  }

  /** Packages split unevenly on purpose: one big consignment and a few small ones is the normal case. */
  private newDeals(status: ContainerStatus, updatedAt: Date): DealLine[] {
    const rng = this.rng
    const emptiedAlready = isEmptied(status)
    // Availability goes out per deal as cargo becomes collectable.
    const transmitChance = emptiedAlready ? 0.94
      : status === 'emptying' ? 0.55
      : status === 'placed_unopened' ? 0.3
      : status === 'at_terminal' ? 0.15
      : 0.05

    const count = rng.int(2, 7)
    const lines: DealLine[] = []
    for (let i = 0; i < count; i++) {
      const packages = rng.int(1, 4) === 1 ? rng.int(6, 15) : rng.int(1, 6)
      const transmitted = rng.double() < transmitChance
      const perPackage = rng.int(40, 950)
      // Seventeen characters, the documented shape of a deal id. Every digit is invented.
      const tail = String(Math.floor(rng.double() * 1e13)).padStart(13, '0')
      lines.push({
        dealId: `${new Date().getFullYear()}${tail}`,
        shipper: SHIPPERS[rng.int(0, SHIPPERS.length)],
        cargo: CARGOES[rng.int(0, CARGOES.length)],
        weightKg: packages * perPackage,
        packages,
        packagesEmptied: emptiedAlready ? packages : 0,
        availabilityTransmitted: transmitted,
        availabilityAt: transmitted ? iso(minutesAgo(updatedAt, rng.int(5, 400))) : null,
      })
    }
    return lines
  }

  private hydrate(card: Card): ContainerCard {
    const lines = this.deals.get(card.containerNumber.toUpperCase()) ?? []
    return {
      ...card,
      packages: lines.reduce((n, l) => n + l.packages, 0),
      packagesEmptied: lines.reduce((n, l) => n + l.packagesEmptied, 0),
      dealCount: lines.length,
      dealsWithAvailability: lines.filter((l) => l.availabilityTransmitted).length,
    }
  }

  getDeals(containerNumber: string): ContainerDeals | null {
    this.tick()
    const lines = this.deals.get(containerNumber.toUpperCase())
    if (!lines) return null
    return {
      containerNumber,
      packages: lines.reduce((n, l) => n + l.packages, 0),
      packagesEmptied: lines.reduce((n, l) => n + l.packagesEmptied, 0),
      deals: lines.map((l) => ({ ...l })),
      generatedAt: iso(new Date()),
    }
  }

  getFloor(): FloorSnapshot {
    this.tick()
    const lanes = (area: (Card | null)[]): Lane[] =>
      area.map((c, i) => ({ number: i + 1, container: c ? this.hydrate(c) : null }))
    return {
      areaA: { name: 'A', lanes: lanes(this.areaA) },
      areaB: { name: 'B', lanes: lanes(this.areaB) },
      yard: this.yard.map((c) => this.hydrate(c)),
      clearedYard: this.cleared.map((c) => this.hydrate(c)),
      departed: this.departed.map((c) => this.hydrate(c)),
      generatedAt: iso(new Date()),
    }
  }

  getFlow(): FlowSnapshot {
    this.tick()
    const inLane = [...this.areaA, ...this.areaB].filter((c): c is Card => c !== null)
    const placed = inLane.filter((c) => c.status === 'placed_unopened')
    const emptying = inLane.filter((c) => c.status === 'emptying')
    const emptied = inLane.filter((c) => c.status === 'emptied_in_lane')

    const progress = inLane.length === 0
      ? 0
      : Math.round(((emptied.length + emptying.length * 0.5) / inLane.length) * 1000) / 10
    const identified = this.yard.length + inLane.length
    const pendingId = 4
    const mismatchId = 1

    const stage = (key: ContainerStatus, name: string, note: string, containers: Card[], measures: StageMeasure[] = []): FlowStage => ({
      key,
      name,
      note,
      count: containers.length,
      urgentCount: containers.filter((c) => c.urgent).length,
      containers: containers.map((c) => this.hydrate(c)),
      measures,
    })

    return {
      stages: [
        stage('expected_unescorted', 'צפויות לכניסה, ללא ליווי', 'מוכרזות, טרם נמסר סידור', this.expectedUnescorted),
        stage('expected_escorted', 'צפויות לכניסה, עם ליווי', 'מחייבות ליווי בשער', this.expectedEscorted),
        stage('work_order_issued', 'נמסר סידור עבודה לנהג', 'ממתינות בשער', this.workOrder),
        stage('at_terminal', 'נכנסו למסוף לריקון', 'ממתינות לשיבוץ', this.yard),
        stage('placed_unopened', 'הוצבה בשטח ריקון', 'טרם נפתחה', placed),
        stage('emptying', 'ריקון פעיל', 'בעבודה עכשיו', emptying, [
          { key: 'progress', label: 'התקדמות הריקון', kind: 'pct', value: progress, detail: 'מתוך המכולות העומדות בשטחי הריקון', source: null },
          { key: 'uptime', label: 'שידור זמינות', kind: 'pct', value: 97.3, detail: 'קליטת דיווחים מהשטח', source: 'ערך קבוע להדגמה, טרם הוגדר מקור נתונים' },
          { key: 'damage', label: 'סידורים עם נזק', kind: 'count', value: this.damageOrdersOpen, detail: 'פתוחים בטיפול תפעול', source: null },
          { key: 'cargo_id', label: 'זיהוי מטענים', kind: 'count', value: pendingId + mismatchId, detail: `${pendingId} ממתינות לזיהוי, ${mismatchId} באי התאמה מתוך ${identified}`, source: null },
        ]),
        stage('emptied_in_lane', 'רוקנה', 'עדיין בשטח הריקון', emptied),
        stage('cleared', 'יצאה משטח הריקון', 'פינתה את הנתיב', this.cleared),
        stage('departed_terminal', 'יצאה מהמסוף', 'רוקנה ועזבה את המסוף', this.departed),
      ],
      generatedAt: iso(new Date()),
    }
  }

  /** Sets or clears urgency wherever the containers stand. Returns how many changed. */
  setUrgent(containerNumbers: string[], urgent: boolean): number {
    const wanted = new Set(containerNumbers.map((n) => n.toUpperCase()))
    if (wanted.size === 0) return 0
    const now = iso(new Date())
    let changed = 0
    const apply = (list: (Card | null)[]) => {
      for (let i = 0; i < list.length; i++) {
        const c = list[i]
        if (!c || c.urgent === urgent || !wanted.has(c.containerNumber.toUpperCase())) continue
        list[i] = { ...c, urgent, updatedAt: now }
        changed++
      }
    }
    for (const list of [this.expectedUnescorted, this.expectedEscorted, this.workOrder, this.yard, this.cleared, this.departed, this.areaA, this.areaB]) {
      apply(list)
    }
    return changed
  }

  /** Walks containers one stage forward: expected, work order, entered, placed, emptying, emptied, departed. */
  private tick() {
    const now = Date.now()
    if (now - this.lastTick < TICK_MS) return
    this.lastTick = now
    const at = new Date(now)

    this.advanceLanes(at)
    this.advanceGate(at)
    this.advanceEmptyingProgress(at)
    this.dropYesterdaysDepartures(at)

    if (this.rng.double() < 0.06) this.damageOrdersOpen = Math.min(9, this.damageOrdersOpen + 1)
    else if (this.damageOrdersOpen > 1 && this.rng.double() < 0.04) this.damageOrdersOpen--
  }

  /**
   * Packages come off a few at a time while a container is being emptied, stopping one short of
   * the total: it reads as fully emptied only when its status says so, so the plate and the paint
   * can never disagree.
   */
  private advanceEmptyingProgress(at: Date) {
    for (const card of [...this.areaA, ...this.areaB]) {
      if (!card || card.status !== 'emptying') continue
      const lines = this.deals.get(card.containerNumber.toUpperCase())
      if (!lines) continue

      const total = lines.reduce((n, l) => n + l.packages, 0)
      const done = lines.reduce((n, l) => n + l.packagesEmptied, 0)
      let step = Math.min(Math.max(total - 1 - done, 0), this.rng.int(1, 4))
      for (let i = 0; i < lines.length && step > 0; i++) {
        const take = Math.min(step, lines[i].packages - lines[i].packagesEmptied)
        if (take <= 0) continue
        lines[i] = { ...lines[i], packagesEmptied: lines[i].packagesEmptied + take }
        step -= take
      }

      if (this.rng.double() >= 0.25) continue
      const pending = lines.findIndex((l) => !l.availabilityTransmitted)
      if (pending >= 0) lines[pending] = { ...lines[pending], availabilityTransmitted: true, availabilityAt: iso(at) }
    }
  }

  private completeEmptying(containerNumber: string) {
    const lines = this.deals.get(containerNumber.toUpperCase())
    if (!lines) return
    for (let i = 0; i < lines.length; i++) lines[i] = { ...lines[i], packagesEmptied: lines[i].packages }
  }

  /** The departed bed is a day's worth of exits; at midnight it empties itself. */
  private dropYesterdaysDepartures(at: Date) {
    const today = at.toDateString()
    this.departed = this.departed.filter((c) => new Date(c.departedAt ?? c.updatedAt).toDateString() === today)
  }

  private advanceLanes(at: Date) {
    const now = iso(at)
    for (let step = 0; step < 2; step++) {
      const useA = this.rng.int(0, 2) === 0
      const area = useA ? this.areaA : this.areaB
      const letter = useA ? 'A' : 'B'
      const lane = this.rng.int(0, LANES_PER_AREA)
      const current = area[lane]

      if (!current) {
        const next = this.yard.shift()
        if (!next) continue
        area[lane] = { ...next, status: 'placed_unopened', position: `${letter}-${lane + 1}`, updatedAt: now }
        continue
      }

      switch (current.status) {
        case 'placed_unopened':
          area[lane] = { ...current, status: 'emptying', updatedAt: now }
          break
        case 'emptying':
          this.completeEmptying(current.containerNumber)
          area[lane] = { ...current, status: 'emptied_in_lane', emptiedAt: now, updatedAt: now }
          break
        case 'emptied_in_lane':
          this.cleared.unshift({ ...current, status: 'cleared', position: null, updatedAt: now })
          // The oldest container on the cleared bed drives out of the gate; that is its exit time.
          if (this.cleared.length > CLEARED_CAPACITY) {
            const leaving = this.cleared.pop()!
            this.departed.unshift({ ...leaving, status: 'departed_terminal', departedAt: now, updatedAt: now })
            if (this.departed.length > DEPARTED_CAPACITY) this.departed.pop()
          }
          area[lane] = null
          break
      }
    }
  }

  private advanceGate(at: Date) {
    const now = iso(at)
    // Work order issued -> through the gate into the yard. The driver has left; the container is ours.
    if (this.workOrder.length > 0 && this.yard.length < YARD_CAPACITY) {
      const arriving = this.workOrder.shift()!
      this.yard.push({ ...arriving, status: 'at_terminal', updatedAt: now, driver: null })
    }

    // Expected -> work order handed to a driver. Capped: the gate only holds so many trucks.
    const source = this.rng.double() < 0.7 ? this.expectedUnescorted : this.expectedEscorted
    if (this.workOrder.length < WORK_ORDER_CAPACITY && source.length > 0) {
      const booked = source.shift()!
      this.workOrder.push({
        ...booked,
        status: 'work_order_issued',
        updatedAt: now,
        driver: DRIVERS[this.rng.int(0, DRIVERS.length)],
      })
    }

    // New announcements keep the head of the pipeline alive.
    if (this.expectedUnescorted.length < 22 && this.rng.double() < 0.75) {
      this.expectedUnescorted.push(this.newContainer('expected_unescorted', null, 0.08))
    }
    if (this.expectedEscorted.length < 10 && this.rng.double() < 0.35) {
      this.expectedEscorted.push(this.newContainer('expected_escorted', null, 0.3))
    }
  }
}
