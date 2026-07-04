import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '@/services/notificationService';

export const notifKeys = {
  list: ['notifications'],
  unread: ['notifications', 'unread'],
};

export const useNotifications = () =>
  useInfiniteQuery({
    queryKey: notifKeys.list,
    queryFn: ({ pageParam = 1 }) => notificationService.list(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta?.hasMore ? last.meta.page + 1 : undefined),
  });

export const flattenNotifications = (data) =>
  data?.pages.flatMap((p) => p.data.notifications) ?? [];

export const useUnreadNotifications = () =>
  useQuery({
    queryKey: notifKeys.unread,
    queryFn: notificationService.unreadCount,
    staleTime: 30 * 1000,
  });

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      qc.setQueryData(notifKeys.unread, 0);
      qc.invalidateQueries({ queryKey: notifKeys.list });
    },
  });
};
