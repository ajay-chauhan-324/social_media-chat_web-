import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHash, FiPlus, FiUsers } from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { useRooms, useCreateRoom, useJoinRoom } from '@/features/chat/useChat';

function CreateRoomModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createRoom = useCreateRoom();

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const conv = await createRoom.mutateAsync({ name: name.trim(), description: description.trim() });
    setName('');
    setDescription('');
    onClose();
    onCreated?.(conv._id);
  };

  return (
    <Modal open={open} onClose={onClose} title="Create a room" size="sm">
      <form onSubmit={submit} className="space-y-3">
        <Input placeholder="Room name (e.g. Tech)" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <Textarea
          placeholder="What's this room about? (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <Button type="submit" fullWidth variant="gradient" disabled={!name.trim()} loading={createRoom.isPending}>
          Create room
        </Button>
      </form>
    </Modal>
  );
}

export default function Rooms() {
  const navigate = useNavigate();
  const { data: rooms, isLoading } = useRooms();
  const joinRoom = useJoinRoom();
  const [createOpen, setCreateOpen] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  const openRoom = async (room) => {
    if (room.isMember) {
      navigate(`/app/messages/${room._id}`);
      return;
    }
    setJoiningId(room._id);
    try {
      const conv = await joinRoom.mutateAsync(room._id);
      navigate(`/app/messages/${conv._id}`);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="container-app py-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
            <FiHash size={22} />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-extrabold text-content">Rooms</h1>
            <p className="text-sm text-muted">Open, public spaces anyone can join and chat in</p>
          </div>
          <Button size="sm" variant="gradient" leftIcon={<FiPlus />} onClick={() => setCreateOpen(true)}>
            New room
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size={26} className="text-brand-600" />
          </div>
        ) : rooms?.length ? (
          <div className="space-y-2">
            {rooms.map((room) => (
              <button
                key={room._id}
                onClick={() => openRoom(room)}
                disabled={joiningId === room._id}
                className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-left transition hover:border-brand-500 hover:bg-surface-2 disabled:opacity-60"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-gradient text-white">
                  <FiHash size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-content">{room.name}</p>
                  {room.description && <p className="truncate text-sm text-muted">{room.description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-muted">
                  <FiUsers size={13} />
                  {room.memberCount}
                </div>
                {joiningId === room._id ? (
                  <Spinner size={16} className="shrink-0 text-brand-600" />
                ) : (
                  <span className={room.isMember ? 'shrink-0 text-xs font-medium text-muted' : 'shrink-0 text-xs font-semibold text-brand-600'}>
                    {room.isMember ? 'Open' : 'Join'}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FiHash}
            title="No rooms yet"
            description="Be the first to create a public room for everyone to join."
            action={
              <Button variant="gradient" leftIcon={<FiPlus />} onClick={() => setCreateOpen(true)}>
                Create a room
              </Button>
            }
          />
        )}
      </div>

      <CreateRoomModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => navigate(`/app/messages/${id}`)}
      />
    </div>
  );
}
