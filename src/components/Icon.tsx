import type { CSSProperties } from 'react'

export function Icon({ src, width, height, style }: { src: string; width: number; height?: number; style?: CSSProperties }) {
  return (
    <span className="icon" style={{ width, height: height ?? width, ...style }}>
      <img src={src} alt="" />
    </span>
  )
}
