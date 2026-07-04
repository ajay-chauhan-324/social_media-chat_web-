import { Link } from 'react-router-dom';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import Avatar from '@/components/ui/Avatar';
import FollowButton from './FollowButton';
import { useAuth } from '@/hooks/useAuth';
import { formatCount } from '@/lib/format';

export default function UserCard({ user, compact }) {
  const { user: me } = useAuth();
  const isSelf = me?.username === user.username;

  return (
    <div className="flex items-center gap-3">
      <Link to={`/app/profile/${user.username}`}>
        <Avatar src={user.avatar} name={user.name} size={compact ? 'sm' : 'md'} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to={`/app/profile/${user.username}`}
          className="flex items-center gap-1 font-semibold text-content hover:underline"
        >
          <span className="truncate">{user.name}</span>
          {user.isVerified && <RiVerifiedBadgeFill className="shrink-0 text-brand-600" size={14} />}
        </Link>
        <p className="truncate text-sm text-muted">
          {user.headline || `@${user.username}`}
          {!compact && user.followersCount > 0 && ` · ${formatCount(user.followersCount)} followers`}
        </p>
      </div>
      {!isSelf && (
        <FollowButton username={user.username} isFollowing={user.isFollowing} size="sm" />
      )}
    </div>
  );
}
