import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiCpu } from 'react-icons/fi';
import TableShell from '@/components/admin/TableShell';
import Pagination from '@/components/admin/Pagination';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/admin/Badge';
import { ActivityBarChart } from '@/components/admin/Charts';
import adminService from '@/services/adminService';
import { timeAgo, formatCount } from '@/lib/format';

export default function AdminAI() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'ai', { page }],
    queryFn: () => adminService.ai({ page, limit: 15 }),
    placeholderData: (prev) => prev,
  });

  const histories = data?.data.histories || [];
  const byTool = data?.data.byTool || [];
  const byDay = data?.data.byDay || [];
  const meta = data?.meta;
  const totalRequests = byTool.reduce((s, t) => s + t.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-content">AI conversations (14 days)</h2>
          {isLoading ? <div className="skeleton h-[280px] w-full rounded-xl" /> : <ActivityBarChart data={byDay} color="#06B6D4" />}
        </div>
        <div className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-content">
            <FiCpu className="text-brand-600" /> Usage by tool
          </h2>
          <div className="space-y-3">
            {byTool.map((t) => (
              <div key={t.tool}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="capitalize text-content">{t.tool}</span>
                  <span className="text-muted">{t.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-brand-gradient"
                    style={{ width: `${totalRequests ? (t.count / totalRequests) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TableShell title="Recent AI conversations" isLoading={isLoading} isEmpty={!histories.length} emptyTitle="No AI usage yet">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Prompt</th>
              <th className="px-4 py-3 font-semibold">Tool</th>
              <th className="px-4 py-3 font-semibold">Tokens</th>
              <th className="px-4 py-3 font-semibold">When</th>
            </tr>
          </thead>
          <tbody className={isFetching ? 'opacity-60' : ''}>
            {histories.map((h) => (
              <tr key={h._id} className="border-b border-line/60 transition hover:bg-surface-2/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar src={h.user?.avatar} name={h.user?.name} size="xs" />
                    <span className="whitespace-nowrap text-content">{h.user?.name}</span>
                  </div>
                </td>
                <td className="max-w-sm px-4 py-3"><p className="line-clamp-1 text-content">{h.title}</p></td>
                <td className="px-4 py-3"><Badge tone="accent" className="capitalize">{h.tool}</Badge></td>
                <td className="px-4 py-3 tabular-nums text-muted">{formatCount(h.tokens)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{timeAgo(h.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onChange={setPage} />}
    </div>
  );
}
