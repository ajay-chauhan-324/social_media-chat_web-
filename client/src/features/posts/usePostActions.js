import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import postService from '@/services/postService';
import { getErrorMessage } from '@/lib/axios';
import { postKeys } from './postKeys';

/** Apply a mutator to a post wherever it appears in any cached list/detail. */
const patchPostEverywhere = (qc, postId, mutate) => {
  // Infinite lists under ['posts', ...]
  qc.setQueriesData({ queryKey: postKeys.all }, (data) => {
    if (!data?.pages) return data;
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        data: {
          ...page.data,
          posts: page.data.posts.map((p) => (p._id === postId ? mutate(p) : p)),
        },
      })),
    };
  });
  // Single post detail
  qc.setQueryData(postKeys.detail(postId), (p) => (p ? mutate(p) : p));
};

export const useLikePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId) => postService.like(postId),
    onMutate: async (postId) => {
      await qc.cancelQueries({ queryKey: postKeys.all });
      patchPostEverywhere(qc, postId, (p) => ({
        ...p,
        isLiked: !p.isLiked,
        likesCount: p.likesCount + (p.isLiked ? -1 : 1),
      }));
    },
    onError: (err, postId) => {
      // Revert by re-toggling
      patchPostEverywhere(qc, postId, (p) => ({
        ...p,
        isLiked: !p.isLiked,
        likesCount: p.likesCount + (p.isLiked ? -1 : 1),
      }));
      toast.error(getErrorMessage(err));
    },
    onSuccess: (data, postId) => {
      // Reconcile with server truth (exact count).
      patchPostEverywhere(qc, postId, (p) => ({
        ...p,
        isLiked: data.liked,
        likesCount: data.likesCount,
      }));
    },
  });
};

export const useBookmarkPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId) => postService.bookmark(postId),
    onMutate: async (postId) => {
      await qc.cancelQueries({ queryKey: postKeys.all });
      patchPostEverywhere(qc, postId, (p) => ({ ...p, isBookmarked: !p.isBookmarked }));
    },
    onError: (err, postId) => {
      patchPostEverywhere(qc, postId, (p) => ({ ...p, isBookmarked: !p.isBookmarked }));
      toast.error(getErrorMessage(err));
    },
    onSuccess: (data) => {
      toast.success(data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
      qc.invalidateQueries({ queryKey: postKeys.bookmarks() });
    },
  });
};

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => postService.create(formData),
    onSuccess: () => {
      toast.success('Post published!');
      qc.invalidateQueries({ queryKey: postKeys.feed() });
      qc.invalidateQueries({ queryKey: postKeys.explore() });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId) => postService.remove(postId),
    onSuccess: () => {
      toast.success('Post deleted');
      qc.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => postService.update(id, payload),
    onSuccess: (post) => {
      toast.success('Post updated');
      patchPostEverywhere(qc, post._id, () => post);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
};
