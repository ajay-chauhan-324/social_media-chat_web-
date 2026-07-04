import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import Avatar from '@/components/ui/Avatar';
import RichText from './RichText';
import CommentComposer from './CommentComposer';
import commentService from '@/services/commentService';
import { timeAgo, formatCount } from '@/lib/format';
import { cn } from '@/lib/cn';
import { useLikeComment, useAddComment, useDeleteComment } from '@/features/posts/useComments';
import { postKeys } from '@/features/posts/postKeys';

export default function CommentItem({ comment, postId, depth = 0 }) {
  const [liked, setLiked] = useState(comment.isLiked);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [localReplies, setLocalReplies] = useState([]);

  const likeComment = useLikeComment();
  const addComment = useAddComment(postId);
  const deleteComment = useDeleteComment(postId);

  const totalReplies = comment.repliesCount + localReplies.length;

  const { data: repliesData } = useQuery({
    queryKey: postKeys.replies(comment._id),
    queryFn: () => commentService.replies(comment._id).then((r) => r.data.replies),
    enabled: showReplies && comment.repliesCount > 0,
  });

  const replies = [...(repliesData || []), ...localReplies];

  const toggleLike = () => {
    setLiked((l) => !l);
    setLikesCount((c) => c + (liked ? -1 : 1));
    likeComment.mutate(comment._id, {
      onSuccess: (d) => {
        setLiked(d.liked);
        setLikesCount(d.likesCount);
      },
      onError: () => {
        setLiked(comment.isLiked);
        setLikesCount(comment.likesCount);
      },
    });
  };

  const submitReply = async (content) => {
    const reply = await addComment.mutateAsync({ content, parent: comment._id });
    setLocalReplies((prev) => [...prev, reply]);
    setShowReply(false);
    setShowReplies(true);
  };

  const [deleted, setDeleted] = useState(false);
  if (deleted) return null;

  return (
    <div className={cn(depth > 0 && 'ml-6 border-l border-line pl-3 sm:ml-9')}>
      <div className="flex gap-2.5 py-2">
        <Link to={`/app/profile/${comment.author.username}`}>
          <Avatar src={comment.author.avatar} name={comment.author.name} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="inline-block rounded-2xl bg-surface-2 px-3.5 py-2">
            <div className="flex items-center gap-1.5">
              <Link
                to={`/app/profile/${comment.author.username}`}
                className="text-sm font-semibold text-content hover:underline"
              >
                {comment.author.name}
              </Link>
              <span className="text-xs text-muted">@{comment.author.username}</span>
            </div>
            <RichText text={comment.content} className="text-sm text-content" />
          </div>

          <div className="mt-1 flex items-center gap-4 px-1 text-xs text-muted">
            <span>{timeAgo(comment.createdAt)}</span>
            <button
              onClick={toggleLike}
              className={cn('flex items-center gap-1 font-medium transition', liked && 'text-danger')}
            >
              <FiHeart size={13} className={cn(liked && 'fill-current')} />
              {likesCount > 0 && formatCount(likesCount)}
              <span className="sr-only">Like</span>
              {likesCount === 0 && 'Like'}
            </button>
            {depth === 0 && (
              <button onClick={() => setShowReply((s) => !s)} className="font-medium hover:text-content">
                Reply
              </button>
            )}
            {comment.isAuthor && (
              <button
                onClick={() => {
                  if (window.confirm('Delete this comment?')) {
                    deleteComment.mutate(comment._id, { onSuccess: () => setDeleted(true) });
                  }
                }}
                className="flex items-center gap-1 font-medium hover:text-danger"
              >
                <FiTrash2 size={12} /> Delete
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-2">
              <CommentComposer
                compact
                autoFocus
                isPending={addComment.isPending}
                placeholder={`Reply to ${comment.author.name}…`}
                onSubmit={submitReply}
              />
            </div>
          )}

          {totalReplies > 0 && (
            <button
              onClick={() => setShowReplies((s) => !s)}
              className="mt-1.5 px-1 text-xs font-semibold text-brand-600 hover:underline"
            >
              {showReplies ? 'Hide' : 'View'} {totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {showReplies &&
            replies.map((r) => (
              <CommentItem key={r._id} comment={r} postId={postId} depth={depth + 1} />
            ))}
        </div>
      </div>
    </div>
  );
}
