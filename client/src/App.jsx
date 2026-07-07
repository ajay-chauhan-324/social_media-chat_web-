import { lazy, Suspense, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import ErrorBoundary from '@/components/ErrorBoundary';
import OfflineBanner from '@/components/ui/OfflineBanner';
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import PublicOnlyRoute from '@/components/routing/PublicOnlyRoute';
import AdminRoute from '@/components/routing/AdminRoute';
import AppLayout from '@/components/layout/AppLayout';
import PageLoader from '@/components/ui/PageLoader';
import { queryClient } from '@/lib/queryClient';
import { bootstrapAuth, forceLogout } from '@/features/auth/authSlice';

// Route-level code splitting
const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));
const Home = lazy(() => import('@/pages/app/Home'));
const Explore = lazy(() => import('@/pages/app/Explore'));
const Profile = lazy(() => import('@/pages/app/Profile'));
const PostDetail = lazy(() => import('@/pages/app/PostDetail'));
const Bookmarks = lazy(() => import('@/pages/app/Bookmarks'));
const HashtagFeed = lazy(() => import('@/pages/app/HashtagFeed'));
const Messages = lazy(() => import('@/pages/app/Messages'));
const Notifications = lazy(() => import('@/pages/app/Notifications'));
const Search = lazy(() => import('@/pages/app/Search'));
const ComingSoon = lazy(() => import('@/pages/app/ComingSoon'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminPosts = lazy(() => import('@/pages/admin/AdminPosts'));
const AdminComments = lazy(() => import('@/pages/admin/AdminComments'));
const AdminReports = lazy(() => import('@/pages/admin/AdminReports'));

export default function App() {
  const dispatch = useDispatch();
  const bootstrapped = useRef(false);

  // Attempt silent login on boot — guarded so StrictMode's double-invoke
  // (and any remount) can't fire two concurrent refresh calls that race
  // over the same rotating refresh-token cookie.
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    dispatch(bootstrapAuth());
  }, [dispatch]);

  // React to forced logout emitted by the axios refresh interceptor:
  // clear auth state AND the cached server data (prevents stale data leaking
  // into the next session).
  useEffect(() => {
    const handler = () => {
      dispatch(forceLogout());
      queryClient.clear();
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <OfflineBanner />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />

            {/* Auth (redirect away if already signed in) */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected app */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="explore" element={<Explore />} />
                <Route path="search" element={<Search />} />
                <Route path="bookmarks" element={<Bookmarks />} />
                <Route path="post/:id" element={<PostDetail />} />
                <Route path="hashtag/:tag" element={<HashtagFeed />} />
                <Route path="profile" element={<Profile />} />
                <Route path="profile/:username" element={<Profile />} />
                <Route path="messages" element={<Messages />} />
                <Route path="messages/:conversationId" element={<Messages />} />
                <Route path="notifications" element={<Notifications />} />
                <Route
                  path="settings"
                  element={<ComingSoon title="Settings" description="Account, appearance, privacy, and notification settings are coming soon." />}
                />
              </Route>
            </Route>

            {/* Admin (admin role only) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="comments" element={<AdminComments />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>
            </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
