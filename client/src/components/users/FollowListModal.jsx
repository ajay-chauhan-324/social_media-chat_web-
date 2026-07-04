import { useQuery } from '@tanstack/react-query';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import UserCard from './UserCard';
import EmptyState from '@/components/ui/EmptyState';
import userService from '@/services/userService';

export default function FollowListModal({ open, onClose, username, type }) {
  const { data, isLoading } = useQuery({
    queryKey: ['followList', type, username],
    queryFn: () =>
      (type === 'followers'
        ? userService.followers(username)
        : userService.following(username)
      ).then((r) => r.data.users),
    enabled: open,
  });

  return (
    <Modal open={open} onClose={onClose} title={type === 'followers' ? 'Followers' : 'Following'} size="md">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size={24} className="text-brand-600" />
        </div>
      ) : data?.length ? (
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          {data.map((u) => (
            <UserCard key={u._id} user={u} compact />
          ))}
        </div>
      ) : (
        <EmptyState
          title={type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
          description={type === 'followers' ? 'Share great posts to grow your audience.' : 'Discover people to follow in Explore.'}
        />
      )}
    </Modal>
  );
}
