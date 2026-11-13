import aanya from '../assets/figma/avatar-aanya.png'
import pink from '../assets/figma/memoji-pink.png'
import prokofiev from '../assets/figma/memoji-prokofiev.png'
import blue from '../assets/figma/memoji-blue.png'
import type { AvatarKey } from '../data/project'
import './Avatar.css'

export function Avatar({ who, size }: { who: AvatarKey; size: number }) {
  if (who === 'aanya') {
    return <img className="avatar avatar--photo" src={aanya} alt="" style={{ width: size, height: size }} />
  }
  return (
    <span className={`avatar avatar--${who}`} style={{ width: size, height: size }}>
      {who === 'krisha' ? (
        <span className="avatar__crop">
          <img src={pink} alt="" />
        </span>
      ) : (
        <img className="avatar__fill" src={who === 'shreya' ? prokofiev : blue} alt="" />
      )}
    </span>
  )
}
