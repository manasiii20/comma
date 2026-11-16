import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import './Dropdown.css'

type Props = {
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  // "chip": compact button in project cards. "field": full-width form control.
  // "toolbar": the large filter buttons on the home screen, with an icon box on the left.
  variant?: 'chip' | 'field' | 'toolbar'
  label: string
  onOpenChange?: (open: boolean) => void
  // Toolbar only: the icon shown in the dark box on the left.
  icon?: ReactNode
}

export function Dropdown({ value, options, onChange, variant = 'chip', label, onOpenChange, icon }: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(() => Math.max(0, options.indexOf(value)))
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const onOpenChangeRef = useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange

  const setOpenState = (next: boolean) => {
    setOpen(next)
    onOpenChangeRef.current?.(next)
    if (next) setActive(Math.max(0, options.indexOf(value)))
  }

  // Close when pressing anywhere outside the dropdown.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return
      setOpen(false)
      onOpenChangeRef.current?.(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Return focus to the button only for keyboard use, so a mouse pick doesn't leave a focus ring behind.
  const choose = (option: string, fromKeyboard = false) => {
    if (option !== value) onChange(option)
    setOpenState(false)
    if (fromKeyboard) buttonRef.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        setOpenState(true)
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      setOpenState(false)
      buttonRef.current?.focus()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % options.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + options.length) % options.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(options[active], true)
    } else if (e.key === 'Tab') {
      setOpenState(false)
    }
  }

  return (
    <div
      className={`dd dd--${variant}${open ? ' dd--open' : ''}${value !== options[0] ? ' dd--active' : ''}`}
      ref={rootRef}
      onKeyDown={onKeyDown}
    >
      <button
        ref={buttonRef}
        type="button"
        className="dd__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${value}`}
        onClick={() => setOpenState(!open)}
      >
        {variant === 'chip' && <span className="dd__chevron-box" aria-hidden="true" />}
        {variant === 'toolbar' && (
          <span className="dd__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="dd__value">{value}</span>
        <svg className="dd__chevron" width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="dd__menu" role="listbox" id={listId} aria-label={label}>
          {options.map((o, i) => (
            <li
              key={o}
              role="option"
              aria-selected={o === value}
              className={`dd__option${i === active ? ' dd__option--active' : ''}`}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(o)}
            >
              <span>{o}</span>
              {o === value && (
                <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true">
                  <path d="M1 5l4 4 8-8" fill="none" stroke="#7fdb7f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
