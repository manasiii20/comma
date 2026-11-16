import type { ActivityItem } from '../data/project'

// Short "how long ago" label: logged items use their timestamp, built-in ones a fixed label.
export function timeAgo(item: ActivityItem): string | undefined {
  if (!item.at) return item.ago
  const mins = Math.max(1, Math.round((Date.now() - item.at) / 60000))
  if (mins < 60) return `${mins}m`
  const hours = Math.round(mins / 60)
  return hours < 24 ? `${hours}h` : `${Math.round(hours / 24)}d`
}

export function timeAgoLong(item: ActivityItem): string | undefined {
  const short = timeAgo(item)
  if (!short) return undefined
  const n = parseInt(short, 10)
  const unit = short.endsWith('m') ? 'minute' : short.endsWith('h') ? 'hour' : 'day'
  return `${n} ${unit}${n === 1 ? '' : 's'} ago`
}
