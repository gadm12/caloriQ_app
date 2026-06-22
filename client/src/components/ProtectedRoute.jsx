import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined text-primary text-[48px] animate-spin">
          progress_activity
        </span>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  return children
}
