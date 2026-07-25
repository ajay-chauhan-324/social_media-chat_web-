import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUsers, FiHash, FiPhone, FiVideo, FiMoreVertical, FiTrash2, FiLogOut } from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';
import { useSocket } from '@/context/SocketContext';
import { useDeleteConversation, useLeaveRoom } from '@/features/chat/useChat';
import { useAuth } from '@/hooks/useAuth';

export default function ChatHeader({ conversation, onBack }) {
  const { isOnline } = useSocket();
  const { user } = useAuth();
  const del = useDeleteConversation();
  const leaveRoom = useLeaveRoom();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const deleteChat = () => {
    setMenuOpen(false);
    if (!window.confirm('Delete this conversation? This removes all messages for everyone and cannot be undone.'))
      return;
    del.mutate(conversation._id, { onSuccess: () => onBack?.() });
  };

  const leaveThisRoom = () => {
    setMenuOpen(false);
    if (!window.confirm(`Leave ${conversation.title}? You can rejoin from Rooms any time.`)) return;
    leaveRoom.mutate(conversation._id, { onSuccess: () => onBack?.() });
  };

  const isGroup = conversation.type === 'group';
  const isPublicRoom = conversation.type === 'public';
  const isMultiUser = isGroup || isPublicRoom;
  const other = !isMultiUser
    ? conversation.members?.find((m) => String(m.user._id || m.user) !== String(user?._id))?.user
    : null;
  const online = other ? isOnline(other._id) : false;
  const memberCount = conversation.members?.length ?? 0;

  const comingSoon = () => toast('Calls are coming soon', { icon: '📞' });

  return (
    <header className="flex items-center gap-3 border-b border-line bg-surface px-3 py-2.5 sm:px-4 sm:py-3">
      <button onClick={onBack} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-content hover:bg-surface-2 lg:hidden" aria-label="Back">
        <FiArrowLeft />
      </button>

      {isMultiUser ? (
        <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-gradient text-white">
          {isPublicRoom ? <FiHash size={20} /> : <FiUsers size={20} />}
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
          {isMultiUser ? `${memberCount} members` : online ? 'Active now' : 'Offline'}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          onClick={comingSoon}
          className="grid h-9 w-9 place-items-center rounded-lg text-content transition hover:bg-surface-2"
          aria-label="Voice call"
        >
          <FiPhone size={18} />
        </button>
        <button
          onClick={comingSoon}
          className="grid h-9 w-9 place-items-center rounded-lg text-content transition hover:bg-surface-2"
          aria-label="Video call"
        >
          <FiVideo size={18} />
        </button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-lg text-content transition hover:bg-surface-2"
            aria-label="Conversation options"
          >
            <FiMoreVertical size={18} />
          </button>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-soft"
            >
              {isPublicRoom ? (
                <button
                  onClick={leaveThisRoom}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger transition hover:bg-surface-2"
                >
                  <FiLogOut size={15} /> Leave room
                </button>
              ) : (
                <button
                  onClick={deleteChat}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger transition hover:bg-surface-2"
                >
                  <FiTrash2 size={15} /> Delete chat
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
