import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import { CostCalculationProvider } from './context/CostCalculationContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import SubprojectDetail from './pages/SubprojectDetail'
import Tasks from './pages/Tasks'
import Invoices from './pages/Invoices'
import LoadingSpinner from './components/LoadingSpinner'
import ConflictResolutionDialog from './components/ConflictResolutionDialog'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <CostCalculationProvider>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId" element={<ProjectDetail />} />
            <Route path="projects/:projectId/subprojects/:subprojectId" element={<SubprojectDetail />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
      <ConflictResolutionDialog />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </CostCalculationProvider>
  )
}

export default App 