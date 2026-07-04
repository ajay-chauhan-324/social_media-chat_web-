import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import PostCard from '@/components/feed/PostCard';
import PostSkeleton from '@/components/feed/PostSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { usePost } from '@/features/posts/usePosts';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = usePost(id);

  return (
    <div className="container-app py-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-muted transition hover:text-content"
        >
          <FiArrowLeft /> Back
        </button>

        {isLoading ? (
          <PostSkeleton />
        ) : isError || !post ? (
          <EmptyState
            title="Post not found"
            description="This post may have been deleted or the link is broken."
            action={
              <Button variant="gradient" size="sm" onClick={() => navigate('/app')}>
                Go to feed
              </Button>
            }
          />
        ) : (
          <PostCard post={post} showComments />
        )}
      </div>
    </div>
  );
}
