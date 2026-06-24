import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import SignInSignUp from './pages/SignInSignUp'
import Logout from './pages/Logout'
import Home from './pages/Home'
import DailyLog from './pages/DailyLog'
import SearchFood from './pages/SearchFood'
import Dashboard from './pages/Dashboard'
import Progress from './pages/Progress'
import GoalSettings from './pages/GoalSettings'
import Profile from './pages/Profile'
import ContactUs from './pages/ContactUs'
import Donate from './pages/Donate'
import DocsPage from './pages/DocsPage'
import ErrorPage from './pages/ErrorPage'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <SignInSignUp />} />
      <Route path="/logout" element={<Logout />} />

      {/* Protected — all share the Layout shell */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/home"       element={<Home />} />
        <Route path="/log"        element={<DailyLog />} />
        <Route path="/log/search" element={<SearchFood />} />
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/progress"   element={<Progress />} />
        <Route path="/goals"      element={<GoalSettings />} />
        <Route path="/profile"    element={<Profile />} />
        <Route path="/contact"    element={<ContactUs />} />
        <Route path="/donate"     element={<Donate />} />
        <Route path="/docs"       element={<DocsPage />} />
      </Route>

      {/* Error / 404 */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}
