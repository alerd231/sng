import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from './AdminAuthProvider'

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const location = useLocation()
  const { isAuthenticated, loading } = useAdminAuth()

  if (loading) {
    return (
      <main className="min-h-screen bg-graphite px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl border border-white/15 bg-black/25 p-8 text-sm text-white/70">
          Проверка сессии администратора...
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
