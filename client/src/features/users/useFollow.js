import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import userService from '@/services/userService';
import { getErrorMessage } from '@/lib/axios';
import { postKeys } from '@/features/posts/postKeys';

export const useSuggestions = (limit = 5) =>
  useQuery({
    queryKey: postKeys.suggestions,
    queryFn: () => userService.suggestions(limit),
    staleTime: 5 * 60 * 1000,
  });

/** Toggle follow for a username; optimistically flips profile + suggestion caches. */
export const useToggleFollow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ username, isFollowing }) =>
      isFollowing ? userService.unfollow(username) : userService.follow(username),
    onMutate: async ({ username, isFollowing }) => {
      await qc.cancelQueries({ queryKey: ['user', username] });
      qc.setQueryData(['user', username], (u) =>
        u
          ? {
              ...u,
              isFollowing: !isFollowing,
              followersCount: u.followersCount + (isFollowing ? -1 : 1),
            }
          : u
      );
      // Update suggestion list flags
      qc.setQueryData(postKeys.suggestions, (list) =>
        list?.map((u) => (u.username === username ? { ...u, isFollowing: !isFollowing } : u))
      );
    },
    onError: (err) => toast.error(getErrorMessage(err)),
    onSuccess: (_data, { username }) => {
      qc.invalidateQueries({ queryKey: postKeys.feed() });
      qc.invalidateQueries({ queryKey: ['user', username] });
    },
  });
};
