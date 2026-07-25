import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import conversationService from '@/services/conversationService';
import messageService from '@/services/messageService';
import { getErrorMessage } from '@/lib/axios';
import { chatKeys } from './chatKeys';

export const useConversations = () =>
  useQuery({
    queryKey: chatKeys.conversations,
    queryFn: conversationService.list,
    staleTime: 30 * 1000,
  });

export const useConversation = (id) =>
  useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationService.getOne(id),
    enabled: Boolean(id),
  });

/** Infinite message history. Page 1 = newest; older pages load on scroll-up. */
export const useMessages = (conversationId) =>
  useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: ({ pageParam = 1 }) => messageService.history(conversationId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta?.hasMore ? last.meta.page + 1 : undefined),
    enabled: Boolean(conversationId),
  });

/** Flatten pages oldest→newest (pages arrive newest-first). */
export const flattenMessages = (data) =>
  data ? [...data.pages].reverse().flatMap((p) => p.data.messages) : [];

export const useSendMessage = (conversationId) =>
  useMutation({
    mutationFn: (formData) => messageService.send(conversationId, formData),
    // The realtime 'message:new' event handles cache insertion (incl. our own echo).
    onError: (err) => toast.error(getErrorMessage(err)),
  });

export const useEditMessage = () =>
  useMutation({
    mutationFn: ({ id, content }) => messageService.edit(id, content),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

export const useDeleteMessage = () =>
  useMutation({
    mutationFn: (id) => messageService.remove(id),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

export const usePinMessage = () =>
  useMutation({
    mutationFn: (id) => messageService.pin(id),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

export const useReactMessage = () =>
  useMutation({
    // The realtime 'message:updated' event patches the reaction into cache.
    mutationFn: ({ id, emoji }) => messageService.react(id, emoji),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

export const useStartPrivate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username) => conversationService.startPrivate(username),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.conversations }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

export const useCreateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => conversationService.createGroup(payload),
    onSuccess: () => {
      toast.success('Group created');
      qc.invalidateQueries({ queryKey: chatKeys.conversations });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

// ── Public rooms ─────────────────────────────────────────────────────────────

export const useRooms = () =>
  useQuery({ queryKey: chatKeys.rooms, queryFn: conversationService.listRooms, staleTime: 15 * 1000 });

export const useCreateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => conversationService.createRoom(payload),
    onSuccess: () => {
      toast.success('Room created');
      qc.invalidateQueries({ queryKey: chatKeys.rooms });
      qc.invalidateQueries({ queryKey: chatKeys.conversations });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

/** Leave a public room (unlike delete, this only removes the caller, not everyone). */
export const useLeaveRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => conversationService.leave(id),
    onSuccess: (_data, id) => {
      qc.setQueryData(chatKeys.conversations, (list) => list?.filter((c) => c._id !== id));
      qc.invalidateQueries({ queryKey: chatKeys.rooms });
      qc.removeQueries({ queryKey: chatKeys.messages(id) });
      qc.removeQueries({ queryKey: ['conversation', id] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

export const useJoinRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => conversationService.joinRoom(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chatKeys.rooms });
      qc.invalidateQueries({ queryKey: chatKeys.conversations });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

/** Delete a whole conversation (both members lose it). Updates caches instantly. */
export const useDeleteConversation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => conversationService.remove(id),
    onSuccess: ({ conversationId }) => {
      qc.setQueryData(chatKeys.conversations, (list) =>
        list?.filter((c) => c._id !== conversationId)
      );
      qc.removeQueries({ queryKey: chatKeys.messages(conversationId) });
      qc.removeQueries({ queryKey: ['conversation', conversationId] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

/** Mark a conversation read locally + on server, and clear its unread badge. */
export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => conversationService.markRead(id),
    onMutate: (id) => {
      qc.setQueryData(chatKeys.conversations, (list) =>
        list?.map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c))
      );
    },
  });
};
