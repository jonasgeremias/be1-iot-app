import { useRouter } from 'expo-router';
import { View } from 'tamagui';

import { useCurrentUserName } from '@/hooks/useCurrentUserName';
import { useNotifications } from '@/hooks/useNotifications';
import { Avatar } from '@/shared/ui/Avatar';
import { monogramOf } from '@/utils/format.util';

type Props = {
  size?: number;
  radius?: number;
};

/**
 * Header profile button: the user's avatar with an unread-notifications badge,
 * navigating to the profile screen. Replaces the removed bottom tab bar as the
 * fixed entry point to Perfil on every non-profile screen.
 */
export function ProfileButton({ size = 40, radius = 12 }: Props) {
  const router = useRouter();
  const userName = useCurrentUserName();
  const { unreadCount } = useNotifications();
  const monogram = userName?.trim() ? monogramOf(userName) : '–';

  return (
    <View
      onPress={() => router.push('/(main)/profile')}
      accessibilityRole="button"
      accessibilityLabel="Abrir perfil"
      cursor="pointer"
      pressStyle={{ opacity: 0.8 }}
      flexShrink={0}
    >
      <Avatar
        initials={monogram}
        size={size}
        radius={radius}
        fontSize={Math.round(size * 0.33)}
        badgeCount={unreadCount}
      />
    </View>
  );
}
