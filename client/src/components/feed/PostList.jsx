import { useEffect, useRef } from 'react';
import { FiFileText } from 'react-icons/fi';
import PostCard from './PostCard';
import PostSkeleton from './PostSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { flattenPosts } from '@/features/posts/usePosts';

export default function PostList({ query, emptyTitle = 'Nothing here yet', emptyDescription, emptyAction }) {
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = query;
  const sentinel = useRef(null);
  const posts = flattenPosts(data);

  useEffect(() => {
    if (!hasNextPage) return undefined;
    const el = sentinel.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: '600px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Couldn’t load posts"
        description="Something went wrong. Please try again."
      />
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={FiFileText}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
      <div ref={sentinel} className="h-4" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Spinner size={22} className="text-brand-600" />
        </div>
      )}
    </div>
  );
}
