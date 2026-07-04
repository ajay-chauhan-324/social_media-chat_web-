import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useToggleFollow } from '@/features/users/useFollow';
import { cn } from '@/lib/cn';

export default function FollowButton({ username, isFollowing, size = 'sm', className }) {
  const toggle = useToggleFollow();
  const [hover, setHover] = useState(false);

  const label = isFollowing ? (hover ? 'Unfollow' : 'Following') : 'Follow';

  return (
    <Button
      size={size}
      variant={isFollowing ? 'secondary' : 'gradient'}
      loading={toggle.isPending}
      onClick={() => toggle.mutate({ username, isFollowing })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(isFollowing && hover && 'border-danger text-danger', className)}
    >
      {label}
    </Button>
  );
}
