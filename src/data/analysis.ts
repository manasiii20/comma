import type { AvatarKey } from './project'

// Extra detail shown for checklist tasks on the Analysis screen, keyed by task id (see initialTasks).
export type TaskMeta = {
  phase: 'Research Models' | 'Solution Ideation'
  weight: 'High' | 'Medium'
  // Shown on completed tasks ("3 hours ago") and upcoming ones ("Est. 10 hours").
  ago?: string
  estimate?: string
  note: string
  members: AvatarKey[]
  // Order in the Upcoming list (Figma lists the brainstorm first).
  order: number
}

export const taskMeta: Record<string, TaskMeta> = {
  t2: {
    phase: 'Research Models',
    weight: 'High',
    ago: '3 hours ago',
    note: 'Updated gigamap with current progress',
    members: ['dhruv', 'aanya'],
    order: 1,
  },
  t3: {
    phase: 'Research Models',
    weight: 'Medium',
    ago: '7 hours ago',
    note: 'Mapped events, patterns, structures and mental models',
    members: ['krisha', 'dhruv', 'shreya'],
    order: 2,
  },
  t5: {
    phase: 'Solution Ideation',
    weight: 'High',
    estimate: 'Est. 10 hours',
    note: 'Rapid brainstorming of solutions',
    members: ['aanya', 'krisha', 'dhruv', 'shreya'],
    order: 3,
  },
  t1: {
    phase: 'Research Models',
    weight: 'Medium',
    estimate: 'Est. 2 hours',
    note: 'In relation with Iceberg Model Sheet',
    members: ['krisha', 'shreya'],
    order: 4,
  },
  t4: {
    phase: 'Solution Ideation',
    weight: 'High',
    estimate: 'Est. 5 hours',
    note: 'Using leverage points to map where solutions emerge',
    members: ['aanya', 'dhruv', 'shreya'],
    order: 5,
  },
}

export type ReflectionQuestion = {
  question: string
  hint: string
  metrics: [{ label: string; value: number }, { label: string; value: number }, { label: string; value: number }]
}

// The second question is the one in the Figma frame; the others are placeholders to show the stepper working.
export const reflectionQuestions: ReflectionQuestion[] = [
  {
    question: 'How confident are you in the project direction?',
    hint: 'Your trust in the current approach',
    metrics: [
      { label: 'Research', value: 72 },
      { label: 'Ideas', value: 58 },
      { label: 'Self Doubt', value: 30 },
    ],
  },
  {
    question: 'How far through the project do you feel you are?',
    hint: 'Your perception of project completion',
    metrics: [
      { label: 'Individually', value: 64 },
      { label: 'Collaboratively', value: 82 },
      { label: 'Mental Burnout', value: 40 },
    ],
  },
  {
    question: 'How evenly is the work shared right now?',
    hint: 'Your sense of workload balance',
    metrics: [
      { label: 'Your Share', value: 55 },
      { label: 'Team Share', value: 70 },
      { label: 'Overload', value: 35 },
    ],
  },
  {
    question: 'How clear are the next steps?',
    hint: 'Clarity on what comes after this phase',
    metrics: [
      { label: 'Tasks', value: 80 },
      { label: 'Timeline', value: 66 },
      { label: 'Confusion', value: 25 },
    ],
  },
]

// Ring colours from the Figma frame, by position.
export const reflectionColors = ['#83acb9', '#86af76', '#a97373'] as const

export const mayloHealth = {
  workHours: '8 hours',
  focusMode: '2 hours',
  burnout: '4 of 10',
}
