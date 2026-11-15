import type { AvatarKey } from './project'

export type ProjectStep = { label: string; done: boolean }

export type ProjectSummary = {
  id: string
  name: string
  credits: number
  stage: 'Testing' | 'Research'
  progress: number
  // Share of the bar that is filled, as drawn in Figma (it does not track `progress` exactly).
  barFill: number
  flag: 'thin' | 'bold'
  steps: ProjectStep[]
  priority: string
  status: string
  members: AvatarKey[]
  // Hash route of the project's dashboard, when it has one.
  href?: string
}

export const projects: ProjectSummary[] = [
  {
    id: 'system-design',
    name: 'System Design',
    credits: 4,
    stage: 'Testing',
    progress: 78,
    barFill: 93 / 128,
    flag: 'thin',
    steps: [
      { label: 'Problem Framing', done: true },
      { label: 'Research', done: true },
      { label: 'Solution Brainstorming', done: true },
      { label: 'Prototyping & User Testing', done: false },
    ],
    priority: 'Urgent',
    status: 'In Progress',
    members: ['dhruv', 'shreya', 'krisha', 'aanya'],
    href: '#/project/system-design',
  },
  {
    id: 'design-theory',
    name: 'Design Theory',
    credits: 2,
    stage: 'Research',
    progress: 45,
    barFill: 55 / 128,
    flag: 'bold',
    steps: [
      { label: 'Reading List', done: true },
      { label: 'Concept Notes', done: true },
      { label: 'Research', done: false },
      { label: 'Theory Essay', done: false },
    ],
    priority: 'Moderate',
    status: 'In Progress',
    members: ['dhruv', 'aanya'],
  },
]

export const memberNames: Record<AvatarKey, string> = {
  dhruv: 'Dhruv',
  shreya: 'Shreya',
  krisha: 'Krisha',
  aanya: 'Aanya',
}
