import { Link } from 'react-router-dom';
import { FiTrendingUp, FiHash } from 'react-icons/fi';
import Card from '@/components/ui/Card';
import UserCard from '@/components/users/UserCard';
import { useSuggestions } from '@/features/users/useFollow';
import { useTrending } from '@/features/posts/usePosts';
import { formatCount } from '@/lib/format';

export default function RightRail() {
  const { data: suggestions, isLoading: loadingS } = useSuggestions(5);
  const { data: trending, isLoading: loadingT } = useTrending();

  return (
    <aside className="hidden w-80 shrink-0 space-y-4 xl:block">
      {/* Trending */}
      <Card>
        <h3 className="flex items-center gap-2 font-semibold text-content">
          <FiTrendingUp className="text-brand-600" /> Trending
        </h3>
        <div className="mt-3 space-y-1">
          {loadingT ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-8 w-full" />)
          ) : trending?.length ? (
            trending.map((t) => (
              <Link
                key={t.tag}
                to={`/app/hashtag/${t.tag}`}
                className="flex items-center justify-between rounded-lg px-2 py-2 transition hover:bg-surface-2"
              >
                <span className="flex items-center gap-1.5 font-medium text-content">
                  <FiHash size={14} className="text-brand-600" />
                  {t.tag}
                </span>
                <span className="text-xs text-muted">{formatCount(t.count)} posts</span>
              </Link>
            ))
          ) : (
            <p className="py-2 text-sm text-muted">No trends yet — start posting with #hashtags!</p>
          )}
        </div>
      </Card>

      {/* Who to follow */}
      <Card>
        <h3 className="font-semibold text-content">Who to follow</h3>
        <div className="mt-4 space-y-4">
          {loadingS ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-2.5 w-32" />
                </div>
              </div>
            ))
          ) : suggestions?.length ? (
            suggestions.map((u) => <UserCard key={u._id} user={u} compact />)
          ) : (
            <p className="text-sm text-muted">You’re all caught up!</p>
          )}
        </div>
      </Card>

      <p className="px-2 text-xs text-muted">
        © {new Date().getFullYear()} ArtROOT Chat · Connect • Create • Collaborate
      </p>
    </aside>
  );
}
