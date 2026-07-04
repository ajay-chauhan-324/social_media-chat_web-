import { Link } from 'react-router-dom';
import { FiArrowLeft, FiUsers } from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/hooks/useAuth';

export default function ChatHeader({ conversation, onBack }) {
  const { isOnline } = useSocket();
  const { user } = useAuth();

  const isGroup = conversation.type === 'group';
  const other = !isGroup
    ? conversation.members?.find((m) => String(m.user._id || m.user) !== String(user?._id))?.user
    : null;
  const online = other ? isOnline(other._id) : false;
  const memberCount = conversation.members?.length ?? 0;

  return (
    <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
      <button onClick={onBack} className="grid h-9 w-9 place-items-center rounded-lg text-content hover:bg-surface-2 lg:hidden" aria-label="Back">
        <FiArrowLeft />
      </button>

      {isGroup ? (
        <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-gradient text-white">
          <FiUsers size={20} />
        </div>
      ) : (
        <div className="relative">
          <Avatar src={other?.avatar} name={other?.name} size="md" />
          {online && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-success" />
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {other ? (
          <Link to={`/app/profile/${other.username}`} className="truncate font-semibold text-content hover:underline">
            {conversation.title}
          </Link>
        ) : (
          <p className="truncate font-semibold text-content">{conversation.title}</p>
        )}
        <p className="text-xs text-muted">
          {isGroup ? `${memberCount} members` : online ? 'Active now' : 'Offline'}
        </p>
      </div>
    </header>
  );
}
