import { FiBookmark } from 'react-icons/fi';
import PostList from '@/components/feed/PostList';
import { usePostFeed } from '@/features/posts/usePosts';

export default function Bookmarks() {
  const query = usePostFeed('bookmarks');

  return (
    <div className="container-app py-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white">
            <FiBookmark size={22} />
          </div>
          <div>
            <h1 className="font-display text-xl font-extrabold text-content">Bookmarks</h1>
            <p className="text-sm text-muted">Posts you’ve saved for later</p>
          </div>
        </div>

        <PostList
          query={query}
          emptyTitle="No bookmarks yet"
          emptyDescription="Tap the bookmark icon on any post to save it here."
        />
      </div>
    </div>
  );
}
