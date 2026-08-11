import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="w-6 h-6 border-2 border-border border-t-foreground rounded-full animate-spin"></div>
  </div>
);

// Wrap any route that requires an admin (you) — customers get bounced home.
export default function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return <Spinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
