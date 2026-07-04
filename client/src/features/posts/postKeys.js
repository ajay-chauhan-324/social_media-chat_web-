/** Centralized query keys so caches invalidate consistently. */
export const postKeys = {
  all: ['posts'],
  feed: () => ['posts', 'feed'],
  explore: () => ['posts', 'explore'],
  bookmarks: () => ['posts', 'bookmarks'],
  user: (username) => ['posts', 'user', username],
  hashtag: (tag) => ['posts', 'hashtag', tag],
  detail: (id) => ['post', id],
  comments: (postId) => ['comments', postId],
  replies: (commentId) => ['replies', commentId],
  trending: ['trending'],
  suggestions: ['suggestions'],
};
