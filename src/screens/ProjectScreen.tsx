import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
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
import { BreakToast, BreaksDialog } from '../components/MayloBreaks'
import { breakLabel, type BreakSettings } from '../utils/breaks'
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
import checkOn from '../assets/figma/check-on.svg'
import plusIcon from '../assets/figma/plus.svg'
import messageIcon from '../assets/icons/message.svg'
import trashIcon from '../assets/icons/trash.svg'
import { timeAgo, timeAgoLong } from '../utils/time'
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
  avatarGap: number
  avatars: AvatarKey[]
}[] = [
  { name: 'Problem Framing', progress: 100, designLeft: 43, designWidth: 114, designFill: 114, top: 41, track: 'rgba(100,196,226,0.88)', fill: 'rgba(100,196,226,0.88)', pill: '#b2e3f3', avatarGap: 14, avatars: ['shreya', 'aanya'] },
  { name: 'Research Models', progress: 95, designLeft: 141, designWidth: 134, designFill: 117, top: 93, track: 'rgba(229,195,249,0.54)', fill: 'rgba(229,195,249,0.81)', pill: '#f8edfe', avatarGap: 23, avatars: ['shreya', 'krisha'] },
  { name: 'Solution Ideation', progress: 65, designLeft: 228, designWidth: 118, designFill: 80, top: 145, track: 'rgba(241,165,165,0.62)', fill: 'rgba(241,165,165,0.88)', pill: '#ffdbdb', avatarGap: 7, avatars: ['dhruv'] },
  { name: 'Prototyping', progress: 15, designLeft: 322, designWidth: 91, designFill: 38, top: 197, track: 'rgba(249,243,151,0.6)', fill: '#efea92', pill: '#fffcca', avatarGap: 0, avatars: [] },
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

const memberNamesFull: Record<AvatarKey, string> = {
  aanya: 'Aanya Arora',
  shreya: 'Shreya Jain',
  dhruv: 'Dhruv Shah',
  krisha: 'Krisha Singh',
}
const memberLabel = (who: AvatarKey) => (who === 'aanya' ? `${memberNamesFull[who]} (you)` : memberNamesFull[who])

const statusHints: Record<string, string> = {
  Active: 'Available right now',
  Away: 'Not at their desk',
  Busy: 'Heads down, reply may be slow',
}

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

  const deleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    setTasks((prev) => prev.filter((t) => t.id !== id))
    logActivity('Task Removed', task.label)
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

  // Maylo's break reminders: saved settings plus the time the next break is due.
  const [breaks, setBreaks] = usePersistentState<BreakSettings | null>('queue2.breaks', null)
  const [nextBreakAt, setNextBreakAt] = usePersistentState<number | null>('queue2.nextBreakAt', null)
  const [breaksOpen, setBreaksOpen] = useState(false)
  const [breakDue, setBreakDue] = useState(false)

  useEffect(() => {
    if (!breaks || !nextBreakAt) return
    const check = () => setBreakDue(Date.now() >= nextBreakAt)
    check()
    const id = window.setInterval(check, 15000)
    return () => window.clearInterval(id)
  }, [breaks, nextBreakAt])

  const saveBreaks = (value: BreakSettings | null) => {
    setBreaks(value)
    setNextBreakAt(value ? Date.now() + value.every * 60000 : null)
    setBreakDue(false)
    setBreaksOpen(false)
    logActivity('Breaks Updated', value ? breakLabel(value) : 'Reminders off')
  }

  const takeBreak = () => {
    if (!breaks) return
    setNextBreakAt(Date.now() + (breaks.length + breaks.every) * 60000)
    setBreakDue(false)
    logActivity('Break Taken', `${breaks.length} minute break`)
  }

  const snoozeBreak = () => {
    setNextBreakAt(Date.now() + 5 * 60000)
    setBreakDue(false)
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
                  data-tip={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  {icon}
                </a>
              ) : (
                <button key={item.id} className={className} aria-label={item.label} data-tip={item.label} data-tip-detail="Coming soon">
                  {icon}
                </button>
              )
            })}
          </nav>
        </div>
        <div className="sidebar__bottom">
          <a className="nav-item" href="#/" aria-label="Log out" data-tip="Log out" data-tip-detail="Back to all projects">
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
            </div>
            <div className="overview__stats">
              <div className="stat" data-tip="Project progress" data-tip-detail={`${project.completion}% of the planned work is done`} tabIndex={0}>
                <div className="ring">
                  <img src={ring78} alt="" />
                  <span>{project.completion}%</span>
                </div>
              </div>
              <div className="stat stat--number" data-tip="Time invested" data-tip-detail="Total hours the team has logged" tabIndex={0}>
                <strong>{project.hoursSpent}</strong>
                <span>hours spent working</span>
              </div>
              <div className="stat stat--number" data-tip="Deadline" data-tip-detail="Days left until submission" tabIndex={0}>
                <strong>{project.daysTillSubmission}</strong>
                <span>days till submission</span>
              </div>
              <div className="stat stat--team">
                <div className="team-grid">
                  {(['dhruv', 'aanya', 'krisha', 'shreya'] as const).map((who) => (
                    <span key={who} className="tip-target" data-tip={memberLabel(who)}>
                      <Avatar who={who} size={40} />
                    </span>
                  ))}
                </div>
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
            </div>
            <div className="activity__body">
              <ul className="activity__feed">
                {activity.slice(0, 2).map((item) => (
                  <li
                    key={item.id}
                    className="feed-item"
                    data-tip={item.title}
                    data-tip-detail={[item.detail, timeAgoLong(item)].filter(Boolean).join(' · ')}
                  >
                    <Avatar who={item.avatar} size={40} />
                    <div className="feed-item__text">
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </div>
                    {timeAgo(item) && (
                      <span className="feed-item__ago">
                        {timeAgo(item)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="activity__side">
                <div className="panel quick-actions" role="group" aria-label="Quick actions">
                  <div className="quick-actions__row">
                    <a className="qa" href={project.gameUrl} target="_blank" rel="noreferrer" data-tip="Take a break" data-tip-detail="Opens a quick game in a new tab">
                      <span className="qa__icon">
                        <span className="qa__game">
                          <img src={qaGame} alt="" />
                          <img className="qa__play" src={playTriangle} alt="" />
                        </span>
                      </span>
                      Game
                    </a>
                    <button className="qa" onClick={startAddingTask} data-tip="New task" data-tip-detail="Add a task to the checklist">
                      <span className="qa__icon">
                        <Icon src={qaTask} width={18} />
                      </span>
                      Task
                    </button>
                    <a className="qa" href={viewHref('analysis')} data-tip="Analysis" data-tip-detail="Reflection, stats and task line-up">
                      <span className="qa__icon">
                        <Icon src={qaAnalysis} width={18} />
                      </span>
                      Analysis
                    </a>
                  </div>
                </div>
                <div className="panel project-stats" role="group" aria-label="Project stats">
                  <div className="project-stats__rows">
                    <div data-tip="Your hours" data-tip-detail="Time you have logged on this project">
                      <span>Individual Work Hours</span>
                      <strong>{project.individualHours} hours</strong>
                    </div>
                    <div data-tip="Team hours" data-tip-detail="Time logged by the whole team">
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
                <li key={task.id} className="task-row">
                  <button
                    className={`task ${task.done ? 'task--done' : ''}`}
                    onClick={() => toggleTask(task.id)}
                    role="checkbox"
                    aria-checked={task.done}
                  >
                    {task.done ? <Icon src={checkOn} width={16} /> : <span className="task__box" />}
                    <span className="task__label">{task.label}</span>
                  </button>
                  <button
                    className="task__delete"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.label}`}
                    data-tip="Delete task"
                  >
                    <img src={trashIcon} alt="" width={16} height={16} />
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
                  data-tip={d === submissionDay ? 'Submission deadline' : undefined}
                  data-tip-detail={d === submissionDay ? `Due on the ${d}th` : undefined}
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
                  data-tip={bar.name}
                  data-tip-detail={`${bar.progress}% complete`}
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
                    <span className="bar__pill" style={{ background: bar.pill }}>
                      {bar.progress}%
                    </span>
                    {bar.avatars.length > 0 && (
                      <span className="bar__avatars" style={{ marginLeft: bar.avatarGap }}>
                        {bar.avatars.map((a) => (
                          <span key={a} className="tip-target" data-tip={memberLabel(a)}>
                            <Avatar who={a} size={22} />
                          </span>
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
                  <span className="tip-target" data-tip={m.name} data-tip-detail={m.role}>
                    <Avatar who={m.avatar} size={44} />
                  </span>
                  <div className="member__text">
                    <strong>{m.name}</strong>
                    <span>{m.role}</span>
                  </div>
                  <span className={`status status--${m.status.toLowerCase()}`} data-tip={m.status} data-tip-detail={statusHints[m.status]}>
                    {m.status}
                  </span>
                </li>
              ))}
            </ul>
            <div className="btn btn--wide btn--message" onClick={messaging ? undefined : () => setMessaging(true)}>
              <span className="btn__icon" style={{ width: 30, height: 30, borderRadius: 6 }}>
                <img src={messageIcon} alt="" width={18} height={18} />
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
            <button
              type="button"
              className={`maylo__breaks${breaks ? ' maylo__breaks--on' : ''}`}
              onClick={() => setBreaksOpen(true)}
              aria-haspopup="dialog"
            >
              <span className="maylo__breaks-icon">
                <Icon src={calendarSmall} width={11} height={13} />
              </span>
              {breaks ? breakLabel(breaks) : 'Set Breaks for Maylo'}
            </button>
          </section>
        ) : (
        <section className="side-card pal">
          <div className="side-card__heading">
            <h3>Make Your Own Pal</h3>
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
          </div>
          <div className="standard__locked">
            <p>
              Aim to create and execute solutions truly helpful and useful to the user in context, and keep the
              people we design for at the centre of every decision.
            </p>
            <button
              className={`standard__lock ${lockNudge ? 'is-nudging' : ''}`}
              onClick={nudgeLock}
              aria-label={`Locked, unlocks in ${project.daysTillSubmission} days`}
              data-tip="Locked"
              data-tip-detail={`Unlocks in ${project.daysTillSubmission} days, after submission`}
            >
              <Icon src={lockIcon} width={13} height={16.25} />
            </button>
          </div>
          <p className="standard__note">
            Your goal for the project is set. Look back at your initial set goal once the project is over.
          </p>
        </section>
      </aside>

      <BreaksDialog open={breaksOpen} value={breaks} onSave={saveBreaks} onClose={() => setBreaksOpen(false)} />
      {breaks && breakDue && <BreakToast length={breaks.length} onTake={takeBreak} onSnooze={snoozeBreak} />}
    </div>
  )
}
