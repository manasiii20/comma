import { useRef, useState, type KeyboardEvent } from 'react'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { usePersistentState } from '../hooks/usePersistentState'
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
import navBook from '../assets/figma/nav-book.svg'
import navFolder from '../assets/figma/nav-folder.svg'
import navUsers from '../assets/figma/nav-users.svg'
import navCalendar from '../assets/figma/nav-calendar.svg'
import navChart from '../assets/figma/nav-chart.svg'
import navLogout from '../assets/figma/nav-logout.svg'
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
import gridLine from '../assets/figma/grid-line.svg'
import messageIcon from '../assets/figma/message.svg'
import palImage from '../assets/figma/pal.png'
import textIcon from '../assets/figma/text-t.svg'
import lockIcon from '../assets/figma/lock.svg'
import './ProjectScreen.css'

const gridLineX = [53, 97, 141, 185, 229, 275, 322, 368, 413, 460]

const timelineBars: {
  name: string
  progress: number
  left: number
  top: number
  width: number
  fillWidth: number
  track: string
  fill: string
  pill: string
  avatars: AvatarKey[]
}[] = [
  { name: 'Problem Framing', progress: 100, left: 43, top: 126, width: 114, fillWidth: 114, track: 'rgba(100,196,226,0.88)', fill: 'rgba(100,196,226,0.88)', pill: '#b2e3f3', avatars: ['shreya', 'aanya'] },
  { name: 'Research Models', progress: 95, left: 141, top: 169, width: 134, fillWidth: 117, track: 'rgba(229,195,249,0.54)', fill: 'rgba(229,195,249,0.81)', pill: '#f8edfe', avatars: ['shreya', 'krisha'] },
  { name: 'Solution Ideation', progress: 65, left: 228, top: 212, width: 118, fillWidth: 80, track: 'rgba(241,165,165,0.62)', fill: 'rgba(241,165,165,0.88)', pill: '#ffdbdb', avatars: ['dhruv'] },
  { name: 'Prototyping', progress: 15, left: 322, top: 255, width: 91, fillWidth: 38, track: 'rgba(249,243,151,0.6)', fill: '#efea92', pill: '#fffcca', avatars: [] },
]

const legend = [
  { label: 'Problem Framing', swatch: 'rgba(100,196,226,0.88)' },
  { label: 'Solution Ideation', swatch: '#e8a0a0' },
  { label: 'User Testing', swatch: '#c7ebca' },
  { label: 'Research Models', swatch: '#d5b6e7' },
  { label: 'Prototyping', swatch: '#efea92' },
  { label: 'Submission Deadline', swatch: '' },
]

const navItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'files', label: 'Files', icon: navFolder, w: 25, h: 21 },
  { id: 'team', label: 'Team', icon: navUsers, w: 24, h: 24 },
  { id: 'calendar', label: 'Calendar', icon: navCalendar, w: 24, h: 26 },
  { id: 'analytics', label: 'Analytics', icon: navChart, w: 24, h: 24 },
]

const newId = () => Math.random().toString(36).slice(2, 9)

export default function ProjectScreen() {
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

  const logActivity = (title: string, detail: string) =>
    setActivity((prev) => [{ id: newId(), avatar: 'aanya' as const, title, detail }, ...prev].slice(0, 20))

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
    <div className="screen">
      <div className="screen__right-bg" />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__stack">
          <div className="sidebar__top">
            <button className="sidebar__logo" aria-label="Queue2 home">
              <img src={logo} alt="" />
            </button>
            <nav className="sidebar__nav">
              <button className="nav-item nav-item--active" aria-label="Overview" aria-current="page">
                <Icon src={navBook} width={60} />
              </button>
              <div className="sidebar__nav-links">
                {navItems.slice(1).map((item) => (
                  <button key={item.id} className="nav-item" aria-label={item.label} title={item.label}>
                    <Icon src={item.icon!} width={item.w!} height={item.h!} />
                  </button>
                ))}
              </div>
            </nav>
          </div>
          <div className="sidebar__bottom">
            <button className="nav-item" aria-label="Log out" title="Log out">
              <Icon src={navLogout} width={24} />
            </button>
            <img className="sidebar__avatar" src={avatarAanya} alt={user.name} />
          </div>
        </div>
      </aside>

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

      {/* Row 1 */}
      <div className="row row--top">
        <section className="card overview">
          <div className="overview__inner">
            <div className="card__heading">
              <h2>Dashboard Overview</h2>
              <p>Your project status at a glance</p>
            </div>
            <div className="overview__stats">
              <div className="stat stat--ring">
                <div className="ring">
                  <img src={ring78} alt="" />
                  <span>{project.completion}%</span>
                </div>
              </div>
              <div className="stat stat--number" style={{ paddingTop: 20 }}>
                <strong>{project.hoursSpent}</strong>
                <span>hours spent working</span>
              </div>
              <div className="stat stat--number" style={{ paddingTop: 21 }}>
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
          </div>
        </section>

        <section className="card activity">
          <div className="activity__inner">
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
                    <a className="qa" href={project.gameUrl} target="_blank" rel="noreferrer" style={{ paddingTop: 7 }}>
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
                    <div style={{ gap: 35 }}>
                      <span>Individual Work Hours</span>
                      <strong>{project.individualHours} hours</strong>
                    </div>
                    <div style={{ gap: 57 }}>
                      <span>Team Work Hours</span>
                      <strong>{project.teamHours} hours</strong>
                    </div>
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
          <div className="checklist__inner">
            <h2 className="card__title">Checklist</h2>
            <div className="checklist__body">
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
            </div>
          </div>
        </section>

        <section className="card timeline">
          <h2 className="card__title timeline__title">Project Timeline</h2>
          <div className="timeline__days">
            {timelineDays.map((d) => (
              <span key={d} style={{ width: d >= 20 ? 21 : 19 }} className={d === submissionDay ? 'is-deadline' : ''}>
                {d}
              </span>
            ))}
          </div>
          <div className="timeline__deadline" title="Submission deadline" />
          {gridLineX.map((x) => (
            <img key={x} className="timeline__line" src={gridLine} alt="" style={{ left: x }} />
          ))}
          {timelineBars.map((bar) => (
            <div
              key={bar.name}
              className="bar"
              title={`${bar.name} · ${bar.progress}%`}
              style={{ left: bar.left, top: bar.top, width: bar.width, background: bar.track }}
            >
              {bar.fillWidth > 0 && (
                <div
                  className={`bar__fill ${bar.progress === 15 ? 'bar__fill--small' : ''}`}
                  style={{ width: bar.fillWidth, background: bar.fill }}
                >
                  <span className="bar__pill" style={{ background: bar.pill, width: bar.progress === 15 ? 25 : 33 }}>
                    {bar.progress}%
                  </span>
                  {bar.avatars.length > 0 && (
                    <span className="bar__avatars" style={{ marginLeft: bar.progress === 95 ? 23 : bar.progress === 65 ? 7 : 14 }}>
                      {bar.avatars.map((a) => (
                        <Avatar key={a} who={a} size={18} />
                      ))}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="timeline__legend">
            {legend.map((item) => (
              <span key={item.label}>
                <i
                  style={
                    item.swatch
                      ? { background: item.swatch }
                      : { border: '0.75px solid #f2f2f2' }
                  }
                />
                {item.label}
              </span>
            ))}
          </div>
        </section>

        <section className="card team">
          <div className="team__inner">
            <h2 className="card__title">Team</h2>
            <div className="team__body">
              <ul className="team__list">
                {team.map((m) => (
                  <li key={m.id} className="member">
                    <Avatar who={m.avatar} size={38} />
                    <div className="member__info">
                      <div className="member__text">
                        <strong>{m.name}</strong>
                        <span>{m.role}</span>
                      </div>
                      <span className={`status status--${m.status.toLowerCase()}`}>{m.status}</span>
                    </div>
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
            </div>
          </div>
        </section>
      </div>

      {/* Right panel */}
      <aside className="profile">
        <div className="profile__head">
          <img className="profile__avatar" src={avatarAanya} alt="" />
          <div className="profile__id">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        </div>
        <div className="profile__cards">
          <section className="side-card pal">
            <div className="side-card__inner" style={{ gap: 16 }}>
              <div className="side-card__heading" style={{ gap: 3, width: 246 }}>
                <h3>Make Your Own Pal</h3>
                <p style={{ height: 20 }}>Your friend at every stage</p>
              </div>
              <div className="pal__body">
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
              </div>
            </div>
          </section>

          <section className="side-card standard">
            <div className="side-card__inner" style={{ gap: 20, width: 295 }}>
              <div className="side-card__heading" style={{ gap: 5, width: 211 }}>
                <h3>Set Your Standard</h3>
                <p>Unlocks in {project.daysTillSubmission} days</p>
              </div>
              <div className="standard__body">
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
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}
