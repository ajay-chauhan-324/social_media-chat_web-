import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import {
  FiGrid,
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiFlag,
  FiMenu,
  FiArrowLeft,
  FiLogOut,
} from 'react-icons/fi';
import Logo from '@/components/ui/Logo';
import Avatar from '@/components/ui/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { logoutThunk } from '@/features/auth/authSlice';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/posts', label: 'Posts', icon: FiFileText },
  { to: '/admin/comments', label: 'Comments', icon: FiMessageSquare },
  { to: '/admin/reports', label: 'Reports', icon: FiFlag },
];

function NavItems({ onNavigate }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
              isActive ? 'bg-brand-600/10 text-brand-600' : 'text-muted hover:bg-surface-2 hover:text-content'
            )
          }
        >
          <Icon size={19} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarInner({ onNavigate }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-line bg-surface">
      <div className="flex h-16 items-center gap-2 px-5">
        <Logo to="/admin" withText={false} />
        <div>
          <p className="font-display text-sm font-extrabold text-content">Admin</p>
          <p className="text-xs text-muted">Control Center</p>
        </div>
      </div>
      <NavItems onNavigate={onNavigate} />
      <Link
        to="/app"
        className="m-3 flex items-center gap-2 rounded-xl border border-line px-3.5 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-content"
      >
        <FiArrowLeft size={16} /> Back to app
      </Link>
    </aside>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = async () => {
    await dispatch(logoutThunk());
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-surface-2">
      <div className="sticky top-0 hidden h-screen lg:block">
        <SidebarInner />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <SidebarInner onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur-xl">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-content lg:hidden"
            aria-label="Open menu"
          >
            <FiMenu />
          </button>
          <h1 className="font-display text-lg font-extrabold text-content">Admin Dashboard</h1>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={logout} title="Log out">
              <FiLogOut size={18} />
            </Button>
            <Avatar src={user?.avatar} name={user?.name} size="sm" ring />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
