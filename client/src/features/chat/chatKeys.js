export const chatKeys = {
  conversations: ['conversations'],
  messages: (conversationId) => ['messages', conversationId],
  pinned: (conversationId) => ['pinned', conversationId],
};
