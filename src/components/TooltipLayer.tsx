import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './TooltipLayer.css'

type Tip = { title: string; detail?: string; x: number; y: number; side: 'top' | 'bottom' | 'right' }

const SHOW_DELAY = 280
const GAP = 10

/*
  One tooltip for the whole app. Any element with data-tip="Title" (and optionally
  data-tip-detail="More text", data-tip-side="right") shows it on hover or keyboard focus.
  Rendered in <body>, outside the scaled layout, so it never gets clipped by a card.
*/
export function TooltipLayer() {
  const [tip, setTip] = useState<Tip | null>(null)
  const current = useRef<Element | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const lastHide = useRef(0)

  useEffect(() => {
    const place = (el: Element): Tip | null => {
      const title = el.getAttribute('data-tip')
      if (!title) return null
      const r = el.getBoundingClientRect()
      const wanted = (el.getAttribute('data-tip-side') as Tip['side']) || 'top'
      const side = wanted === 'top' && r.top < 72 ? 'bottom' : wanted
      if (side === 'right') return { title, detail: el.getAttribute('data-tip-detail') ?? undefined, side, x: r.right + GAP, y: r.top + r.height / 2 }
      return {
        title,
        detail: el.getAttribute('data-tip-detail') ?? undefined,
        side,
        x: r.left + r.width / 2,
        y: side === 'top' ? r.top - GAP : r.bottom + GAP,
      }
    }

    const show = (el: Element) => {
      if (current.current === el) return
      current.current = el
      window.clearTimeout(timer.current)
      // Moving straight from one tip to the next shows it at once, like native tooltips.
      const delay = Date.now() - lastHide.current < 400 ? 0 : SHOW_DELAY
      timer.current = window.setTimeout(() => setTip(place(el)), delay)
    }

    const hide = () => {
      window.clearTimeout(timer.current)
      if (current.current) lastHide.current = Date.now()
      current.current = null
      setTip(null)
    }

    const onOver = (e: Event) => {
      const el = (e.target as Element).closest?.('[data-tip]')
      if (el) show(el)
      else if (current.current) hide()
    }
    const onOut = (e: PointerEvent) => {
      if (current.current && !current.current.contains(e.relatedTarget as Node)) hide()
    }
    const onFocus = (e: FocusEvent) => {
      const el = (e.target as Element).closest?.('[data-tip]')
      if (el && (e.target as Element).matches(':focus-visible')) show(el)
    }

    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', hide)
    document.addEventListener('pointerdown', hide)
    window.addEventListener('scroll', hide, true)
    window.addEventListener('hashchange', hide)
    return () => {
      window.clearTimeout(timer.current)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', hide)
      document.removeEventListener('pointerdown', hide)
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('hashchange', hide)
    }
  }, [])

  if (!tip) return null
  return createPortal(
    <div className={`tip tip--${tip.side}`} role="tooltip" style={{ left: tip.x, top: tip.y }}>
      <span className="tip__title">{tip.title}</span>
      {tip.detail && <span className="tip__detail">{tip.detail}</span>}
    </div>,
    document.body,
  )
}
