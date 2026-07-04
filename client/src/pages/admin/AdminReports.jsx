import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiCheck, FiX } from 'react-icons/fi';
import TableShell from '@/components/admin/TableShell';
import Pagination from '@/components/admin/Pagination';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/admin/Badge';
import adminService from '@/services/adminService';
import { getErrorMessage } from '@/lib/axios';
import { timeAgo } from '@/lib/format';

const STATUS_FILTERS = [
  { k: '', label: 'All' },
  { k: 'pending', label: 'Pending' },
  { k: 'resolved', label: 'Resolved' },
  { k: 'dismissed', label: 'Dismissed' },
];

const STATUS_TONE = { pending: 'warning', reviewed: 'brand', resolved: 'success', dismissed: 'neutral' };
const TYPE_TONE = { Post: 'brand', Comment: 'violet', User: 'danger' };

export default function AdminReports() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'reports', { status, page }],
    queryFn: () => adminService.reports({ status, page, limit: 15 }),
    placeholderData: (prev) => prev,
  });

  const reports = data?.data.reports || [];
  const meta = data?.meta;

  const resolve = useMutation({
    mutationFn: ({ id, status: s }) => adminService.resolveReport(id, s),
    onSuccess: () => {
      toast.success('Report updated');
      qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl bg-surface-2 p-1 w-fit">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.k}
            onClick={() => { setStatus(f.k); setPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${status === f.k ? 'bg-surface text-brand-600 shadow-soft' : 'text-muted'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <TableShell isLoading={isLoading} isEmpty={!reports.length} emptyTitle="No reports">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Reporter</th>
              <th className="px-4 py-3 font-semibold">Target</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className={isFetching ? 'opacity-60' : ''}>
            {reports.map((r) => (
              <tr key={r._id} className="border-b border-line/60 transition hover:bg-surface-2/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar src={r.reporter?.avatar} name={r.reporter?.name} size="xs" />
                    <span className="whitespace-nowrap text-content">{r.reporter?.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge tone={TYPE_TONE[r.targetType]}>{r.targetType}</Badge></td>
                <td className="px-4 py-3">
                  <p className="font-medium capitalize text-content">{r.reason}</p>
                  <p className="line-clamp-1 text-xs text-muted">{r.details}</p>
                </td>
                <td className="px-4 py-3"><Badge tone={STATUS_TONE[r.status]} className="capitalize">{r.status}</Badge></td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{timeAgo(r.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      title="Resolve"
                      disabled={r.status === 'resolved'}
                      onClick={() => resolve.mutate({ id: r._id, status: 'resolved' })}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-success transition hover:bg-surface-2 disabled:opacity-40"
                    >
                      <FiCheck size={16} />
                    </button>
                    <button
                      title="Dismiss"
                      disabled={r.status === 'dismissed'}
                      onClick={() => resolve.mutate({ id: r._id, status: 'dismissed' })}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition hover:bg-surface-2 disabled:opacity-40"
                    >
                      <FiX size={16} />
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
