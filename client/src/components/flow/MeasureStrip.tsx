import type { FlowStage } from '../../api/types'

/**
 * The measures that belong to ריקון פעיל, painted under the route and tied to
 * their gate by the reflective edge and the stage's own name.
 *
 * They sit here rather than inside the gate's block on purpose: a block on the
 * rail is sized by how many containers stand in it, and reserving height for
 * four figures made the emptiest stage render as one of the fullest. The chart
 * only works if nothing but the count moves a block.
 */
export function MeasureStrip({
  stage,
  filtered,
}: {
  stage: FlowStage
  /** A forwarder search is narrowing the rail, but not these. */
  filtered?: boolean
}) {
  if (stage.measures.length === 0) return null

  return (
    <section className="mt-3 flex shrink-0 items-stretch gap-3 border-t border-white/8 pt-3">
      <span className="reflect w-1.5 shrink-0" aria-hidden />

      <div className="min-w-0 flex-1">
        <h2 className="text-[length:var(--text-step-2)] font-medium leading-tight text-paint">
          {stage.name}
        </h2>

        {/* These are stage-wide figures with no per-container breakdown behind
            them, so a forwarder search cannot narrow them. Saying so is the
            only honest option: silently leaving whole-stage numbers beside a
            filtered rail would read as the forwarder's own. */}
        {filtered && (
          <p className="mt-1 text-[length:var(--text-step-1)] leading-tight text-paint-faint">
            המדדים מתייחסים לכלל השלב, לא לתוצאות החיפוש
          </p>
        )}

        <dl className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          {stage.measures.map((m) => (
            <div key={m.key} className="flex items-baseline gap-1.5">
              <dd
                dir="ltr"
                className={`shrink-0 font-mono text-[length:var(--text-step-2)] leading-none tnum ${
                  m.source ? 'text-paint-worn line-through decoration-paint-faint' : 'text-paint'
                }`}
              >
                {m.kind === 'pct' ? `${m.value.toFixed(1)}%` : m.value}
              </dd>
              <dt className="text-[length:var(--text-step-2)] leading-none text-paint-worn">
                {m.label}
              </dt>
              {/* Nobody hovers a wall screen, so a figure with no source says so
                  in words rather than in a tooltip. */}
              {m.source && (
                <dd
                  className="shrink-0 text-[length:var(--text-step-1)] leading-none text-paint-faint"
                  title={m.source}
                >
                  ללא מקור
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
