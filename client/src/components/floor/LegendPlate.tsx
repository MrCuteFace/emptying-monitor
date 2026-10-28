import type { ContainerStatus } from '../../api/types'
import { STATUS, URGENT } from '../../lib/status'
import { ContainerFace } from '../yard/ContainerFace'

const ON_THE_YARD: ContainerStatus[] = [
  'at_terminal',
  'placed_unopened',
  'emptying',
  'emptied_in_lane',
  'cleared',
  'departed_terminal',
]

/**
 * The legend uses the real container object, and names where each status lives
 * on the floor, straight from the spec's own colour table.
 */
export function LegendPlate({ stacked }: { stacked?: boolean }) {
  return (
    <div
      className={`plate grid gap-x-6 gap-y-3 px-5 py-4 ${
        stacked ? 'grid-cols-1' : 'grid-cols-2 2xl:grid-cols-3'
      }`}
    >
      <span className="stencil col-span-full text-[length:var(--text-step-2)] leading-none text-paint-worn">
        מקרא
      </span>

      {ON_THE_YARD.map((key) => (
        <Row
          key={key}
          status={key}
          label={STATUS[key].short}
          note={STATUS[key].where}
        />
      ))}

      <Row status="at_terminal" urgent label={URGENT.short} note="משולש אזהרה על כל סטטוס" />

      <Row
        status="emptying"
        emptiedShare={0.45}
        label="קו הריקון"
        note="מתחת לקו מה שעדיין בפנים"
      />
    </div>
  )
}

function Row({
  status,
  urgent,
  emptiedShare,
  label,
  note,
}: {
  status: ContainerStatus
  urgent?: boolean
  emptiedShare?: number
  label: string
  note: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="block w-11 shrink-0" aria-hidden>
        <ContainerFace
          status={status}
          urgent={Boolean(urgent)}
          emptiedShare={emptiedShare ?? null}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-[length:var(--text-step-1)] leading-tight text-paint">
          {label}
        </span>
        <span className="block text-[length:var(--text-step-1)] leading-tight text-paint-faint">
          {note}
        </span>
      </span>
    </div>
  )
}
