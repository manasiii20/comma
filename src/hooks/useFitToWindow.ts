import { useLayoutEffect, useState, type CSSProperties } from 'react'

const DESIGN_W = 1920
const DESIGN_H = 1080
const MIN_FIT_WIDTH = 1024

// Scales the 1920x1080 desktop composition to the window, then widens/heightens the
// layout so it fills the window edge to edge instead of letterboxing.
export function useFitToWindow(): CSSProperties | undefined {
  const compute = (): CSSProperties | undefined => {
    const w = document.documentElement.clientWidth
    const h = window.innerHeight
    if (w < MIN_FIT_WIDTH) return undefined
    const s = Math.min(w / DESIGN_W, h / DESIGN_H)
    return { zoom: s, width: w / s, height: h / s }
  }

  const [style, setStyle] = useState(compute)

  useLayoutEffect(() => {
    const onResize = () => setStyle(compute())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.style.overflow = style ? 'hidden' : ''
  }, [style])

  return style
}
