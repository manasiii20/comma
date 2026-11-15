import HomeScreen from './screens/HomeScreen'
import ProjectScreen from './screens/ProjectScreen'
import { useHashRoute } from './hooks/useHashRoute'

export default function App() {
  const route = useHashRoute()
  if (route === '/project/system-design') return <ProjectScreen />
  return <HomeScreen />
}
