/* Motion helpers mirroring Webflow IX2 semantics (measured on the live site).
   IX2 easing "" = linear; "easeIn" = cubic-bezier(0.42, 0, 1, 1); "ease" = cubic-bezier(0.25, 0.1, 0.25, 1). */

export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const sx = (t) => ((ax * t + bx) * t + cx) * t
  const sy = (t) => ((ay * t + by) * t + cy) * t
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx
  const solve = (x) => {
    let t = x
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x
      if (Math.abs(e) < 1e-6) return t
      const d = dx(t)
      if (Math.abs(d) < 1e-6) break
      t -= e / d
    }
    let lo = 0
    let hi = 1
    t = x
    while (lo < hi) {
      const v = sx(t)
      if (Math.abs(v - x) < 1e-6) return t
      if (x > v) lo = t
      else hi = t
      t = (hi - lo) / 2 + lo
      if (hi - lo < 1e-7) break
    }
    return t
  }
  return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : sy(solve(x)))
}

export const EASE = {
  linear: (t) => t,
  easeIn: cubicBezier(0.42, 0, 1, 1),
  ease: cubicBezier(0.25, 0.1, 0.25, 1),
}

/* Time-based tween on rAF (IX2 tweens are wall-clock based). Returns a cancel function. */
export function tween({ duration, ease = EASE.linear, onUpdate, onComplete }) {
  let raf
  const t0 = performance.now()
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / duration)
    onUpdate(ease(p))
    if (p < 1) raf = requestAnimationFrame(tick)
    else if (onComplete) onComplete()
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}
