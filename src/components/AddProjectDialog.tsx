import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Avatar } from './Avatar'
import {
  memberKeys,
  memberNames,
  priorityOptions,
  statusOptions,
  type ProjectSummary,
} from '../data/projects'
import type { AvatarKey } from '../data/project'
import './AddProjectDialog.css'

const MAX_STEPS = 6

type Props = {
  open: boolean
  onClose: () => void
  onCreate: (project: ProjectSummary) => void
}

export function AddProjectDialog({ open, onClose, onCreate }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [credits, setCredits] = useState(2)
  const [stage, setStage] = useState('Planning')
  const [priority, setPriority] = useState<string>('Moderate')
  const [status, setStatus] = useState<string>('Not Started')
  const [members, setMembers] = useState<AvatarKey[]>(['aanya'])
  const [steps, setSteps] = useState<string[]>([])
  const [stepDraft, setStepDraft] = useState('')
  const [triedSubmit, setTriedSubmit] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      setName('')
      setCredits(2)
      setStage('Planning')
      setPriority('Moderate')
      setStatus('Not Started')
      setMembers(['aanya'])
      setSteps([])
      setStepDraft('')
      setTriedSubmit(false)
      dialog.showModal()
      nameRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const toggleMember = (m: AvatarKey) =>
    setMembers((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : memberKeys.filter((k) => k === m || prev.includes(k))))

  const addStep = () => {
    const label = stepDraft.trim()
    if (!label || steps.length >= MAX_STEPS) return
    setSteps((prev) => [...prev, label])
    setStepDraft('')
  }

  const onStepKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addStep()
    }
  }

  const nameError = triedSubmit && !name.trim() ? 'Give the project a name' : ''
  const membersError = triedSubmit && members.length === 0 ? 'Pick at least one member' : ''

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTriedSubmit(true)
    const trimmed = name.trim()
    if (!trimmed || members.length === 0) {
      if (!trimmed) nameRef.current?.focus()
      return
    }
    const pending = stepDraft.trim()
    const allSteps = pending && steps.length < MAX_STEPS ? [...steps, pending] : steps
    onCreate({
      id: `custom-${Date.now().toString(36)}`,
      name: trimmed,
      credits,
      stage: stage.trim() || 'Planning',
      progress: 0,
      barFill: 0,
      flag: 'bold',
      steps: allSteps.map((label) => ({ label, done: false })),
      priority,
      status,
      members,
      custom: true,
    })
  }

  return (
    <dialog
      ref={dialogRef}
      className="add-dialog"
      aria-labelledby="add-dialog-title"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
    >
      <form className="add-dialog__panel" onSubmit={submit} noValidate>
        <header className="add-dialog__head">
          <h2 id="add-dialog-title">New project</h2>
          <button type="button" className="add-dialog__close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <label className="add-field">
          <span className="add-field__label">Project name</span>
          <input
            ref={nameRef}
            className="add-field__input"
            value={name}
            maxLength={28}
            placeholder="e.g. Service Design"
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!nameError}
          />
          {nameError && <span className="add-field__error">{nameError}</span>}
        </label>

        <div className="add-dialog__row">
          <label className="add-field">
            <span className="add-field__label">Credits</span>
            <input
              className="add-field__input"
              type="number"
              min={1}
              max={12}
              value={credits}
              onChange={(e) => setCredits(Math.min(12, Math.max(1, Number(e.target.value) || 1)))}
            />
          </label>
          <label className="add-field">
            <span className="add-field__label">Current phase</span>
            <input
              className="add-field__input"
              value={stage}
              maxLength={16}
              placeholder="Planning"
              onChange={(e) => setStage(e.target.value)}
            />
          </label>
        </div>

        <div className="add-dialog__row">
          <label className="add-field">
            <span className="add-field__label">Priority</span>
            <select className="add-field__input add-field__select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {priorityOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="add-field">
            <span className="add-field__label">Status</span>
            <select className="add-field__input add-field__select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="add-field">
          <legend className="add-field__label">Team members</legend>
          <div className="add-members">
            {memberKeys.map((m) => (
              <button
                key={m}
                type="button"
                className="add-member"
                aria-pressed={members.includes(m)}
                onClick={() => toggleMember(m)}
              >
                <Avatar who={m} size={28} />
                {memberNames[m]}
              </button>
            ))}
          </div>
          {membersError && <span className="add-field__error">{membersError}</span>}
        </fieldset>

        <div className="add-field">
          <span className="add-field__label">
            Steps <span className="add-field__hint">optional, up to {MAX_STEPS}</span>
          </span>
          {steps.length > 0 && (
            <ol className="add-steps">
              {steps.map((s, i) => (
                <li key={`${s}-${i}`}>
                  <span className="add-steps__dot" />
                  <span className="add-steps__label">{s}</span>
                  <button
                    type="button"
                    className="add-steps__remove"
                    onClick={() => setSteps((prev) => prev.filter((_, j) => j !== i))}
                    aria-label={`Remove step ${s}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ol>
          )}
          {steps.length < MAX_STEPS && (
            <div className="add-steps__new">
              <input
                className="add-field__input"
                value={stepDraft}
                maxLength={32}
                placeholder="Add a step and press Enter"
                onChange={(e) => setStepDraft(e.target.value)}
                onKeyDown={onStepKey}
                aria-label="New step"
              />
              <button type="button" className="add-btn add-btn--ghost" onClick={addStep} disabled={!stepDraft.trim()}>
                Add
              </button>
            </div>
          )}
        </div>

        <footer className="add-dialog__actions">
          <button type="button" className="add-btn add-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="add-btn add-btn--primary">
            Create project
          </button>
        </footer>
      </form>
    </dialog>
  )
}
