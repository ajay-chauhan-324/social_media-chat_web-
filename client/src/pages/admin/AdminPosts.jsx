import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSearch, FiTrash2, FiExternalLink } from 'react-icons/fi';
import TableShell from '@/components/admin/TableShell';
import Pagination from '@/components/admin/Pagination';
import Avatar from '@/components/ui/Avatar';
import adminService from '@/services/adminService';
import { getErrorMessage } from '@/lib/axios';
import { timeAgo, formatCount } from '@/lib/format';

export default function AdminPosts() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'posts', { q, page }],
    queryFn: () => adminService.posts({ q, page, limit: 12 }),
    placeholderData: (prev) => prev,
  });

  const posts = data?.data.posts || [];
  const meta = data?.meta;

  const remove = useMutation({
    mutationFn: (id) => adminService.deletePost(id),
    onSuccess: () => {
      toast.success('Post deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
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
          placeholder="Search post content…"
          className="input-base h-10 pl-9"
        />
      </div>

      <TableShell isLoading={isLoading} isEmpty={!posts.length} emptyTitle="No posts found">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Author</th>
              <th className="px-4 py-3 font-semibold">Content</th>
              <th className="px-4 py-3 font-semibold">Engagement</th>
              <th className="px-4 py-3 font-semibold">Posted</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className={isFetching ? 'opacity-60' : ''}>
            {posts.map((p) => (
              <tr key={p._id} className="border-b border-line/60 transition hover:bg-surface-2/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar src={p.author?.avatar} name={p.author?.name} size="xs" />
                    <span className="whitespace-nowrap text-content">{p.author?.name}</span>
                  </div>
                </td>
                <td className="max-w-xs px-4 py-3">
                  <p className="line-clamp-2 text-content">{p.content || '📷 Photo post'}</p>
                  {p.images?.length > 0 && <span className="text-xs text-muted">{p.images.length} image(s)</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  ❤️ {formatCount(p.likesCount)} · 💬 {formatCount(p.commentsCount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{timeAgo(p.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link
                      to={`/app/post/${p._id}`}
                      title="View"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:bg-surface-2 hover:text-content"
                    >
                      <FiExternalLink size={15} />
                    </Link>
                    <button
                      title="Delete"
                      onClick={() => window.confirm('Delete this post?') && remove.mutate(p._id)}
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
