import { Navigate, Outlet } from 'react-router-dom'

type UserRole = 'patient' | 'asha' | 'doctor'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const storedRole = localStorage.getItem('swasthone_role') as UserRole | null

  if (!storedRole) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(storedRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
