import { motion } from 'framer-motion';
import Spinner from '@/components/ui/Spinner';
import CommentComposer from './CommentComposer';
import CommentItem from './CommentItem';
import { useComments, flattenComments, useAddComment } from '@/features/posts/useComments';

export default function CommentSection({ postId }) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useComments(postId);
  const addComment = useAddComment(postId);
  const comments = flattenComments(data);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-3 border-t border-line pt-3"
    >
      <CommentComposer
        isPending={addComment.isPending}
        onSubmit={(content) => addComment.mutateAsync({ content })}
      />

      <div className="mt-2">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner size={20} className="text-brand-600" />
          </div>
        ) : comments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">Be the first to comment ✨</p>
        ) : (
          <>
            {comments.map((c) => (
              <CommentItem key={c._id} comment={c} postId={postId} />
            ))}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="mt-2 text-sm font-semibold text-brand-600 hover:underline"
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more comments'}
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
