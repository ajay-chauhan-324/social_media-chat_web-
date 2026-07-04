import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import postService from '@/services/postService';
import { postKeys } from './postKeys';

const fetchers = {
  feed: (page) => postService.feed(page),
  explore: (page) => postService.explore(page),
  bookmarks: (page) => postService.bookmarks(page),
};

/**
 * Infinite feed hook. `type` ∈ feed | explore | bookmarks | user | hashtag.
 * For user/hashtag pass `param` (username or tag).
 */
export const usePostFeed = (type, param, { enabled = true } = {}) => {
  const key =
    type === 'user'
      ? postKeys.user(param)
      : type === 'hashtag'
        ? postKeys.hashtag(param)
        : postKeys[type]();

  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam = 1 }) => {
      if (type === 'user') return postService.userPosts(param, pageParam);
      if (type === 'hashtag') return postService.hashtag(param, pageParam);
      return fetchers[type](pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      return meta?.hasMore ? meta.page + 1 : undefined;
    },
    enabled,
  });
};

/** Flatten infinite-query pages into a single posts array. */
export const flattenPosts = (data) => data?.pages.flatMap((p) => p.data.posts) ?? [];

export const usePost = (id) =>
  useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postService.getOne(id),
    enabled: Boolean(id),
  });

export const useTrending = () =>
  useQuery({ queryKey: postKeys.trending, queryFn: postService.trending, staleTime: 5 * 60 * 1000 });
