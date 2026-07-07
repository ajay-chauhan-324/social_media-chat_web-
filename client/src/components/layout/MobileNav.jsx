import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiSearch, FiPlus, FiMessageCircle, FiUser } from 'react-icons/fi';
import CreatePostSheet from '@/components/feed/CreatePostSheet';
import { useNavBadges } from '@/hooks/useNavBadges';
import { cn } from '@/lib/cn';

/**
 * Instagram-style bottom navigation for mobile (hidden on lg+ where the
 * desktop Sidebar takes over). Blurred glass bar, animated active indicator,
 * unread badge on Chats, and iOS safe-area padding so it clears the home bar.
 */

const TABS = [
  { to: '/app', label: 'Home', icon: FiHome, end: true },
  { to: '/app/search', label: 'Search', icon: FiSearch },
  { type: 'create' },
  { to: '/app/messages', label: 'Chats', icon: FiMessageCircle, badge: 'messages' },
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

function CreateButton({ onClick }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <button
        type="button"
        onClick={onClick}
        aria-label="Create post"
        className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow transition-transform active:scale-90"
      >
        <FiPlus size={24} strokeWidth={2.6} />
      </button>
    </div>
  );
}

export default function MobileNav() {
  const [createOpen, setCreateOpen] = useState(false);
  const { unreadMessages } = useNavBadges();

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-1">
          {TABS.map((tab, i) =>
            tab.type === 'create' ? (
              <CreateButton key="create" onClick={() => setCreateOpen(true)} />
            ) : (
              <TabLink
                key={tab.to}
                {...tab}
                badge={tab.badge === 'messages' ? unreadMessages : 0}
              />
            )
          )}
        </div>
      </nav>

      <CreatePostSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
