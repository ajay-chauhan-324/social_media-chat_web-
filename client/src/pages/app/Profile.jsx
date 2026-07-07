import { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FiMapPin,
  FiLink,
  FiCalendar,
  FiEdit2,
  FiCpu,
  FiMessageCircle,
} from 'react-icons/fi';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import PostList from '@/components/feed/PostList';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import FollowButton from '@/components/users/FollowButton';
import EditProfileModal from '@/components/users/EditProfileModal';
import FollowListModal from '@/components/users/FollowListModal';
import { usePostFeed } from '@/features/posts/usePosts';
import { useStartPrivate } from '@/features/chat/useChat';
import { useAuth } from '@/hooks/useAuth';
import userService from '@/services/userService';
import { formatCount } from '@/lib/format';

function Stat({ label, value, onClick }) {
  return (
    <button onClick={onClick} className="text-left transition hover:opacity-80" disabled={!onClick}>
      <span className="font-bold text-content">{formatCount(value)}</span>{' '}
      <span className="text-sm text-muted">{label}</span>
    </button>
  );
}

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const startPrivate = useStartPrivate();
  const [editOpen, setEditOpen] = useState(false);
  const [followList, setFollowList] = useState(null); // 'followers' | 'following'

  const messageUser = async (uname) => {
    const conv = await startPrivate.mutateAsync(uname);
    navigate(`/app/messages/${conv._id}`);
  };

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', username],
    queryFn: () => userService.getProfile(username),
  });

  const postsQuery = usePostFeed('user', username);

  // /app/profile with no username → own profile
  if (!username && me) return <Navigate to={`/app/profile/${me.username}`} replace />;

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner size={28} className="text-brand-600" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container-app py-10">
        <EmptyState title="User not found" description="This profile doesn’t exist or was removed." />
      </div>
    );
  }

  const isSelf = user.isSelf ?? me?.username === user.username;
  const joined = new Date(user.createdAt).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="container-app py-6">
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden p-0">
          {/* Cover */}
          <div className="relative h-40 bg-brand-gradient sm:h-52">
            {user.cover && <img src={user.cover} alt="" className="h-full w-full object-cover" />}
          </div>

          <div className="px-5 pb-5">
            <div className="flex items-end justify-between">
              <Avatar
                src={user.avatar}
                name={user.name}
                size="xl"
                className="-mt-12 ring-4 ring-surface sm:-mt-14"
              />
              <div className="pb-1">
                {isSelf ? (
                  <Button variant="secondary" size="sm" leftIcon={<FiEdit2 />} onClick={() => setEditOpen(true)}>
                    Edit profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    {/* Messaging is follow-gated: show Message only once you follow. */}
                    {user.isFollowing && (
                      <Button
                        variant="secondary"
                        size="md"
                        leftIcon={<FiMessageCircle />}
                        loading={startPrivate.isPending}
                        onClick={() => messageUser(user.username)}
                      >
                        Message
                      </Button>
                    )}
                    <FollowButton username={user.username} isFollowing={user.isFollowing} size="md" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-2xl font-extrabold text-content">{user.name}</h1>
                {user.isVerified && <RiVerifiedBadgeFill className="text-brand-600" size={20} />}
              </div>
              <p className="text-muted">@{user.username}</p>
            </div>

            {user.headline && <p className="mt-2 font-medium text-content">{user.headline}</p>}
            {user.bio && <p className="mt-2 text-[15px] leading-relaxed text-content">{user.bio}</p>}

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted">
              {user.location && (
                <span className="flex items-center gap-1.5">
                  <FiMapPin size={14} /> {user.location}
                </span>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-brand-600 hover:underline"
                >
                  <FiLink size={14} /> {user.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <FiCalendar size={14} /> Joined {joined}
              </span>
              <span className="flex items-center gap-1.5">
                <FiCpu size={14} /> AI Score {user.aiScore ?? 0}
              </span>
            </div>

            {user.skills?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {user.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-brand-600/10 px-3 py-1 text-xs font-medium text-brand-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-5 border-t border-line pt-4">
              <Stat label="Posts" value={user.postsCount} />
              <Stat label="Followers" value={user.followersCount} onClick={() => setFollowList('followers')} />
              <Stat label="Following" value={user.followingCount} onClick={() => setFollowList('following')} />
            </div>
          </div>
        </motion.div>

        <div className="mt-6">
          <h2 className="mb-3 px-1 font-display text-lg font-bold text-content">Posts</h2>
          <PostList
            query={postsQuery}
            emptyTitle={isSelf ? 'You haven’t posted yet' : `${user.name} hasn’t posted yet`}
            emptyDescription={isSelf ? 'Share your first post from the Home feed.' : 'Check back later.'}
          />
        </div>
      </div>

      {isSelf && <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} user={user} />}
      <FollowListModal
        open={Boolean(followList)}
        onClose={() => setFollowList(null)}
        username={user.username}
        type={followList}
      />
    </div>
  );
}
