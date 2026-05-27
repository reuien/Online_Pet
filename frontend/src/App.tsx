import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { PixelButton } from '@pxlkit/ui-kit'
import { PxlKitIcon } from '@pxlkit/core'
import { Home, ArrowRight } from '@pxlkit/ui'
import HomeView from './views/HomeView'
import CreatePetView from './views/CreatePetView'
import PetDetailView from './views/PetDetailView'

function Nav() {
  const loc = useLocation()
  return (
    <nav className="flex gap-4 p-6 border-b-2 border-neutral-700">
      <Link to="/">
        <PixelButton
          tone={loc.pathname === '/' ? 'gold' : 'neutral'}
          variant="ghost"
          iconLeft={<PxlKitIcon icon={Home} size={20} />}
        >
          宠物广场
        </PixelButton>
      </Link>
      <Link to="/create">
        <PixelButton
          tone={loc.pathname === '/create' ? 'gold' : 'neutral'}
          variant="ghost"
          iconLeft={<PxlKitIcon icon={ArrowRight} size={20} />}
        >
          创建宠物
        </PixelButton>
      </Link>
    </nav>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-[#2d2d2d]">
      <div className="max-w-4xl mx-auto">
        <Nav />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/create" element={<CreatePetView />} />
            <Route path="/pet/:id" element={<PetDetailView />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
