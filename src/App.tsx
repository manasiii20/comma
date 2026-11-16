import HomeScreen from './screens/HomeScreen'
import ProjectScreen from './screens/ProjectScreen'
import { TooltipLayer } from './components/TooltipLayer'
import { useHashRoute } from './hooks/useHashRoute'

export default function App() {
  const route = useHashRoute()
  const screen =
    route === '/project/system-design' ? (
      <ProjectScreen view="overview" />
    ) : route === '/project/system-design/analysis' ? (
      <ProjectScreen view="analysis" />
    ) : (
      <HomeScreen />
    )
  return (
    <>
      {screen}
      <TooltipLayer />
    </>
  )
}
