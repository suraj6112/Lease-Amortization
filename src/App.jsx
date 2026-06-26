import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { navigation } from './data/mockData'
import LeaseExtraction from './pages/LeaseExtraction'
import LoginPage from './pages/LoginPage'
import './App.css'

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem('lease_token')),
  )
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthExpired = () => {
      setIsAuthenticated(false)
      navigate('/login', { replace: true })
    }

    window.addEventListener('lease-auth-expired', handleAuthExpired)

    return () => {
      window.removeEventListener('lease-auth-expired', handleAuthExpired)
    }
  }, [navigate])

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/lease-extraction" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        element={
          <ProtectedShell
            isAuthenticated={isAuthenticated}
            onSignOut={() => {
              setIsAuthenticated(false)
              localStorage.removeItem("lease_token")
              navigate('/login', { replace: true })
            }}
          />
        }
      >
        <Route path="/lease-extraction" element={<LeaseExtraction />} />
      </Route>

      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/lease-extraction' : '/login'} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/lease-extraction' : '/login'} replace />}
      />
    </Routes>
  )
}

function ProtectedShell({ isAuthenticated, onSignOut }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const pageTitle =
    navigation.find((item) => item.path === location.pathname)?.label ?? 'Lease Extraction'

  return (
    <AppLayout
      pageTitle={pageTitle}
      sidebarOpen={sidebarOpen}
      onNavigate={() => setSidebarOpen(false)}
      onMenuOpen={() => setSidebarOpen(true)}
      onSidebarClose={() => setSidebarOpen(false)}
      onSignOut={onSignOut}
    >
      <Outlet />
    </AppLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
