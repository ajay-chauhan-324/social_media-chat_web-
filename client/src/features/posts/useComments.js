import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import commentService from '@/services/commentService';
import { getErrorMessage } from '@/lib/axios';
import { postKeys } from './postKeys';

export const useComments = (postId) =>
  useInfiniteQuery({
    queryKey: postKeys.comments(postId),
    queryFn: ({ pageParam = 1 }) => commentService.list(postId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta?.hasMore ? last.meta.page + 1 : undefined),
    enabled: Boolean(postId),
  });

export const flattenComments = (data) => data?.pages.flatMap((p) => p.data.comments) ?? [];

export const useAddComment = (postId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => commentService.add(postId, payload),
    onSuccess: (comment) => {
      // Only refetch the thread for top-level comments; replies handled locally.
      if (!comment.parent) qc.invalidateQueries({ queryKey: postKeys.comments(postId) });
      // Bump the post's comment count in every cache.
      qc.setQueriesData({ queryKey: postKeys.all }, (data) => {
        if (!data?.pages) return data;
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              posts: page.data.posts.map((p) =>
                p._id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
              ),
            },
          })),
        };
      });
      qc.setQueryData(postKeys.detail(postId), (p) =>
        p ? { ...p, commentsCount: p.commentsCount + 1 } : p
      );
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

export const useDeleteComment = (postId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => commentService.remove(commentId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: postKeys.comments(postId) });
      qc.setQueryData(postKeys.detail(postId), (p) =>
        p ? { ...p, commentsCount: Math.max(0, p.commentsCount - (data.removedCount || 1)) } : p
      );
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

export const useLikeComment = () =>
  useMutation({
    mutationFn: (commentId) => commentService.like(commentId),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
