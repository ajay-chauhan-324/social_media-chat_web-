import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiHeart,
  FiMessageCircle,
  FiBookmark,
  FiShare2,
  FiMoreHorizontal,
  FiTrash2,
  FiEdit2,
  FiCheck,
} from 'react-icons/fi';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import Avatar from '@/components/ui/Avatar';
import RichText from './RichText';
import ImageGrid from './ImageGrid';
import CommentSection from './CommentSection';
import { timeAgo, formatCount } from '@/lib/format';
import { cn } from '@/lib/cn';
import { useLikePost, useBookmarkPost, useDeletePost } from '@/features/posts/usePostActions';

function PostMenu({ post, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!post.isAuthor) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-content"
        aria-label="Post options"
      >
        <FiMoreHorizontal />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-soft"
        >
          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger transition hover:bg-surface-2"
          >
            <FiTrash2 size={15} /> Delete
          </button>
        </motion.div>
      )}
    </div>
  );
}

function ActionButton({ active, activeColor, icon: Icon, count, onClick, label, filled }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        'group flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-muted transition',
        active ? activeColor : 'hover:text-content'
      )}
    >
      <span
        className={cn(
          'grid h-8 w-8 place-items-center rounded-full transition group-hover:bg-surface-2',
          active && 'bg-transparent'
        )}
      >
        <Icon size={18} className={cn(active && filled && 'fill-current')} />
      </span>
      {count > 0 && <span className="tabular-nums">{formatCount(count)}</span>}
    </button>
  );
}

export default function PostCard({ post, showComments: initialShow = false }) {
  const like = useLikePost();
  const bookmark = useBookmarkPost();
  const del = useDeletePost();
  const [showComments, setShowComments] = useState(initialShow);

  const share = () => {
    const url = `${window.location.origin}/app/post/${post._id}`;
    navigator.clipboard?.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleDelete = () => {
    if (window.confirm('Delete this post? This cannot be undone.')) del.mutate(post._id);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 sm:p-5"
    >
      <header className="flex items-start gap-3">
        <Link to={`/app/profile/${post.author.username}`}>
          <Avatar src={post.author.avatar} name={post.author.name} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              to={`/app/profile/${post.author.username}`}
              className="truncate font-semibold text-content hover:underline"
            >
              {post.author.name}
            </Link>
            {post.author.isVerified && <RiVerifiedBadgeFill className="shrink-0 text-brand-600" />}
            <span className="truncate text-sm text-muted">@{post.author.username}</span>
            <span className="text-muted">·</span>
            <Link to={`/app/post/${post._id}`} className="text-sm text-muted hover:underline">
              {timeAgo(post.createdAt)}
            </Link>
            {post.editedAt && <span className="text-xs text-muted">(edited)</span>}
          </div>
          {post.author.headline && (
            <p className="truncate text-xs text-muted">{post.author.headline}</p>
          )}
        </div>
        <PostMenu post={post} onDelete={handleDelete} />
      </header>

      {post.content && (
        <RichText text={post.content} className="mt-3 text-[15px] leading-relaxed text-content" />
      )}
      <ImageGrid images={post.images} />

      <footer className="mt-3 flex items-center justify-between border-t border-line pt-2">
        <ActionButton
          label="Like"
          icon={FiHeart}
          filled
          active={post.isLiked}
          activeColor="text-danger"
          count={post.likesCount}
          onClick={() => like.mutate(post._id)}
        />
        <ActionButton
          label="Comment"
          icon={FiMessageCircle}
          count={post.commentsCount}
          onClick={() => setShowComments((s) => !s)}
        />
        <ActionButton
          label="Bookmark"
          icon={FiBookmark}
          filled
          active={post.isBookmarked}
          activeColor="text-brand-600"
          count={post.bookmarksCount}
          onClick={() => bookmark.mutate(post._id)}
        />
        <ActionButton label="Share" icon={FiShare2} onClick={share} />
      </footer>

      {showComments && <CommentSection postId={post._id} />}
    </motion.article>
  );
}
