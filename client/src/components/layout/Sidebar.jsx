import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiCompass,
  FiSearch,
  FiMessageCircle,
  FiBell,
  FiBookmark,
  FiUser,
  FiSettings,
  FiCpu,
  FiShield,
} from 'react-icons/fi';
import Logo from '@/components/ui/Logo';
import { cn } from '@/lib/cn';
import { useNavBadges } from '@/hooks/useNavBadges';
import { useAuth } from '@/hooks/useAuth';

const NAV = [
  { to: '/app', label: 'Home', icon: FiHome, end: true },
  { to: '/app/explore', label: 'Explore', icon: FiCompass },
  { to: '/app/search', label: 'Search', icon: FiSearch },
  { to: '/app/messages', label: 'Messages', icon: FiMessageCircle, badge: 'messages' },
  { to: '/app/notifications', label: 'Notifications', icon: FiBell, badge: 'notifications' },
  { to: '/app/bookmarks', label: 'Bookmarks', icon: FiBookmark },
  { to: '/app/ai', label: 'AI Studio', icon: FiCpu },
  { to: '/app/profile', label: 'Profile', icon: FiUser },
  { to: '/app/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar({ onNavigate }) {
  const { unreadMessages, unreadNotifications } = useNavBadges();
  const { user } = useAuth();
  const badges = { messages: unreadMessages, notifications: unreadNotifications };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-line bg-surface">
      <div className="flex h-16 items-center px-5">
        <Logo to="/app" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV.map(({ to, label, icon: Icon, end, badge }) => {
          const count = badge ? badges[badge] : 0;
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'text-brand-600'
                    : 'text-muted hover:bg-surface-2 hover:text-content'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 -z-10 rounded-xl bg-brand-600/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon size={20} className="shrink-0" />
                  {label}
                  {count > 0 && (
                    <span className="ml-auto grid h-5 min-w-[20px] place-items-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {user?.role === 'admin' && (
        <NavLink
          to="/admin"
          onClick={onNavigate}
          className="mx-3 mb-1 flex items-center gap-3 rounded-xl border border-violet-600/30 bg-violet-600/10 px-3.5 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-600/20"
        >
          <FiShield size={19} /> Admin Panel
        </NavLink>
      )}

      <div className="m-3 rounded-2xl bg-brand-gradient p-4 text-white">
        <p className="text-sm font-semibold">Upgrade to Pro</p>
        <p className="mt-1 text-xs text-white/80">Unlock unlimited AI generations & analytics.</p>
      </div>
    </aside>
  );
}
