import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHeart,
  FiMessageCircle,
  FiCornerUpLeft,
  FiUserPlus,
  FiMail,
  FiSmile,
  FiCpu,
  FiBell,
  FiCheckCircle,
} from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import {
  useNotifications,
  flattenNotifications,
  useMarkAllRead,
} from '@/features/notifications/useNotifications';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/cn';

const ICONS = {
  like: { icon: FiHeart, tone: 'text-danger bg-danger/10' },
  comment: { icon: FiMessageCircle, tone: 'text-brand-600 bg-brand-600/10' },
  reply: { icon: FiCornerUpLeft, tone: 'text-violet-600 bg-violet-600/10' },
  follow: { icon: FiUserPlus, tone: 'text-success bg-success/10' },
  message: { icon: FiMail, tone: 'text-accent-500 bg-accent-500/10' },
  reaction: { icon: FiSmile, tone: 'text-warning bg-warning/10' },
  ai: { icon: FiCpu, tone: 'text-violet-600 bg-violet-600/10' },
  system: { icon: FiBell, tone: 'text-muted bg-surface-2' },
};

const idOf = (ref) => (typeof ref === 'object' ? ref._id : ref);

const linkFor = (n) => {
  if (n.post) return `/app/post/${idOf(n.post)}`;
  if (n.type === 'follow' && n.actor) return `/app/profile/${n.actor.username}`;
  if (n.type === 'reaction' && n.conversation) return `/app/messages/${idOf(n.conversation)}`;
  if (n.type === 'message') return '/app/messages';
  return '#';
};

export default function Notifications() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useNotifications();
  const markAll = useMarkAllRead();
  const notifications = flattenNotifications(data);

  // Mark everything read shortly after viewing.
  useEffect(() => {
    if (notifications.some((n) => !n.read)) {
      const t = setTimeout(() => markAll.mutate(), 1200);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications.length]);

  return (
    <div className="container-app py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
              <FiBell size={22} />
            </div>
            <h1 className="font-display text-xl font-extrabold text-content">Notifications</h1>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<FiCheckCircle />} onClick={() => markAll.mutate()}>
            Mark all read
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size={26} className="text-brand-600" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState icon={FiBell} title="No notifications yet" description="Likes, comments, and follows will show up here." />
        ) : (
          <div className="card divide-y divide-line overflow-hidden p-0">
            {notifications.map((n) => {
              const cfg = ICONS[n.type] || ICONS.system;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn('flex items-center gap-3 px-4 py-3.5 transition', !n.read && 'bg-brand-600/[0.04]')}
                >
                  <Link to={linkFor(n)} className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="relative shrink-0">
                      {n.actor ? (
                        <Avatar src={n.actor.avatar} name={n.actor.name} size="md" />
                      ) : (
                        <div className={cn('grid h-11 w-11 place-items-center rounded-full', cfg.tone)}>
                          <Icon size={18} />
                        </div>
                      )}
                      {n.actor && (
                        <span className={cn('absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full ring-2 ring-surface', cfg.tone)}>
                          <Icon size={11} />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-content">{n.text}</p>
                      <p className="text-xs text-muted">{timeAgo(n.createdAt)}</p>
                    </div>
                  </Link>
                  {!n.read && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />}
                </motion.div>
              );
            })}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-3 text-sm font-semibold text-brand-600 hover:bg-surface-2"
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
