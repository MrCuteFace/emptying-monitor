import { useEffect, useId, useMemo, useRef } from 'react'
import { LOGO_POSE, drawLoaderFrame, drawSphere, sphereSvgBody } from './sphere'

/**
 * The demo mark: a purple puzzle sphere (see sphere.ts), drawn one twist away from solved,
 * beside a stencilled wordmark. The sphere's own shading carries it on the asphalt, so it sits
 * bare, with no sign panel behind it.
 */
export function BrandMark({ height = 34 }: { height?: number }) {
  // Each copy gets its own gradient ids: the boot cover and the header both render one.
  const id = `sphere${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const body = useMemo(() => sphereSvgBody(LOGO_POSE, 100, id), [id])
  return (
    <span className="brand-mark flex shrink-0 select-none items-center gap-3">
      <svg
        viewBox="0 0 100 100"
        width={height}
        height={height}
        aria-hidden
        focusable="false"
        dangerouslySetInnerHTML={{ __html: body }}
      />
      <span className="stencil leading-none text-paint" style={{ fontSize: height * 0.5 }}>
        קבוצת הדגמה
      </span>
    </span>
  )
}

/**
 * The sphere played with while data loads: a slow wind-up, a fast spin the other way with
 * motion blur, and back to rest. One still frame under reduced motion.
 */
export function LoadingSphere({ size = 56, label = 'טוען' }: { size?: number; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      drawSphere(ctx, { ...LOGO_POSE, twists: [0, 0, 0] }, size)
      return
    }

    let frame = 0
    let prev = 0
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      drawLoaderFrame(ctx, elapsed, prev, size)
      prev = elapsed
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [size])

  return <canvas ref={ref} role="img" aria-label={label} style={{ width: size, height: size }} />
}
