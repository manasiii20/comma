import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './TooltipLayer.css'

type Tip = { title: string; detail?: string }
type Point = { x: number; y: number }

const SHOW_DELAY = 180
const OFFSET = { x: 14, y: 18 }
const EDGE = 8

/*
  A cursor label, like the name tags on collaborators' cursors in Figma. Any element with
  data-tip="Title" (and optionally data-tip-detail="More text") shows it while the pointer is
  over it; the label follows the pointer. With keyboard focus it sits just under the element.
  Rendered in <body>, outside the scaled layout, so no card can clip it.
*/
export function TooltipLayer() {
  const [tip, setTip] = useState<Tip | null>(null)
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 })
  const [flip, setFlip] = useState({ x: false, y: false })
  const labelRef = useRef<HTMLDivElement>(null)
  const current = useRef<Element | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const frame = useRef<number | undefined>(undefined)
  const pointer = useRef<Point>({ x: 0, y: 0 })

  useEffect(() => {
    const read = (el: Element): Tip | null => {
      const title = el.getAttribute('data-tip')
      return title ? { title, detail: el.getAttribute('data-tip-detail') || undefined } : null
    }

    const show = (el: Element, at: () => Point) => {
      if (current.current === el) return
      current.current = el
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        setPoint(at())
        setTip(read(el))
      }, SHOW_DELAY)
    }

    const hide = () => {
      window.clearTimeout(timer.current)
      current.current = null
      setTip(null)
    }

    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY }
      const el = (e.target as Element).closest?.('[data-tip]')
      if (!el) {
        if (current.current) hide()
        return
      }
      if (el !== current.current) show(el, () => pointer.current)
      // Follow the pointer, at most once per frame.
      if (frame.current === undefined) {
        frame.current = requestAnimationFrame(() => {
          frame.current = undefined
          setPoint(pointer.current)
        })
      }
    }

    const onFocus = (e: FocusEvent) => {
      const target = e.target as Element
      const el = target.closest?.('[data-tip]')
      if (!el || !target.matches(':focus-visible')) return
      show(el, () => {
        const r = el.getBoundingClientRect()
        return { x: r.left + Math.min(24, r.width / 2) - OFFSET.x, y: r.bottom - OFFSET.y + 6 }
      })
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', hide)
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', hide)
    document.addEventListener('pointerdown', hide)
    window.addEventListener('scroll', hide, true)
    window.addEventListener('hashchange', hide)
    window.addEventListener('blur', hide)
    return () => {
      window.clearTimeout(timer.current)
      if (frame.current !== undefined) cancelAnimationFrame(frame.current)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', hide)
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', hide)
      document.removeEventListener('pointerdown', hide)
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('hashchange', hide)
      window.removeEventListener('blur', hide)
    }
  }, [])

  // Near the right or bottom edge, put the label on the other side of the cursor.
  useLayoutEffect(() => {
    const el = labelRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    setFlip({
      x: point.x + OFFSET.x + width > window.innerWidth - EDGE,
      y: point.y + OFFSET.y + height > window.innerHeight - EDGE,
    })
  }, [point, tip])

  if (!tip) return null
  const left = flip.x ? point.x - OFFSET.x / 2 : point.x + OFFSET.x
  const top = flip.y ? point.y - OFFSET.y / 2 : point.y + OFFSET.y
  return createPortal(
    <div
      ref={labelRef}
      className={`cursor-tip${flip.x ? ' cursor-tip--left' : ''}${flip.y ? ' cursor-tip--up' : ''}`}
      role="tooltip"
      style={{ left, top }}
    >
      <span className="cursor-tip__title">{tip.title}</span>
      {tip.detail && <span className="cursor-tip__detail">{tip.detail}</span>}
    </div>,
    document.body,
  )
}
