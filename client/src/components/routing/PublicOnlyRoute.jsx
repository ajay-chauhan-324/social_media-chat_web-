import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PageLoader from '@/components/ui/PageLoader';

/** For auth pages (login/register) — redirects already-authenticated users into the app. */
export default function PublicOnlyRoute() {
  const { isAuthenticated, bootstrapped } = useAuth();
  if (!bootstrapped) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <Outlet />;
}
