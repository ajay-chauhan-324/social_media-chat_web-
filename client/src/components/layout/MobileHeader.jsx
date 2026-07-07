import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBell, FiSettings } from 'react-icons/fi';
import Logo from '@/components/ui/Logo';
import Avatar from '@/components/ui/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import useHideOnScroll from '@/hooks/useHideOnScroll';
import { useNavBadges } from '@/hooks/useNavBadges';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

/**
 * Instagram-style mobile header (hidden on lg+ where the desktop top bar
 * takes over). Sticky + blurred, slides up out of the way when scrolling
 * down and returns on scroll up. Left: logo. Right: notifications (with
 * badge), theme toggle, settings, and the avatar which opens the overflow
 * drawer (Explore, Bookmarks, AI Studio, admin, log out).
 */

const ICON_BTN =
  'grid h-10 w-10 place-items-center rounded-xl text-content transition hover:bg-surface-2';

export default function MobileHeader({ onOpenMenu }) {
  const hidden = useHideOnScroll();
  const { unreadNotifications } = useNavBadges();
  const { user } = useAuth();

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden ? '-100%' : 0 }}
      transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface/80 px-3 backdrop-blur-xl lg:hidden"
    >
      <Logo to="/app" />

      <div className="flex items-center gap-0.5">
        <NavLink to="/app/notifications" aria-label="Notifications" className={cn(ICON_BTN, 'relative')}>
          <FiBell size={20} />
          {unreadNotifications > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface">
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </span>
          )}
        </NavLink>

        <ThemeToggle className="h-10 w-10 border-0 bg-transparent hover:bg-surface-2" />

        <NavLink to="/app/settings" aria-label="Settings" className={ICON_BTN}>
          <FiSettings size={20} />
        </NavLink>

        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="ml-0.5 rounded-full transition active:scale-95"
        >
          <Avatar src={user?.avatar} name={user?.name} size="sm" ring />
        </button>
      </div>
    </motion.header>
  );
}
