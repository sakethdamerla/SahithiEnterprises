import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminGuard component that protects admin routes
 * Redirects unauthorized users to the admin login page
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 */
export function AdminGuard({ children }) {
  const { isAdmin } = useAuth();

  // If user is not an admin, redirect to login page
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // If user is admin, render the protected content
  return children;
}
