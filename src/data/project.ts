export type AvatarKey = 'aanya' | 'shreya' | 'dhruv' | 'krisha'

export type Task = { id: string; label: string; done: boolean }

export type ActivityItem = { id: string; avatar: AvatarKey; title: string; detail: string }

export type TeamMember = {
  id: string
  name: string
  role: string
  status: 'Active' | 'Away' | 'Busy'
  avatar: AvatarKey
}

export type Phase = {
  id: string
  name: string
  color: string
  progress: number
  avatars: AvatarKey[]
}

export const project = {
  name: 'Queue2',
  subtitle: 'Design Ecosystem: Avni Sethi',
  completion: 78,
  hoursSpent: 30,
  daysTillSubmission: 6,
  individualHours: 5,
  teamHours: 18,
  gameUrl: 'https://manasiii20.github.io/CrashOut/',
}

export const user = { name: 'Aanya Arora', email: 'aanyarora@gmail.com' }

export const initialDescription =
  'Working on a system design project for our college stationery store for pintu bhaiya for 2 weeks'

export const initialTasks: Task[] = [
  { id: 't1', label: 'Leverage points sheet', done: false },
  { id: 't2', label: 'Finish gigamap', done: true },
  { id: 't3', label: 'Iceberg model sheet', done: true },
  { id: 't4', label: 'Sites of Intervention', done: false },
  { id: 't5', label: '20 ideas brainstorming', done: false },
]

export const initialActivity: ActivityItem[] = [
  { id: 'a1', avatar: 'dhruv', title: 'Task Completed', detail: 'Finished Gigamap' },
  { id: 'a2', avatar: 'aanya', title: 'File Updated', detail: 'Project Timeline' },
  { id: 'a3', avatar: 'shreya', title: 'New Comment', detail: 'Gigamap Feedback' },
]

export const team: TeamMember[] = [
  { id: 'm1', name: 'Shreya Jain', role: 'Research & Ethics', status: 'Active', avatar: 'shreya' },
  { id: 'm2', name: 'Dhruv Shah', role: 'Developer', status: 'Away', avatar: 'dhruv' },
  { id: 'm3', name: 'Krisha Singh', role: 'Project Manager', status: 'Busy', avatar: 'krisha' },
]

export const phases: Phase[] = [
  { id: 'p1', name: 'Problem Framing', color: 'rgba(100,196,226,0.88)', progress: 100, avatars: ['shreya', 'aanya'] },
  { id: 'p2', name: 'Research Models', color: '#d5b6e7', progress: 95, avatars: ['shreya', 'krisha'] },
  { id: 'p3', name: 'Solution Ideation', color: '#e8a0a0', progress: 65, avatars: ['dhruv'] },
  { id: 'p4', name: 'Prototyping', color: '#efea92', progress: 15, avatars: [] },
  { id: 'p5', name: 'User Testing', color: '#c7ebca', progress: 0, avatars: [] },
]

export const timelineDays = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28]
export const submissionDay = 28
