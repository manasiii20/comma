import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import { project, type ActivityItem, type AvatarKey, type Task } from '../data/project'
import { reflectionColors, reflectionQuestions, taskMeta } from '../data/analysis'
import arrowPrev from '../assets/figma/analysis/arrow-prev.svg'
import arrowNext from '../assets/figma/analysis/arrow-next.svg'
import { timeAgo } from '../utils/time'
import './AnalysisView.css'

type Props = {
  tasks: Task[]
  activity: ActivityItem[]
  query: string
}

export function AnalysisView({ tasks, activity, query }: Props) {
  const q = query.trim().toLowerCase()
  const matches = (t: Task) => t.label.toLowerCase().includes(q)
  const order = (t: Task) => taskMeta[t.id]?.order ?? 99
  const done = tasks.filter((t) => t.done)
  const upcoming = tasks.filter((t) => !t.done).sort((a, b) => order(a) - order(b))

  return (
    <>
      <div className="analysis-top">
        <Reflection />
        <section className="card astats">
          <h2 className="card__title">Project Stats</h2>
          <div className="astats__tiles">
            <div className="stat stat--number">
              <strong>{project.hoursSpent}</strong>
              <span>hours spent working</span>
            </div>
            <div className="stat stat--number">
              <strong>{project.daysTillSubmission}</strong>
              <span>days till submission</span>
            </div>
            <div className="stat stat--number">
              <strong>{upcoming.length}</strong>
              <span>overall tasks left</span>
            </div>
          </div>
          <h3 className="astats__subhead">Recent Activity</h3>
          <div className="astats__recent">
            {activity.slice(0, 2).map((item) => (
              <div key={item.id} className="recent">
                <Avatar who={item.avatar} size={32} />
                <div className="recent__text">
                  <div className="recent__top">
                    <strong>{item.title}</strong>
                    {timeAgo(item) && <span className="recent__ago">{timeAgo(item)}</span>}
                  </div>
                  <span className="recent__detail">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card work">
        <div className="work__col">
          <div className="work__head">
            <h2 className="card__title">Completed Work Analysis</h2>
            <span className="work__count work__count--done">{plural(done.length, 'task')} done</span>
          </div>
          <div className="work__list">
            {done.filter(matches).map((t) => (
              <WorkItem key={t.id} task={t} />
            ))}
            {done.length === 0 && <p className="work__empty">Nothing completed yet. Tick tasks off in the checklist.</p>}
          </div>
        </div>
        <div className="work__col work__col--upcoming">
          <div className="work__head">
            <h2 className="card__title">Upcoming Task Line-Up</h2>
            <span className="work__count work__count--ahead">{plural(upcoming.length, 'task')} ahead</span>
          </div>
          <div className="work__list">
            {upcoming.filter(matches).map((t) => (
              <WorkItem key={t.id} task={t} />
            ))}
            {upcoming.length === 0 && <p className="work__empty">All caught up.</p>}
          </div>
        </div>
      </section>
    </>
  )
}

function Reflection() {
  // Start on the question shown in the Figma frame (2 of n).
  const [index, setIndex] = useState(1)
  const total = reflectionQuestions.length
  const q = reflectionQuestions[index]

  return (
    <section className="card reflection">
      <div className="reflection__head">
        <h2 className="card__title">Post Game Reflection</h2>
        <span className="reflection__count" aria-live="polite">
          {index + 1} of {total}
        </span>
      </div>
      <div className="reflection__box" key={index}>
        <div className="reflection__question">
          <p>{q.question}</p>
          <span>{q.hint}</span>
        </div>
        <div className="reflection__metrics">
          {q.metrics.map((m, i) => (
            <div key={m.label} className="metric">
              <Ring value={m.value} color={reflectionColors[i]} />
              <span className="metric__label">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="reflection__nav">
        <button
          type="button"
          onClick={() => setIndex((i) => i - 1)}
          disabled={index === 0}
          aria-label="Previous question"
        >
          <img src={arrowPrev} alt="" width={24} height={24} />
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => i + 1)}
          disabled={index === total - 1}
          aria-label="Next question"
        >
          <img src={arrowNext} alt="" width={24} height={24} />
        </button>
      </div>
    </section>
  )
}

// Same geometry as the Figma rings: 52px, 5px track, arc starting at 3 o'clock and running clockwise.
function Ring({ value, color }: { value: number; color: string }) {
  const r = 23.5
  const c = 2 * Math.PI * r
  return (
    <span className="ring-meter">
      <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r={r} fill="none" stroke="#383838" strokeWidth="5" />
        <circle
          className="ring-meter__arc"
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${(c * value) / 100} ${c}`}
        />
      </svg>
      <span className="ring-meter__value">{value}%</span>
    </span>
  )
}

const tagClass = {
  'Research Models': 'tag--research',
  'Solution Ideation': 'tag--ideation',
} as const

function WorkItem({ task }: { task: Task }) {
  const meta = taskMeta[task.id]
  const members: AvatarKey[] = meta?.members ?? ['aanya']
  return (
    <article className="work-item">
      <h3>{task.label}</h3>
      <div className="work-item__row">
        <div className="work-item__info">
          {meta && (
            <div className="work-item__tags">
              <span className={`tag ${tagClass[meta.phase]}`}>{meta.phase}</span>
              {task.done ? (
                <span className={`tag tag--impact-${meta.weight.toLowerCase()}`}>{meta.weight} Impact</span>
              ) : (
                <span className={`tag tag--priority-${meta.weight.toLowerCase()}`}>{meta.weight} Priority</span>
              )}
              {task.done
                ? meta.ago && <span className="tag tag--plain">{meta.ago}</span>
                : meta.estimate && <span className="tag tag--estimate">{meta.estimate}</span>}
            </div>
          )}
          <p>{meta?.note ?? 'Added from the checklist'}</p>
        </div>
        <div className="work-item__people">
          {members.map((m) => (
            <Avatar key={m} who={m} size={28} />
          ))}
        </div>
      </div>
    </article>
  )
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}
