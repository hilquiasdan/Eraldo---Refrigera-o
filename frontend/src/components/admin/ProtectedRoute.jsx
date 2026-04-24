import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace/>;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/admin" replace/>;
  }

  return children;
}
