import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiFileText,
  FiHeart,
  FiMessageSquare,
  FiActivity,
  FiFlag,
  FiWifi,
} from 'react-icons/fi';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import StatCard from '@/components/admin/StatCard';
import { GrowthAreaChart, ActivityBarChart, TagBarChart } from '@/components/admin/Charts';
import Avatar from '@/components/ui/Avatar';
import Spinner from '@/components/ui/Spinner';
import adminService from '@/services/adminService';
import { formatCount } from '@/lib/format';

function Panel({ title, action, children }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-content">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminService.stats,
  });
  const { data: charts, isLoading: loadingCharts } = useQuery({
    queryKey: ['admin', 'charts'],
    queryFn: adminService.charts,
  });

  if (loadingStats || !stats) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner size={28} className="text-brand-600" />
      </div>
    );
  }

  const cards = [
    { icon: FiUsers, label: 'Total Users', value: stats.users.total, sub: `${stats.users.verified} verified`, tone: 'brand' },
    { icon: FiWifi, label: 'Online Now', value: stats.users.online, sub: `${stats.users.active} active this week`, tone: 'success' },
    { icon: FiFileText, label: 'Total Posts', value: stats.content.posts, sub: `+${stats.content.postsToday} today`, tone: 'violet' },
    { icon: FiHeart, label: 'Total Likes', value: stats.content.likes, sub: `${formatCount(stats.content.comments)} comments`, tone: 'danger' },
    { icon: FiMessageSquare, label: 'Messages', value: stats.chat.messages, sub: `+${stats.chat.messagesToday} today`, tone: 'accent' },
    { icon: FiFlag, label: 'Pending Reports', value: stats.reports.pending, sub: `${stats.reports.total} total`, tone: 'warning' },
    { icon: FiActivity, label: 'Banned Users', value: stats.users.banned, sub: `${stats.users.newToday} new today`, tone: 'danger' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, i) => (
          <StatCard key={c.label} {...c} delay={i * 0.04} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="User growth (12 months)">
          {loadingCharts ? <ChartSkeleton /> : <GrowthAreaChart data={charts.userGrowth} />}
        </Panel>
        <Panel title="Post activity (14 days)">
          {loadingCharts ? <ChartSkeleton /> : <ActivityBarChart data={charts.postActivity} />}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Trending hashtags">
          {loadingCharts ? <ChartSkeleton /> : <TagBarChart data={charts.trendingTags} />}
        </Panel>

        <Panel
          title="Most active users"
          action={<Link to="/admin/users" className="text-sm font-medium text-brand-600 hover:underline">View all</Link>}
        >
          <div className="space-y-3">
            {charts?.topUsers?.map((u, i) => (
              <div key={u._id} className="flex items-center gap-3">
                <span className="w-4 text-sm font-bold text-muted">{i + 1}</span>
                <Avatar src={u.avatar} name={u.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-sm font-medium text-content">
                    {u.name}
                    {u.isVerified && <RiVerifiedBadgeFill className="text-brand-600" size={13} />}
                  </p>
                  <p className="truncate text-xs text-muted">@{u.username}</p>
                </div>
                <span className="text-sm font-semibold text-content">{formatCount(u.followersCount)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Popular posts"
          action={<Link to="/admin/posts" className="text-sm font-medium text-brand-600 hover:underline">View all</Link>}
        >
          <div className="space-y-3">
            {charts?.popularPosts?.map((p) => (
              <Link
                key={p._id}
                to={`/app/post/${p._id}`}
                className="block rounded-lg border border-line p-3 transition hover:bg-surface-2"
              >
                <p className="line-clamp-2 text-sm text-content">{p.content || '📷 Photo post'}</p>
                <p className="mt-1 text-xs text-muted">
                  {p.author?.name} · ❤️ {formatCount(p.likesCount)} · 💬 {formatCount(p.commentsCount)}
                </p>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="skeleton h-[280px] w-full rounded-xl" />;
}
