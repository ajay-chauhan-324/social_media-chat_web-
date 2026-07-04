import { useState, useEffect } from 'react';
import { FiSearch, FiUsers, FiUser, FiCheck } from 'react-icons/fi';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Spinner from '@/components/ui/Spinner';
import userService from '@/services/userService';
import { useStartPrivate, useCreateGroup } from '@/features/chat/useChat';
import { cn } from '@/lib/cn';

export default function NewChatModal({ open, onClose, onCreated }) {
  const [mode, setMode] = useState('private'); // private | group
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]); // for groups
  const [groupName, setGroupName] = useState('');

  const startPrivate = useStartPrivate();
  const createGroup = useCreateGroup();

  useEffect(() => {
    if (!q.trim()) { setResults([]); return undefined; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        setResults(await userService.search(q));
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const reset = () => { setQ(''); setResults([]); setSelected([]); setGroupName(''); setMode('private'); };
  const close = () => { reset(); onClose(); };

  const pickPrivate = async (user) => {
    const conv = await startPrivate.mutateAsync(user.username);
    close();
    onCreated?.(conv._id);
  };

  const toggleSelect = (user) => {
    setSelected((prev) =>
      prev.find((u) => u._id === user._id) ? prev.filter((u) => u._id !== user._id) : [...prev, user]
    );
  };

  const submitGroup = async () => {
    const conv = await createGroup.mutateAsync({
      name: groupName.trim(),
      memberUsernames: selected.map((u) => u.username),
    });
    close();
    onCreated?.(conv._id);
  };

  return (
    <Modal open={open} onClose={close} title="New conversation" size="md">
      <div className="mb-4 flex rounded-xl bg-surface-2 p-1">
        {[
          { k: 'private', label: 'Direct', icon: FiUser },
          { k: 'group', label: 'Group', icon: FiUsers },
        ].map(({ k, label, icon: Icon }) => (
          <button
            key={k}
            onClick={() => setMode(k)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition',
              mode === k ? 'bg-surface text-brand-600 shadow-soft' : 'text-muted'
            )}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {mode === 'group' && (
        <Input
          className="mb-3"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      )}

      {mode === 'group' && selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((u) => (
            <span key={u._id} className="flex items-center gap-1.5 rounded-full bg-brand-600/10 py-1 pl-1 pr-2.5 text-sm text-brand-600">
              <Avatar src={u.avatar} name={u.name} size="xs" />
              {u.name.split(' ')[0]}
            </span>
          ))}
        </div>
      )}

      <Input
        leftIcon={<FiSearch />}
        placeholder="Search people…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="mt-3 max-h-64 min-h-[120px] space-y-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-6"><Spinner size={22} className="text-brand-600" /></div>
        ) : results.length ? (
          results.map((u) => {
            const isSel = selected.find((s) => s._id === u._id);
            return (
              <button
                key={u._id}
                onClick={() => (mode === 'private' ? pickPrivate(u) : toggleSelect(u))}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-surface-2"
              >
                <Avatar src={u.avatar} name={u.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-content">{u.name}</p>
                  <p className="truncate text-sm text-muted">@{u.username}</p>
                </div>
                {mode === 'group' && (
                  <span className={cn('grid h-6 w-6 place-items-center rounded-full border', isSel ? 'border-brand-600 bg-brand-600 text-white' : 'border-line')}>
                    {isSel && <FiCheck size={14} />}
                  </span>
                )}
              </button>
            );
          })
        ) : (
          <p className="py-8 text-center text-sm text-muted">
            {q ? 'No users found' : 'Search for people to start chatting'}
          </p>
        )}
      </div>

      {mode === 'group' && (
        <Button
          fullWidth
          variant="gradient"
          className="mt-4"
          disabled={!groupName.trim() || selected.length < 1}
          loading={createGroup.isPending}
          onClick={submitGroup}
        >
          Create group ({selected.length})
        </Button>
      )}
    </Modal>
  );
}
