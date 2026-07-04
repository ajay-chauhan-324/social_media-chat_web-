import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiSearch, FiTrash2 } from 'react-icons/fi';
import TableShell from '@/components/admin/TableShell';
import Pagination from '@/components/admin/Pagination';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/admin/Badge';
import adminService from '@/services/adminService';
import { getErrorMessage } from '@/lib/axios';
import { timeAgo } from '@/lib/format';

export default function AdminComments() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'comments', { q, page }],
    queryFn: () => adminService.comments({ q, page, limit: 15 }),
    placeholderData: (prev) => prev,
  });

  const comments = data?.data.comments || [];
  const meta = data?.meta;

  const remove = useMutation({
    mutationFn: (id) => adminService.deleteComment(id),
    onSuccess: () => {
      toast.success('Comment deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'comments'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search comments…"
          className="input-base h-10 pl-9"
        />
      </div>

      <TableShell isLoading={isLoading} isEmpty={!comments.length} emptyTitle="No comments found">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Author</th>
              <th className="px-4 py-3 font-semibold">Comment</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className={isFetching ? 'opacity-60' : ''}>
            {comments.map((c) => (
              <tr key={c._id} className="border-b border-line/60 transition hover:bg-surface-2/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar src={c.author?.avatar} name={c.author?.name} size="xs" />
                    <span className="whitespace-nowrap text-content">{c.author?.name}</span>
                  </div>
                </td>
                <td className="max-w-sm px-4 py-3">
                  <p className="line-clamp-2 text-content">{c.content}</p>
                </td>
                <td className="px-4 py-3">
                  {c.parent ? <Badge tone="violet">Reply</Badge> : <Badge>Comment</Badge>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{timeAgo(c.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button
                      title="Delete"
                      onClick={() => window.confirm('Delete this comment?') && remove.mutate(c._id)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-danger transition hover:bg-surface-2"
                    >
                      <FiTrash2 size={15} />
                    </button>
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
