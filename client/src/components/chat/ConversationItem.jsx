import { FiUsers } from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/hooks/useAuth';
import { timeAgo, formatCount } from '@/lib/format';
import { cn } from '@/lib/cn';

export default function ConversationItem({ conversation, active, onClick }) {
  const { isOnline } = useSocket();
  const { user } = useAuth();
  const isGroup = conversation.type === 'group';
  const other = !isGroup
    ? conversation.members?.find((m) => String(m.user._id || m.user) !== String(user?._id))?.user
    : null;
  const online = other ? isOnline(other._id) : false;

  const last = conversation.lastMessage;
  const preview = last
    ? last.isDeleted
      ? 'Message deleted'
      : last.images?.length
        ? '📷 Photo'
        : last.content
    : 'No messages yet';
  const lastSender =
    last && String(last.sender?._id || last.sender) === String(user?._id) ? 'You: ' : '';

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
        active ? 'bg-brand-600/10' : 'hover:bg-surface-2'
      )}
    >
      <div className="relative shrink-0">
        {isGroup ? (
          <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-gradient text-white">
            <FiUsers size={20} />
          </div>
        ) : (
          <Avatar src={other?.avatar} name={other?.name} size="lg" className="h-12 w-12" />
        )}
        {online && (
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-success" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('truncate font-semibold text-content', conversation.unreadCount && 'font-bold')}>
            {conversation.title}
          </span>
          {last && <span className="shrink-0 text-xs text-muted">{timeAgo(conversation.lastMessageAt)}</span>}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={cn('truncate text-sm', conversation.unreadCount ? 'font-medium text-content' : 'text-muted')}>
            {lastSender}
            {preview}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="grid h-5 min-w-[20px] shrink-0 place-items-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
              {formatCount(conversation.unreadCount)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
