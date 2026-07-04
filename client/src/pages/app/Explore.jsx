import { FiCompass } from 'react-icons/fi';
import PostList from '@/components/feed/PostList';
import RightRail from '@/components/feed/RightRail';
import { usePostFeed } from '@/features/posts/usePosts';

export default function Explore() {
  const query = usePostFeed('explore');

  return (
    <div className="container-app flex gap-6 py-6">
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
              <FiCompass size={22} />
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold text-content">Explore</h1>
              <p className="text-sm text-muted">Discover what the community is sharing</p>
            </div>
          </div>

          <PostList
            query={query}
            emptyTitle="Nothing to explore yet"
            emptyDescription="Be the first to share something with the community!"
          />
        </div>
      </div>
      <RightRail />
    </div>
  );
}
