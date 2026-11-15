import { useState, type CSSProperties, type ReactNode } from 'react'
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
import stepTree from '../assets/figma/home/step-tree.svg'
import stepDone from '../assets/figma/home/step-done.svg'
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
        <button className="home-filter home-filter--status" type="button">
          <img src={filterIcon} alt="" width={41} height={41} />
          <span>All Status</span>
        </button>
        <button className="home-filter home-filter--priority" type="button">
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
  const content = (
    <>
      <span className="pcard__title">{p.name}</span>

      <span className="pcard__compact" aria-hidden="true">
        <span className="pcard__bar-group">
          <Bar fill={p.barFill} width={128} height={9} />
          <span className="pcard__pct">{p.progress}%</span>
        </span>
        <span className="pcard__meta-row">
          <span className="pcard__facts">
            <span className="pcard__fact pcard__fact--credits">
              <img src={flagIcons[p.flag]} alt="" className={`pcard__flag pcard__flag--${p.flag}`} />
              {p.credits} credits
            </span>
            <span className="pcard__fact pcard__fact--stage">
              <img src={stageIcons[p.stage]} alt="" width={13.75} height={13.75} />
              {p.stage}
            </span>
          </span>
          <span className="pcard__stack" style={{ width: stackLeft(p.members.length - 1) + 37 }}>
            {p.members.map((m, i) => (
              <span key={m} className="pcard__stack-item" style={{ left: stackLeft(i) }}>
                <Avatar who={m} size={37} />
              </span>
            ))}
          </span>
        </span>
      </span>

      <span className="pcard__detail">
        <span className="pcard__progress">
          <img src={checkCircle} alt="" width={17} height={17} />
          <span className="pcard__count">
            {doneCount} of {p.steps.length}
          </span>
          <Bar fill={p.barFill} width={88} height={6.1875} />
          <span className="pcard__progress-pct">{p.progress}%</span>
        </span>

        <img className="pcard__tree" src={stepTree} alt="" />
        <span className="pcard__steps">
          {p.steps.map((s) => (
            <span key={s.label} className={`pcard__step${s.done ? ' pcard__step--done' : ''}`}>
              {s.done ? <img src={stepDone} alt="" width={12} height={12} /> : <span className="pcard__step-dot" />}
              <span>{s.label}</span>
            </span>
          ))}
        </span>

        <span className="pcard__props">
          <Prop icon={<img src={flagSmall} alt="" width={8} height={11} className="pcard__prop-flag" />} label="Priority" value={p.priority} />
          <Prop icon={<img src={statusSmall} alt="" width={10.5} height={10.5} className="pcard__prop-status" />} label="Status" value={p.status} />
        </span>

        <span className="pcard__people">
          {p.members.map((m) => (
            <span key={m} className="pcard__person">
              <Avatar who={m} size={26} />
              <span>{memberNames[m]}</span>
            </span>
          ))}
        </span>
      </span>
    </>
  )

  const label = `${p.name}: ${p.progress}% complete, ${p.credits} credits, ${p.stage}`
  return p.href ? (
    <a className="pcard" href={p.href} aria-label={`Open ${label}`}>
      {content}
    </a>
  ) : (
    <div className="pcard" tabIndex={0} aria-label={label}>
      {content}
    </div>
  )
}

// Figma spaces the overlapping 37px avatars at x = 0, 32, 65, 97.
function stackLeft(i: number) {
  return Math.round(i * 32.34)
}

function Bar({ fill, width, height }: { fill: number; width: number; height: number }) {
  const style = { width, height } as CSSProperties
  return (
    <span className="pbar" style={style}>
      <span className="pbar__fill" style={{ width: `${fill * 100}%` }} />
    </span>
  )
}

function Prop({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <span className="pcard__prop">
      <span className="pcard__prop-label">
        {icon}
        {label}
      </span>
      <span className="pcard__chip">
        <img src={chevron} alt="" width={15} height={15} />
        {value}
      </span>
    </span>
  )
}
