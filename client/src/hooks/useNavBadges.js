import { useConversations } from '@/features/chat/useChat';
import { useUnreadNotifications } from '@/features/notifications/useNotifications';

/**
 * Single source of truth for the unread badge counts shown in navigation
 * (desktop Sidebar, mobile bottom nav + header). React Query dedupes the
 * underlying requests, so calling this from several components is cheap.
 */
export function useNavBadges() {
  const { data: conversations } = useConversations();
  const { data: unreadNotifs } = useUnreadNotifications();

  const unreadMessages = (conversations || []).reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

  return { unreadMessages, unreadNotifications: unreadNotifs || 0 };
}
