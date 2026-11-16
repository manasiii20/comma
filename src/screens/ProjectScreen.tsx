import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { SvgIcon } from '../components/SvgIcon'
import { usePersistentState } from '../hooks/usePersistentState'
import { useFitToWindow } from '../hooks/useFitToWindow'
import {
  initialActivity,
  initialDescription,
  initialTasks,
  project,
  submissionDay,
  team,
  timelineDays,
  user,
  type ActivityItem,
  type AvatarKey,
  type Task,
} from '../data/project'
import logo from '../assets/figma/logo.png'
import avatarAanya from '../assets/figma/avatar-aanya.png'
import navBookPlain from '../assets/figma/nav-book-plain.svg?raw'
import calendarSmall from '../assets/figma/analysis/calendar-small.svg'
import { mayloHealth } from '../data/analysis'
import { AnalysisView } from './AnalysisView'
import navFolder from '../assets/figma/nav-folder.svg?raw'
import navUsers from '../assets/figma/nav-users.svg?raw'
import navCalendar from '../assets/figma/nav-calendar.svg?raw'
import navChart from '../assets/figma/nav-chart.svg?raw'
import navLogout from '../assets/figma/nav-logout.svg?raw'
import searchIcon from '../assets/figma/search.svg'
import ring78 from '../assets/figma/ring-78.svg'
import modifyIcon from '../assets/figma/modify.svg'
import qaGame from '../assets/figma/qa-game.svg'
import playTriangle from '../assets/figma/vector-dot.svg'
import qaTask from '../assets/figma/qa-task.svg'
import qaAnalysis from '../assets/figma/qa-analysis.svg'
import qaExport from '../assets/figma/qa-export.svg'
import checkOn from '../assets/figma/check-on.svg'
import plusIcon from '../assets/figma/plus.svg'
import messageIcon from '../assets/figma/message.svg'
import palImage from '../assets/figma/pal.png'
import textIcon from '../assets/figma/text-t.svg'
import lockIcon from '../assets/figma/lock.svg'
import './ProjectScreen.css'

// In the Figma frame the day gridlines run from x=53 to x=460 of the timeline card (407px track).
const TRACK_START = 53
const TRACK_WIDTH = 407

const timelineBars: {
  name: string
  progress: number
  designLeft: number
  designWidth: number
  designFill: number
  top: number
  track: string
  fill: string
  pill: string
  pillWidth: number
  avatarGap: number
  avatars: AvatarKey[]
}[] = [
  { name: 'Problem Framing', progress: 100, designLeft: 43, designWidth: 114, designFill: 114, top: 41, track: 'rgba(100,196,226,0.88)', fill: 'rgba(100,196,226,0.88)', pill: '#b2e3f3', pillWidth: 33, avatarGap: 14, avatars: ['shreya', 'aanya'] },
  { name: 'Research Models', progress: 95, designLeft: 141, designWidth: 134, designFill: 117, top: 84, track: 'rgba(229,195,249,0.54)', fill: 'rgba(229,195,249,0.81)', pill: '#f8edfe', pillWidth: 33, avatarGap: 23, avatars: ['shreya', 'krisha'] },
  { name: 'Solution Ideation', progress: 65, designLeft: 228, designWidth: 118, designFill: 80, top: 127, track: 'rgba(241,165,165,0.62)', fill: 'rgba(241,165,165,0.88)', pill: '#ffdbdb', pillWidth: 33, avatarGap: 7, avatars: ['dhruv'] },
  { name: 'Prototyping', progress: 15, designLeft: 322, designWidth: 91, designFill: 38, top: 170, track: 'rgba(249,243,151,0.6)', fill: '#efea92', pill: '#fffcca', pillWidth: 25, avatarGap: 0, avatars: [] },
]

const legend = [
  { label: 'Problem Framing', swatch: 'rgba(100,196,226,0.88)' },
  { label: 'Solution Ideation', swatch: '#e8a0a0' },
  { label: 'User Testing', swatch: '#c7ebca' },
  { label: 'Research Models', swatch: '#d5b6e7' },
  { label: 'Prototyping', swatch: '#efea92' },
  { label: 'Submission Deadline', swatch: '' },
]

const PROJECT_ROUTE = '#/project/system-design'

// Overview and Analytics switch views; Files, Team and Calendar have no screens yet.
const navItems: { id: string; label: string; icon: string; w: number; h: number; view?: ProjectView }[] = [
  { id: 'overview', label: 'Overview', icon: navBookPlain, w: 25, h: 22, view: 'overview' },
  { id: 'files', label: 'Files', icon: navFolder, w: 25, h: 21 },
  { id: 'team', label: 'Team', icon: navUsers, w: 24, h: 24 },
  { id: 'calendar', label: 'Calendar', icon: navCalendar, w: 24, h: 26 },
  { id: 'analytics', label: 'Analytics', icon: navChart, w: 24, h: 24, view: 'analysis' },
]

export type ProjectView = 'overview' | 'analysis'

const viewHref = (view: ProjectView) => (view === 'overview' ? PROJECT_ROUTE : `${PROJECT_ROUTE}/analysis`)

const newId = () => Math.random().toString(36).slice(2, 9)

const trackPos = (i: number, count: number) => `calc(var(--track-l) + var(--track-w) * ${i / (count - 1)})`

export default function ProjectScreen({ view = 'overview' }: { view?: ProjectView }) {
  const [tasks, setTasks] = usePersistentState<Task[]>('queue2.tasks', initialTasks)
  const [activity, setActivity] = usePersistentState<ActivityItem[]>('queue2.activity', initialActivity)
  const [description, setDescription] = usePersistentState('queue2.description', initialDescription)
  const [palName, setPalName] = usePersistentState('queue2.palName', '')

  const [query, setQuery] = useState('')
  const [editingDescription, setEditingDescription] = useState(false)
  const [descriptionDraft, setDescriptionDraft] = useState(description)
  const [addingTask, setAddingTask] = useState(false)
  const [taskDraft, setTaskDraft] = useState('')
  const [messaging, setMessaging] = useState(false)
  const [messageDraft, setMessageDraft] = useState('')
  const [lockNudge, setLockNudge] = useState(false)
  const taskInputRef = useRef<HTMLInputElement>(null)
  const fitStyle = useFitToWindow()

  const logActivity = (title: string, detail: string) =>
    setActivity((prev) => [{ id: newId(), avatar: 'aanya' as const, title, detail, at: Date.now() }, ...prev].slice(0, 20))

  const visibleTasks = tasks.filter((t) => t.label.toLowerCase().includes(query.trim().toLowerCase()))

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
    if (!task.done) logActivity('Task Completed', task.label)
  }

  const startAddingTask = () => {
    setAddingTask(true)
    taskInputRef.current?.focus()
  }

  const commitTask = () => {
    const label = taskDraft.trim()
    if (label) {
      setTasks((prev) => [...prev, { id: newId(), label, done: false }])
      logActivity('Task Added', label)
    }
    setTaskDraft('')
    setAddingTask(false)
  }

  const onTaskKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitTask()
    if (e.key === 'Escape') {
      setTaskDraft('')
      setAddingTask(false)
    }
  }

  const toggleDescriptionEdit = () => {
    if (editingDescription) {
      const next = descriptionDraft.trim() || description
      if (next !== description) {
        setDescription(next)
        logActivity('Brief Updated', 'Project description')
      }
      setEditingDescription(false)
    } else {
      setDescriptionDraft(description)
      setEditingDescription(true)
    }
  }

  const sendMessage = () => {
    const text = messageDraft.trim()
    if (text) logActivity('Message Sent', text)
    setMessageDraft('')
    setMessaging(false)
  }

  const exportProject = () => {
    const data = { project, description, tasks, activity, team }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'queue2-project.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const nudgeLock = () => {
    setLockNudge(true)
    setTimeout(() => setLockNudge(false), 450)
  }

  return (
    <div className={`app ${fitStyle ? 'app--fit' : ''}`} style={fitStyle}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__top">
          <a className="sidebar__logo" href="#/" aria-label="All projects">
            <img src={logo} alt="" />
          </a>
          <nav className="sidebar__nav">
            {navItems.map((item) => {
              const active = item.view === view
              const className = `nav-item nav-item--${item.id}${active ? ' nav-item--active' : ''}`
              const icon = <SvgIcon svg={item.icon} width={item.w} height={item.h} />
              return item.view ? (
                <a
                  key={item.id}
                  className={className}
                  href={viewHref(item.view)}
                  aria-label={item.label}
                  title={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  {icon}
                </a>
              ) : (
                <button key={item.id} className={className} aria-label={item.label} title={item.label}>
                  {icon}
                </button>
              )
            })}
          </nav>
        </div>
        <div className="sidebar__bottom">
          <a className="nav-item" href="#/" aria-label="Log out" title="Log out">
            <SvgIcon svg={navLogout} width={24} height={24} />
          </a>
          <img className="sidebar__avatar" src={avatarAanya} alt={user.name} />
        </div>
      </aside>

      <main className="main">
        {/* Header */}
        <header className="header">
          <div className="header__title">
            <h1>{project.name}</h1>
            <p>{project.subtitle}</p>
          </div>
          <label className="search">
            <span className="search__icon">
              <Icon src={searchIcon} width={14} />
            </span>
            <input
              type="search"
              placeholder="Search Tasks"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </header>

        {view === 'analysis' ? (
          <AnalysisView tasks={tasks} activity={activity} query={query} />
        ) : (
          <>
        {/* Row 1 */}
        <div className="row row--top">
          <section className="card overview">
            <div className="card__heading">
              <h2>Dashboard Overview</h2>
              <p>Your project status at a glance</p>
            </div>
            <div className="overview__stats">
              <div className="stat">
                <div className="ring">
                  <img src={ring78} alt="" />
                  <span>{project.completion}%</span>
                </div>
              </div>
              <div className="stat stat--number">
                <strong>{project.hoursSpent}</strong>
                <span>hours spent working</span>
              </div>
              <div className="stat stat--number">
                <strong>{project.daysTillSubmission}</strong>
                <span>days till submission</span>
              </div>
              <div className="stat stat--team">
                <div className="team-grid">
                  <Avatar who="dhruv" size={31} />
                  <Avatar who="aanya" size={31} />
                  <Avatar who="krisha" size={31} />
                  <Avatar who="shreya" size={31} />
                </div>
                <span>Team Members</span>
              </div>
            </div>
            <div className="overview__footer">
              {editingDescription ? (
                <textarea
                  className="overview__desc overview__desc--edit"
                  value={descriptionDraft}
                  autoFocus
                  onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                  onChange={(e) => setDescriptionDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      toggleDescriptionEdit()
                    }
                    if (e.key === 'Escape') setEditingDescription(false)
                  }}
                />
              ) : (
                <p className="overview__desc">{description}</p>
              )}
              <button className="btn btn--modify" onClick={toggleDescriptionEdit}>
                <span className="btn__icon" style={{ width: 29, height: 29, borderRadius: 6 }}>
                  <Icon src={modifyIcon} width={14} />
                </span>
                {editingDescription ? 'Save' : 'Modify'}
              </button>
            </div>
          </section>

          <section className="card activity">
            <div className="card__heading">
              <h2>Activity</h2>
              <p>Your project status at a glance</p>
            </div>
            <div className="activity__body">
              <ul className="activity__feed">
                {activity.slice(0, 3).map((item) => (
                  <li key={item.id} className="feed-item">
                    <Avatar who={item.avatar} size={33} />
                    <div className="feed-item__text">
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="activity__side">
                <div className="panel quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions__row">
                    <a className="qa" href={project.gameUrl} target="_blank" rel="noreferrer">
                      <span className="qa__game">
                        <img src={qaGame} alt="" />
                        <img className="qa__play" src={playTriangle} alt="" />
                      </span>
                      Game
                    </a>
                    <button className="qa" onClick={startAddingTask}>
                      <Icon src={qaTask} width={18} />
                      Task
                    </button>
                    <button className="qa" title="Analysis">
                      <Icon src={qaAnalysis} width={18} />
                      Analysis
                    </button>
                    <button className="qa" onClick={exportProject}>
                      <span className="qa__export">
                        <img src={qaExport} alt="" />
                      </span>
                      Export
                    </button>
                  </div>
                </div>
                <div className="panel project-stats">
                  <h3>Project Stats</h3>
                  <div className="project-stats__rows">
                    <div>
                      <span>Individual Work Hours</span>
                      <strong>{project.individualHours} hours</strong>
                    </div>
                    <div>
                      <span>Team Work Hours</span>
                      <strong>{project.teamHours} hours</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Row 2 */}
        <div className="row row--bottom">
          <section className="card checklist">
            <h2 className="card__title">Checklist</h2>
            <ul className="checklist__list">
              {visibleTasks.map((task) => (
                <li key={task.id}>
                  <button
                    className={`task ${task.done ? 'task--done' : ''}`}
                    onClick={() => toggleTask(task.id)}
                    role="checkbox"
                    aria-checked={task.done}
                  >
                    {task.done ? <Icon src={checkOn} width={13} /> : <span className="task__box" />}
                    <span className="task__label">{task.label}</span>
                  </button>
                </li>
              ))}
              {visibleTasks.length === 0 && <li className="checklist__empty">No tasks match “{query}”</li>}
            </ul>
            <div className="btn btn--wide" onClick={addingTask ? undefined : startAddingTask}>
              <Icon src={plusIcon} width={30} />
              {addingTask ? (
                <input
                  ref={taskInputRef}
                  autoFocus
                  className="btn__input"
                  placeholder="Task name, then Enter"
                  value={taskDraft}
                  onChange={(e) => setTaskDraft(e.target.value)}
                  onKeyDown={onTaskKey}
                  onBlur={commitTask}
                />
              ) : (
                <span>Add Task</span>
              )}
            </div>
          </section>

          <section className="card timeline">
            <h2 className="card__title">Project Timeline</h2>
            <div className="timeline__plot">
              {timelineDays.map((d, i) => (
                <span
                  key={`day-${d}`}
                  className={`timeline__day ${d === submissionDay ? 'is-deadline' : ''}`}
                  style={{ left: trackPos(i, timelineDays.length) }}
                  title={d === submissionDay ? 'Submission deadline' : undefined}
                >
                  {d}
                </span>
              ))}
              {timelineDays.map((d, i) => (
                <span key={`line-${d}`} className="timeline__line" style={{ left: trackPos(i, timelineDays.length) }} />
              ))}
              {timelineBars.map((bar) => (
                <div
                  key={bar.name}
                  className="bar"
                  title={`${bar.name} · ${bar.progress}%`}
                  style={
                    {
                      top: bar.top,
                      left: `calc(var(--track-l) + var(--track-w) * ${(bar.designLeft - TRACK_START) / TRACK_WIDTH})`,
                      width: `calc(var(--track-w) * ${bar.designWidth / TRACK_WIDTH})`,
                      background: bar.track,
                    } as CSSProperties
                  }
                >
                  <div
                    className={`bar__fill ${bar.progress === 15 ? 'bar__fill--small' : ''}`}
                    style={{ width: `${(bar.designFill / bar.designWidth) * 100}%`, background: bar.fill }}
                  >
                    <span className="bar__pill" style={{ background: bar.pill, width: bar.pillWidth }}>
                      {bar.progress}%
                    </span>
                    {bar.avatars.length > 0 && (
                      <span className="bar__avatars" style={{ marginLeft: bar.avatarGap }}>
                        {bar.avatars.map((a) => (
                          <Avatar key={a} who={a} size={18} />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="timeline__legend">
              {legend.map((item) => (
                <span key={item.label}>
                  <i style={item.swatch ? { background: item.swatch } : { border: '0.75px solid #f2f2f2' }} />
                  {item.label}
                </span>
              ))}
            </div>
          </section>

          <section className="card team">
            <h2 className="card__title">Team</h2>
            <ul className="team__list">
              {team.map((m) => (
                <li key={m.id} className="member">
                  <Avatar who={m.avatar} size={38} />
                  <div className="member__text">
                    <strong>{m.name}</strong>
                    <span>{m.role}</span>
                  </div>
                  <span className={`status status--${m.status.toLowerCase()}`}>{m.status}</span>
                </li>
              ))}
            </ul>
            <div className="btn btn--wide btn--message" onClick={messaging ? undefined : () => setMessaging(true)}>
              <span className="btn__icon" style={{ width: 30, height: 30, borderRadius: 6 }}>
                <Icon src={messageIcon} width={14} />
              </span>
              {messaging ? (
                <input
                  className="btn__input"
                  autoFocus
                  placeholder="Message, then Enter"
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage()
                    if (e.key === 'Escape') setMessaging(false)
                  }}
                  onBlur={sendMessage}
                />
              ) : (
                <span>Message Team</span>
              )}
            </div>
          </section>
        </div>
          </>
        )}
      </main>

      {/* Profile panel */}
      <aside className="profile">
        <div className="profile__head">
          <img className="profile__avatar" src={avatarAanya} alt="" />
          <div className="profile__id">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        </div>
        {view === 'analysis' ? (
          <section className="side-card maylo">
            <div className="side-card__heading">
              <h3>Maylo’s Health</h3>
              <p>Representative of your work health</p>
            </div>
            <div className="maylo__body">
              <div className="maylo__pal">
                <span>
                  <img src={palImage} alt={palName ? `${palName} the pal` : 'Maylo'} />
                </span>
              </div>
              <dl className="maylo__stats">
                <div>
                  <dt>Work Hours</dt>
                  <dd>{mayloHealth.workHours}</dd>
                </div>
                <div>
                  <dt>Focus Mode</dt>
                  <dd>{mayloHealth.focusMode}</dd>
                </div>
                <div>
                  <dt>Burnout Scale</dt>
                  <dd>{mayloHealth.burnout}</dd>
                </div>
              </dl>
            </div>
            <p className="maylo__mood">{mayloHealth.mood}</p>
            <button type="button" className="maylo__breaks">
              <span className="maylo__breaks-icon">
                <Icon src={calendarSmall} width={11} height={13} />
              </span>
              Set Breaks for Maylo
            </button>
          </section>
        ) : (
        <section className="side-card pal">
          <div className="side-card__heading">
            <h3>Make Your Own Pal</h3>
            <p>Your friend at every stage</p>
          </div>
          <div className="pal__image">
            <img src={palImage} alt={palName ? `${palName} the pal` : 'Your pal'} />
          </div>
          <label className="pal__name">
            <span className="btn__icon" style={{ width: 27, height: 27, borderRadius: 5 }}>
              <Icon src={textIcon} width={11} />
            </span>
            <input
              placeholder="Name Your Pal"
              value={palName}
              maxLength={24}
              onChange={(e) => setPalName(e.target.value)}
            />
          </label>
        </section>
        )}

        <section className="side-card standard">
          <div className="side-card__heading">
            <h3>Set Your Standard</h3>
            <p>Unlocks in {project.daysTillSubmission} days</p>
          </div>
          <div className="standard__locked">
            <p>
              Aim to create and execute solutions truly helpful an useful to the user in context. Aim to create and
              execute solutions truly helpful an useful to the user in context. Aim to create.
            </p>
            <button
              className={`standard__lock ${lockNudge ? 'is-nudging' : ''}`}
              onClick={nudgeLock}
              aria-label={`Locked, unlocks in ${project.daysTillSubmission} days`}
              title={`Unlocks in ${project.daysTillSubmission} days`}
            >
              <Icon src={lockIcon} width={13} height={16.25} />
            </button>
          </div>
          <p className="standard__note">
            Your goal for the project is set. Look back at your initial set goal once the project is over.
          </p>
        </section>
      </aside>
    </div>
  )
}
