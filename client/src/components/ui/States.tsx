/** Loading looks like the ground it will become: painted bays, not a spinner. */
export function LoadingGround({ rows = 8 }: { rows?: number }) {
  return (
    <div className="grid gap-x-10 gap-y-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {[0, 1].map((col) => (
        <div key={col} className="flex flex-col gap-2">
          <div className="marking mb-3 h-5 w-48 animate-pulse opacity-30" />
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-full animate-pulse border-2 border-dashed border-paint-faint/40 bg-black/25"
              style={{ animationDelay: `calc(var(--t) * ${i})` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function FeedFault({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="plate flex items-center gap-4 px-5 py-4">
      <span className="chevron h-8 w-16 shrink-0" aria-hidden />
      <div className="flex-1">
        <p className="stencil text-[length:var(--text-step-3)] leading-none text-paint">
          אין קשר לשרת הנתונים
        </p>
        <p className="mt-2 font-mono text-[length:var(--text-step-2)] text-paint-worn">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="border border-signal px-4 py-2 text-[length:var(--text-step-2)] text-signal transition-colors duration-[var(--t-2)] hover:bg-signal hover:text-asphalt active:translate-y-px"
      >
        נסה שוב
      </button>
    </div>
  )
}
