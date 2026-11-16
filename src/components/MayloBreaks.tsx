import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './AddProjectDialog.css'
import './MayloBreaks.css'
import type { BreakSettings } from '../utils/breaks'

const EVERY_OPTIONS = [25, 45, 60, 90]
const LENGTH_OPTIONS = [5, 10, 15]

type DialogProps = {
  open: boolean
  value: BreakSettings | null
  onSave: (value: BreakSettings | null) => void
  onClose: () => void
}

// "Set Breaks for Maylo": pick how often to be reminded and how long each break is.
export function BreaksDialog({ open, value, onSave, onClose }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [every, setEvery] = useState(value?.every ?? 60)
  const [length, setLength] = useState(value?.length ?? 10)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      setEvery(value?.every ?? 60)
      setLength(value?.length ?? 10)
      d.showModal()
    } else if (!open && d.open) {
      d.close()
    }
  }, [open, value])

  return (
    <dialog
      ref={ref}
      className="add-dialog breaks-dialog"
      aria-labelledby="breaks-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      <form
        className="add-dialog__panel"
        onSubmit={(e) => {
          e.preventDefault()
          onSave({ every, length })
        }}
      >
        <header className="add-dialog__head">
          <h2 id="breaks-title">Breaks for Maylo</h2>
          <button type="button" className="add-dialog__close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <p className="breaks-dialog__intro">
          Maylo will nudge you to step away while this dashboard is open. Short, regular breaks keep burnout down.
        </p>

        <Choices label="Remind me every" options={EVERY_OPTIONS} value={every} onChange={setEvery} />
        <Choices label="Each break lasts" options={LENGTH_OPTIONS} value={length} onChange={setLength} />

        <footer className="add-dialog__actions breaks-dialog__actions">
          {value && (
            <button type="button" className="add-btn add-btn--ghost breaks-dialog__off" onClick={() => onSave(null)}>
              Turn off
            </button>
          )}
          <button type="button" className="add-btn add-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="add-btn add-btn--primary">
            Save breaks
          </button>
        </footer>
      </form>
    </dialog>
  )
}

function Choices({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: number[]
  value: number
  onChange: (v: number) => void
}) {
  return (
    <fieldset className="add-field">
      <legend className="add-field__label">{label}</legend>
      <div className="choices" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={o === value}
            className="choice"
            onClick={() => onChange(o)}
          >
            {o} min
          </button>
        ))}
      </div>
    </fieldset>
  )
}

type ToastProps = { length: number; onTake: () => void; onSnooze: () => void }

// Shown when a break is due. Rendered in <body> so it sits above the scaled layout.
export function BreakToast({ length, onTake, onSnooze }: ToastProps) {
  return createPortal(
    <div className="break-toast" role="alert">
      <span className="break-toast__dot" aria-hidden="true" />
      <div className="break-toast__text">
        <strong>Break time</strong>
        <span>Maylo says: step away for {length} minutes.</span>
      </div>
      <div className="break-toast__actions">
        <button type="button" className="break-toast__btn" onClick={onSnooze}>
          Snooze 5 min
        </button>
        <button type="button" className="break-toast__btn break-toast__btn--primary" onClick={onTake}>
          Take break
        </button>
      </div>
    </div>,
    document.body,
  )
}
