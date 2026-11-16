import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { useFitToWindow } from '../hooks/useFitToWindow'
import { usePersistentState } from '../hooks/usePersistentState'
import { AddProjectDialog } from '../components/AddProjectDialog'
import { memberNames, priorityOptions, projects, statusOptions, type ProjectSummary } from '../data/projects'
import { Dropdown } from '../components/Dropdown'
import logo from '../assets/figma/logo.png'
import searchIcon from '../assets/figma/home/search.svg'
import filterIcon from '../assets/figma/home/filter.svg'
import priorityIcon from '../assets/figma/home/priority-doc.svg'
import addPlus from '../assets/figma/home/add-plus.svg'
import flagThin from '../assets/figma/home/flag-thin.svg'
import flagBold from '../assets/figma/home/flag-bold.svg'
import stageTesting from '../assets/figma/home/stage-testing.svg'
import stageResearch from '../assets/figma/home/stage-research.svg'
import checkCircle from '../assets/figma/home/check-circle.svg'
import './HomeScreen.css'

const stageIcon = (stage: string) => (stage === 'Testing' ? stageTesting : stageResearch)
const flagIcons = { thin: flagThin, bold: flagBold }

const STORAGE_KEY = 'comma.projects.v2'

// First visit with this version: built-in projects, plus any made with the earlier Add Project form.
function loadInitialProjects(): ProjectSummary[] {
  try {
    const older = JSON.parse(localStorage.getItem('comma.projects') ?? '[]') as ProjectSummary[]
    return [...older, ...projects]
  } catch {
    return projects
  }
}

export default function HomeScreen() {
  const fitStyle = useFitToWindow()
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  // Every project (built-in and created) lives in this browser's storage, so edits and deletions stick.
  const [list, setList] = usePersistentState<ProjectSummary[]>(STORAGE_KEY, loadInitialProjects)
  const q = query.trim().toLowerCase()
  const visible = list.filter((p) => p.name.toLowerCase().includes(q))

  const createProject = (project: ProjectSummary) => {
    setList((prev) => [project, ...prev])
    setQuery('')
    setAdding(false)
  }

  const updateProject = (id: string, patch: Partial<ProjectSummary>) =>
    setList((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  const deleteProject = (id: string) => setList((prev) => prev.filter((p) => p.id !== id))

  return (
    <div className={`home${fitStyle ? ' home--fit' : ''}`} style={fitStyle}>
      <header className="home__brand">
        <span className="home__logo">
          <img src={logo} alt="" />
        </span>
        <h1 className="home__wordmark">comma</h1>
      </header>

      <div className="home__toolbar">
        <label className="home-search">
          <span className="home-search__icon">
            <Icon src={searchIcon} width={18} />
          </span>
          <input
            className="home-search__input"
            type="search"
            placeholder="Search Projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search projects"
          />
        </label>
        <button className="home-filter" type="button">
          <img src={filterIcon} alt="" width={41} height={41} />
          <span>All Status</span>
        </button>
        <button className="home-filter" type="button">
          <span className="home-filter__icon">
            <Icon src={priorityIcon} width={17} height={21} />
          </span>
          <span>All Priority</span>
        </button>
      </div>

      <div className="home__cards">
        <button className="add-card" type="button" onClick={() => setAdding(true)} aria-haspopup="dialog">
          <img src={addPlus} alt="" width={38} height={38} />
          <span>Add Project</span>
        </button>
        {visible.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onChange={(patch) => updateProject(p.id, patch)}
            onDelete={() => deleteProject(p.id)}
          />
        ))}
      </div>

      <AddProjectDialog open={adding} onClose={() => setAdding(false)} onCreate={createProject} />
    </div>
  )
}

function ProjectCard({
  project: p,
  onChange,
  onDelete,
}: {
  project: ProjectSummary
  onChange: (patch: Partial<ProjectSummary>) => void
  onDelete: () => void
}) {
  const doneCount = p.steps.filter((s) => s.done).length
  const openHeight = useOpenHeight()
  const [menuOpen, setMenuOpen] = useState(false)

  const open = () => {
    if (p.href) window.location.hash = p.href.slice(1)
  }

  // Clicking empty card space opens the project; buttons and menus inside do their own thing.
  const onCardClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest('button, a, [role="listbox"]')) return
    open()
  }

  const onCardKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) open()
  }

  const label = `${p.name}: ${p.progress}% complete, ${p.credits} credits, ${p.stage}`
  const style = { '--open-h': openHeight.value ? `${openHeight.value}px` : undefined } as CSSProperties

  return (
    <div className="pcard-slot">
      <div
        className={`pcard${p.href ? ' pcard--link' : ''}${menuOpen ? ' pcard--pinned' : ''}`}
        tabIndex={0}
        aria-label={label}
        style={style}
        onClick={onCardClick}
        onKeyDown={onCardKey}
      >
        <span className="pcard__head">
          <span className="pcard__title">{p.name}</span>
          <span className="pcard__summary-bar" aria-hidden="true">
            <Bar fill={p.barFill} />
            <span className="pcard__pct">{p.progress}%</span>
          </span>
        </span>

        <span className="pcard__summary" aria-hidden="true">
          <span className="pcard__facts">
            <span className="pcard__fact">
              <img src={flagIcons[p.flag]} alt="" className={`pcard__flag pcard__flag--${p.flag}`} />
              {p.credits} credits
            </span>
            <span className="pcard__fact">
              <img src={stageIcon(p.stage)} alt="" width={14} height={14} />
              {p.stage}
            </span>
          </span>
          <span className="pcard__stack">
            {p.members.map((m) => (
              <Avatar key={m} who={m} size={37} />
            ))}
          </span>
        </span>

        <div className="pcard__detail" ref={openHeight.detailRef}>
          <span className="pcard__progress pcard__reveal">
            <img src={checkCircle} alt="" width={20} height={20} />
            <span className="pcard__count">{p.steps.length ? `${doneCount} of ${p.steps.length}` : 'No steps yet'}</span>
            <Bar fill={p.barFill} />
            <span className="pcard__pct">{p.progress}%</span>
          </span>

          <span className={`pcard__steps pcard__reveal${p.steps.length ? '' : ' pcard__steps--empty'}`}>
            {p.steps.map((s) => (
              <span key={s.label} className={`pcard__step${s.done ? ' pcard__step--done' : ''}`}>
                {s.done ? <img src={checkCircle} alt="" width={18} height={18} /> : <span className="pcard__step-dot" />}
                {s.label}
              </span>
            ))}
          </span>

          <div className="pcard__props pcard__reveal">
            <div className="pcard__prop">
              <span className="pcard__prop-label">Priority</span>
              <Dropdown
                label="Priority"
                value={p.priority}
                options={priorityOptions}
                onChange={(priority) => onChange({ priority })}
                onOpenChange={setMenuOpen}
              />
            </div>
            <div className="pcard__prop">
              <span className="pcard__prop-label">Status</span>
              <Dropdown
                label="Status"
                value={p.status}
                options={statusOptions}
                onChange={(status) => onChange({ status })}
                onOpenChange={setMenuOpen}
              />
            </div>
          </div>

          <span className="pcard__people pcard__reveal">
            {p.members.map((m) => (
              <span key={m} className="pcard__person">
                <Avatar who={m} size={30} />
                {memberNames[m]}
              </span>
            ))}
          </span>

          <div className="pcard__actions pcard__reveal">
            <button
              type="button"
              className="pcard__delete"
              onClick={() => {
                if (window.confirm(`Delete "${p.name}"?`)) onDelete()
              }}
            >
              Delete project
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// The open card height is the detail block's bottom edge plus the card's bottom padding.
// Measuring it lets CSS animate a plain pixel height, which is smoother than animating to `auto`.
const OPEN_PADDING_BOTTOM = 24

function useOpenHeight() {
  const detailRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState(0)

  useLayoutEffect(() => {
    const el = detailRef.current
    if (!el) return
    const measure = () => setValue(Math.ceil(el.offsetTop + el.offsetHeight + OPEN_PADDING_BOTTOM))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [])

  return { detailRef, value }
}

function Bar({ fill }: { fill: number }) {
  return (
    <span className="pbar">
      <span className="pbar__fill" style={{ width: `${fill * 100}%` }} />
    </span>
  )
}
