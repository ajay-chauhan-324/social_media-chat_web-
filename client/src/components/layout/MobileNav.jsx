import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiSearch, FiMessageCircle, FiBell, FiUser } from 'react-icons/fi';
import { useNavBadges } from '@/hooks/useNavBadges';
import { cn } from '@/lib/cn';

/**
 * Instagram-style bottom navigation for mobile (hidden on lg+ where the
 * desktop Sidebar takes over). Blurred glass bar, animated active indicator,
 * unread badges, and iOS safe-area padding so it clears the home bar.
 */

const TABS = [
  { to: '/app', label: 'Home', icon: FiHome, end: true },
  { to: '/app/search', label: 'Search', icon: FiSearch },
  { to: '/app/messages', label: 'Chats', icon: FiMessageCircle, badge: 'messages' },
  { to: '/app/notifications', label: 'Notifications', icon: FiBell, badge: 'notifications' },
  { to: '/app/profile', label: 'Profile', icon: FiUser, end: true },
];

function TabLink({ to, label, icon: Icon, end, badge = 0 }) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className="group relative flex flex-1 items-center justify-center"
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="bottomnav-indicator"
              className="absolute top-0 h-0.5 w-9 rounded-full bg-brand-gradient"
              transition={{ type: 'spring', stiffness: 500, damping: 34 }}
            />
          )}
          <span className="relative">
            <Icon
              size={25}
              strokeWidth={isActive ? 2.6 : 2}
              className={cn(
                'transition-all duration-200',
                isActive ? 'scale-105 text-content' : 'text-muted group-active:scale-90'
              )}
            />
            {badge > 0 && (
              <span className="absolute -right-2 -top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function MobileNav() {
  const { unreadMessages, unreadNotifications } = useNavBadges();
  const badgeFor = (key) =>
    key === 'messages' ? unreadMessages : key === 'notifications' ? unreadNotifications : 0;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-1">
        {TABS.map((tab) => (
          <TabLink key={tab.to} {...tab} badge={badgeFor(tab.badge)} />
        ))}
      </div>
    </nav>
  );
}
