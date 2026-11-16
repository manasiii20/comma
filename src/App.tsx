import HomeScreen from './screens/HomeScreen'
import ProjectScreen from './screens/ProjectScreen'
import { useHashRoute } from './hooks/useHashRoute'

// Tooltips are paused for now: elements keep their data-tip text, and mounting
// <TooltipLayer /> from './components/TooltipLayer' here turns them back on.
export default function App() {
  const route = useHashRoute()
  if (route === '/project/system-design') return <ProjectScreen view="overview" />
  if (route === '/project/system-design/analysis') return <ProjectScreen view="analysis" />
  return <HomeScreen />
}
