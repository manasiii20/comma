import { useEffect, useState } from 'react'

export function usePersistentState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const fallback = () => (typeof initial === 'function' ? (initial as () => T)() : initial)
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : fallback()
    } catch {
      return fallback()
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable: state still works for this visit */
    }
  }, [key, value])

  return [value, setValue] as const
}
