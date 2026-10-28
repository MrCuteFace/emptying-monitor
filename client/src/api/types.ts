export type ContainerStatus =
  | 'expected_unescorted'
  | 'expected_escorted'
  | 'work_order_issued'
  | 'at_terminal'
  | 'placed_unopened'
  | 'emptying'
  | 'emptied_in_lane'
  | 'cleared'
  | 'departed_terminal'

export interface ContainerCard {
  containerNumber: string
  /** The international freight forwarder; one of them serves several customers. */
  shipper: string
  /** The shipping line's local agent, fixed by the container's owner prefix. */
  shippingAgent: string
  /** Manifest number, six digits; the first two are the year it was opened. */
  manifestNumber: string
  /** Container length in feet: 20 or 40. */
  sizeFeet: number
  /** Type code: RG regular, HC high cube, RH reefer high cube. */
  typeCode: string
  status: ContainerStatus
  customer: string
  urgent: boolean
  updatedAt: string
  position: string | null
  driver: string | null
  /** When emptying finished. Null until the container has actually been emptied. */
  emptiedAt: string | null
  /** When it left the terminal. Null while it is still inside the terminal. */
  departedAt: string | null
  /** Packages in the container, summed across its deals. */
  packages: number
  /** How many of them are already off. The emptying percentage comes from these two. */
  packagesEmptied: number
  dealCount: number
  /** How many deals have had their availability transmitted. */
  dealsWithAvailability: number
}

export interface DealLine {
  /** מזהה עסקה. */
  dealId: string
  shipper: string
  /** תיאור המטען. */
  cargo: string
  weightKg: number
  packages: number
  packagesEmptied: number
  availabilityTransmitted: boolean
  availabilityAt: string | null
}

export interface ContainerDeals {
  containerNumber: string
  packages: number
  packagesEmptied: number
  deals: DealLine[]
  generatedAt: string
}

export interface StageMeasure {
  key: string
  label: string
  kind: 'pct' | 'count'
  value: number
  detail: string
  /** Null when the figure is measured; a note when it is not. */
  source: string | null
}

export interface FlowStage {
  key: ContainerStatus
  name: string
  note: string
  count: number
  urgentCount: number
  containers: ContainerCard[]
  measures: StageMeasure[]
}

export interface FlowSnapshot {
  stages: FlowStage[]
  generatedAt: string
}

export interface Lane {
  number: number
  container: ContainerCard | null
}

export interface EmptyingArea {
  name: string
  lanes: Lane[]
}

export interface FloorSnapshot {
  areaA: EmptyingArea
  areaB: EmptyingArea
  yard: ContainerCard[]
  clearedYard: ContainerCard[]
  /** Emptied and gone from the terminal: history, not a picture of the floor. */
  departed: ContainerCard[]
  generatedAt: string
}
