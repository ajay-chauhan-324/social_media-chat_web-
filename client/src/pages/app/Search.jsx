import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiUsers } from 'react-icons/fi';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import FollowButton from '@/components/users/FollowButton';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import userService from '@/services/userService';
import { formatCount } from '@/lib/format';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const { user: me } = useAuth();
  const [term, setTerm] = useState(params.get('q') || '');
  const debounced = useDebounce(term.trim(), 350);

  // Keep the URL in sync with the debounced term (shareable / back-button safe).
  useEffect(() => {
    setParams(debounced ? { q: debounced } : {}, { replace: true });
  }, [debounced, setParams]);

  const { data: users = [], isFetching } = useQuery({
    queryKey: ['search', 'users', debounced],
    queryFn: () => userService.search(debounced),
    enabled: debounced.length > 0,
  });

  return (
    <div className="container-app py-6">
      <div className="mx-auto max-w-2xl">
        <div className="relative mb-5">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search people by name or username…"
            className="input-base h-12 pl-11 text-base"
          />
          {isFetching && (
            <Spinner size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-600" />
          )}
        </div>

        {!debounced ? (
          <EmptyState
            icon={FiUsers}
            title="Find people on ArtROOT"
            description="Search by name or username to discover creators, developers, and friends."
          />
        ) : users.length === 0 && !isFetching ? (
          <EmptyState
            icon={FiUsers}
            title="No users found"
            description={`We couldn't find anyone matching "${debounced}". Try a different name or username.`}
          />
        ) : (
          <div className="card divide-y divide-line p-0">
            {users.map((u) => (
              <div key={u._id} className="flex items-center gap-3 px-4 py-3">
                <Link to={`/app/profile/${u.username}`} className="shrink-0">
                  <Avatar src={u.avatar} name={u.name} size="lg" className="h-12 w-12" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/app/profile/${u.username}`}
                    className="flex items-center gap-1 font-semibold text-content hover:underline"
                  >
                    <span className="truncate">{u.name}</span>
                    {u.isVerified && <RiVerifiedBadgeFill className="shrink-0 text-brand-600" size={14} />}
                  </Link>
                  <p className="truncate text-sm text-muted">
                    @{u.username}
                    {u.followersCount > 0 && ` · ${formatCount(u.followersCount)} followers`}
                  </p>
                  {u.bio && <p className="truncate text-sm text-muted">{u.bio}</p>}
                </div>
                {me?.username !== u.username && (
                  <FollowButton username={u.username} isFollowing={u.isFollowing} size="sm" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
