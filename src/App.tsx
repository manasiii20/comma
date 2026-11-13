import { useEffect, useState } from 'react'
import ProjectScreen from './screens/ProjectScreen'

const DESIGN_W = 1920
const DESIGN_H = 1080
const GUTTER = 24

function useFitScale() {
  const compute = () =>
    Math.max(0.1, Math.min((window.innerWidth - GUTTER) / DESIGN_W, (window.innerHeight - GUTTER) / DESIGN_H))
  const [scale, setScale] = useState(compute)
  useEffect(() => {
    const onResize = () => setScale(compute())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return scale
}

export default function App() {
  const scale = useFitScale()
  return (
    <div className="stage">
      <div className="stage__frame" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <ProjectScreen />
      </div>
    </div>
  )
}
