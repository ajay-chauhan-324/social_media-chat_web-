import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { FiMenu, FiSearch, FiLogOut, FiX } from 'react-icons/fi';
import Sidebar from './Sidebar';
import Avatar from '@/components/ui/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Button from '@/components/ui/Button';
import AIAssistant from '@/components/ai/AIAssistant';
import { useAuth } from '@/hooks/useAuth';
import { logoutThunk } from '@/features/auth/authSlice';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/');
  };

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(searchTerm.trim() ? `/app/search?q=${encodeURIComponent(searchTerm.trim())}` : '/app/search');
  };

  return (
    <div className="flex min-h-screen bg-surface-2">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
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
              <div className="relative h-full">
                <Sidebar onNavigate={() => setMobileOpen(false)} />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute -right-11 top-4 grid h-9 w-9 place-items-center rounded-lg bg-surface text-content"
                  aria-label="Close menu"
                >
                  <FiX />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur-xl">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-content lg:hidden"
            aria-label="Open menu"
          >
            <FiMenu />
          </button>

          <form onSubmit={submitSearch} className="relative hidden max-w-md flex-1 sm:block">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search people…"
              className="input-base h-10 pl-10"
              aria-label="Search people"
            />
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => navigate('/app/search')}
              title="Search"
              aria-label="Search"
            >
              <FiSearch size={18} />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
              <FiLogOut size={18} />
            </Button>
            <Avatar src={user?.avatar} name={user?.name} size="sm" ring />
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Floating AI assistant — available on every app page */}
      <AIAssistant />
    </div>
  );
}
