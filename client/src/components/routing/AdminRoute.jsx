import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PageLoader from '@/components/ui/PageLoader';

/** Requires an authenticated admin; bounces everyone else. */
export default function AdminRoute() {
  const { isAuthenticated, bootstrapped, user } = useAuth();
  if (!bootstrapped) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/app" replace />;
  return <Outlet />;
}
