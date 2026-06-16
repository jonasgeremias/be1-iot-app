import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';
import type { Notification } from '@/services/notifications/notification.schema';
import { notificationsService } from '@/services/notifications/notifications.service';

/** Notifications list + derived unread count for the header badge. */
export function useNotifications() {
  const query = useQuery({
    queryKey: queryKeys.notifications.list,
    queryFn: () => notificationsService.list(),
  });
  const unreadCount = query.data?.filter((n: Notification) => !n.read).length ?? 0;
  return { ...query, unreadCount };
}
