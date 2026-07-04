import { useParams } from 'react-router-dom';
import { FiHash } from 'react-icons/fi';
import PostList from '@/components/feed/PostList';
import RightRail from '@/components/feed/RightRail';
import { usePostFeed } from '@/features/posts/usePosts';

export default function HashtagFeed() {
  const { tag } = useParams();
  const query = usePostFeed('hashtag', tag);

  return (
    <div className="container-app flex gap-6 py-6">
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
              <FiHash size={22} />
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold text-content">#{tag}</h1>
              <p className="text-sm text-muted">Posts tagged with #{tag}</p>
            </div>
          </div>

          <PostList
            query={query}
            emptyTitle={`No posts for #${tag} yet`}
            emptyDescription="Be the first to post with this hashtag!"
          />
        </div>
      </div>
      <RightRail />
    </div>
  );
}
