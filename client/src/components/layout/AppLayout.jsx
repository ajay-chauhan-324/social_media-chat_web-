import { useState, Suspense } from 'react';
import { Outlet, useNavigate, useMatch, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useDispatch } from 'react-redux';
import { FiSearch, FiLogOut, FiX } from 'react-icons/fi';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileNav from './MobileNav';
import Avatar from '@/components/ui/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { logoutThunk } from '@/features/auth/authSlice';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // An open conversation is an immersive full-screen view on mobile: hide the
  // app header + bottom nav so the chat (with its own header) owns the screen
  // and the composer isn't covered. No effect on desktop (sidebar layout).
  const inThread = Boolean(useMatch('/app/messages/:conversationId'));
  const location = useLocation();

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
        {/* Desktop top bar (mobile uses <MobileHeader/> below) */}
        <header className="sticky top-0 z-30 hidden h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur-xl lg:flex">
          <form onSubmit={submitSearch} className="relative max-w-md flex-1">
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
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
              <FiLogOut size={18} />
            </Button>
            <Avatar src={user?.avatar} name={user?.name} size="sm" ring />
          </div>
        </header>

        {/* Mobile header — sticky, blurred, hides on scroll (hidden in a thread) */}
        {!inThread && <MobileHeader onOpenMenu={() => setMobileOpen(true)} />}

        {/* pb clears the fixed bottom nav (+ iOS home bar) on mobile only */}
        <main
          className={cn(
            'flex-1',
            !inThread && 'pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0'
          )}
        >
          {/* Inner Suspense keeps the nav/header on screen while a lazy page
              chunk loads; the keyed fade gives a smooth page transition.
              Opacity-only so it never creates a containing block that would
              break sticky headers inside pages. */}
          <Suspense
            fallback={
              <div className="grid min-h-[60vh] place-items-center">
                <Spinner size={26} className="text-brand-600" />
              </div>
            }
          >
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </Suspense>
        </main>
      </div>

      {/* Instagram-style bottom navigation (mobile only, hidden in a thread) */}
      {!inThread && <MobileNav />}
    </div>
  );
}
