import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { useFitToWindow } from '../hooks/useFitToWindow'
import { memberNames, projects, type ProjectSummary } from '../data/projects'
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
import flagSmall from '../assets/figma/home/flag-small.svg'
import chevron from '../assets/figma/home/chevron.svg'
import statusSmall from '../assets/figma/home/status-small.svg'
import './HomeScreen.css'

const stageIcons = { Testing: stageTesting, Research: stageResearch }
const flagIcons = { thin: flagThin, bold: flagBold }

export default function HomeScreen() {
  const fitStyle = useFitToWindow()
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const visible = projects.filter((p) => p.name.toLowerCase().includes(q))

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
        <button className="add-card" type="button">
          <svg className="add-card__border" aria-hidden="true">
            <rect />
          </svg>
          <img src={addPlus} alt="" width={38} height={38} />
          <span>Add Project</span>
        </button>
        {visible.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  )
}

function ProjectCard({ project: p }: { project: ProjectSummary }) {
  const doneCount = p.steps.filter((s) => s.done).length
  const openHeight = useOpenHeight()

  const content = (
    <>
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
            <img src={stageIcons[p.stage]} alt="" width={14} height={14} />
            {p.stage}
          </span>
        </span>
        <span className="pcard__stack">
          {p.members.map((m) => (
            <Avatar key={m} who={m} size={37} />
          ))}
        </span>
      </span>

      <span className="pcard__detail" ref={openHeight.detailRef}>
        <span className="pcard__progress pcard__reveal">
          <img src={checkCircle} alt="" width={20} height={20} />
          <span className="pcard__count">
            {doneCount} of {p.steps.length}
          </span>
          <Bar fill={p.barFill} />
          <span className="pcard__pct">{p.progress}%</span>
        </span>

        <span className="pcard__steps pcard__reveal">
          {p.steps.map((s) => (
            <span key={s.label} className={`pcard__step${s.done ? ' pcard__step--done' : ''}`}>
              {s.done ? <img src={checkCircle} alt="" width={18} height={18} /> : <span className="pcard__step-dot" />}
              {s.label}
            </span>
          ))}
        </span>

        <span className="pcard__props pcard__reveal">
          <Prop icon={<img src={flagSmall} alt="" width={9} height={12} />} label="Priority" value={p.priority} />
          <Prop icon={<img src={statusSmall} alt="" width={12} height={12} />} label="Status" value={p.status} />
        </span>

        <span className="pcard__people pcard__reveal">
          {p.members.map((m) => (
            <span key={m} className="pcard__person">
              <Avatar who={m} size={28} />
              {memberNames[m]}
            </span>
          ))}
        </span>
      </span>
    </>
  )

  const label = `${p.name}: ${p.progress}% complete, ${p.credits} credits, ${p.stage}`
  const style = { '--open-h': openHeight.value ? `${openHeight.value}px` : undefined } as CSSProperties
  return (
    <div className="pcard-slot">
      {p.href ? (
        <a className="pcard" href={p.href} aria-label={`Open ${label}`} style={style}>
          {content}
        </a>
      ) : (
        <div className="pcard" tabIndex={0} aria-label={label} style={style}>
          {content}
        </div>
      )}
    </div>
  )
}

// The open card height is the detail block's bottom edge plus the card's bottom padding.
// Measuring it lets CSS animate a plain pixel height, which is smoother than animating to `auto`.
const OPEN_PADDING_BOTTOM = 24

function useOpenHeight() {
  const detailRef = useRef<HTMLSpanElement>(null)
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

function Prop({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <span className="pcard__prop">
      <span className="pcard__prop-label">
        <span className="pcard__prop-icon">{icon}</span>
        {label}
      </span>
      <span className="pcard__chip">
        <img src={chevron} alt="" width={20} height={20} />
        {value}
      </span>
    </span>
  )
}
