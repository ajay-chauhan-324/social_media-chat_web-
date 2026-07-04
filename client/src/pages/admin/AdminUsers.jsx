import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiSearch, FiDownload, FiTrash2, FiCheckCircle, FiSlash, FiShield } from 'react-icons/fi';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import TableShell from '@/components/admin/TableShell';
import Pagination from '@/components/admin/Pagination';
import Badge from '@/components/admin/Badge';
import Avatar from '@/components/ui/Avatar';
import adminService from '@/services/adminService';
import { exportCsv } from '@/lib/exportCsv';
import { getErrorMessage } from '@/lib/axios';
import { timeAgo } from '@/lib/format';

const FILTERS = [
  { k: '', label: 'All' },
  { k: 'verified', label: 'Verified' },
  { k: 'banned', label: 'Banned' },
];

export default function AdminUsers() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'users', { q, status, page }],
    queryFn: () => adminService.users({ q, status, page, limit: 12 }),
    placeholderData: (prev) => prev,
  });

  const users = data?.data.users || [];
  const meta = data?.meta;

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'users'] });

  const update = useMutation({
    mutationFn: ({ id, payload }) => adminService.updateUser(id, payload),
    onSuccess: () => {
      toast.success('User updated');
      invalidate();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted');
      invalidate();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const onSearch = (e) => {
    setQ(e.target.value);
    setPage(1);
  };

  const doExport = async () => {
    const all = await adminService.users({ q, status, page: 1, limit: 50 });
    exportCsv(
      all.data.users.map((u) => ({
        name: u.name,
        username: u.username,
        email: u.email,
        role: u.role,
        verified: u.isVerified,
        banned: u.isBanned,
        followers: u.followersCount,
        posts: u.postsCount,
        joined: new Date(u.createdAt).toISOString().slice(0, 10),
      })),
      'artroot-users.csv'
    );
    toast.success('Exported CSV');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={onSearch} placeholder="Search name, username, email…" className="input-base h-10 pl-9" />
        </div>
        <div className="flex rounded-xl bg-surface-2 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.k}
              onClick={() => { setStatus(f.k); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${status === f.k ? 'bg-surface text-brand-600 shadow-soft' : 'text-muted'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={doExport} className="flex h-10 items-center gap-2 rounded-xl border border-line px-3.5 text-sm font-medium text-content transition hover:bg-surface-2">
          <FiDownload size={16} /> Export
        </button>
      </div>

      <TableShell isLoading={isLoading} isEmpty={!users.length} emptyTitle="No users found">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Followers</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className={isFetching ? 'opacity-60' : ''}>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-line/60 transition hover:bg-surface-2/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatar} name={u.name} size="sm" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 font-medium text-content">
                        {u.name}
                        {u.isVerified && <RiVerifiedBadgeFill className="text-brand-600" size={13} />}
                      </p>
                      <p className="truncate text-xs text-muted">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.role === 'admin' ? 'violet' : 'neutral'}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  {u.isBanned ? <Badge tone="danger">Banned</Badge> : <Badge tone="success">Active</Badge>}
                </td>
                <td className="px-4 py-3 tabular-nums text-content">{u.followersCount}</td>
                <td className="px-4 py-3 text-muted">{timeAgo(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <IconBtn
                      title={u.isVerified ? 'Unverify' : 'Verify'}
                      active={u.isVerified}
                      onClick={() => update.mutate({ id: u._id, payload: { isVerified: !u.isVerified } })}
                    >
                      <FiCheckCircle size={16} />
                    </IconBtn>
                    <IconBtn
                      title={u.isBanned ? 'Unban' : 'Ban'}
                      danger={u.isBanned}
                      onClick={() => update.mutate({ id: u._id, payload: { isBanned: !u.isBanned } })}
                    >
                      <FiSlash size={16} />
                    </IconBtn>
                    <IconBtn
                      title={u.role === 'admin' ? 'Make user' : 'Make admin'}
                      onClick={() => update.mutate({ id: u._id, payload: { role: u.role === 'admin' ? 'user' : 'admin' } })}
                    >
                      <FiShield size={16} />
                    </IconBtn>
                    <IconBtn
                      title="Delete"
                      danger
                      disabled={u.role === 'admin'}
                      onClick={() => {
                        if (window.confirm(`Delete ${u.name}? This removes all their content.`)) remove.mutate(u._id);
                      }}
                    >
                      <FiTrash2 size={16} />
                    </IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onChange={setPage} />}
    </div>
  );
}

function IconBtn({ children, title, onClick, active, danger, disabled }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-8 w-8 place-items-center rounded-lg border border-line transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? 'text-brand-600' : danger ? 'text-danger' : 'text-muted hover:text-content'
      }`}
    >
      {children}
    </button>
  );
}
