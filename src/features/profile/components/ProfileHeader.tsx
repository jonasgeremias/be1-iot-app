import { XStack, YStack } from 'tamagui';

import { Avatar } from '@/shared/ui/Avatar';
import { Text } from '@/shared/ui/Text';

import type { Profile } from '../schemas/profile.schema';

/** Avatar + name + role chip block at the top of the profile screen. */
export function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <YStack ai="center" gap="$8" pt="$6" pb="$2">
      <Avatar
        initials={profile.monogram}
        size={82}
        radius={26}
        fontSize={28}
        showStatusDot
      />
      <Text fontSize="$19" fontWeight="800" color="$text" letterSpacing={-0.3}>
        {profile.name}
      </Text>
      <XStack ai="center" gap="$7">
        <XStack bg="$brandSoft" px="$10" py="$4" br={8}>
          <Text fontSize="$11" fontWeight="800" color="$brand">
            {profile.role}
          </Text>
        </XStack>
        <Text fontSize="$11.5" color="$text3">
          {profile.location}
        </Text>
      </XStack>
    </YStack>
  );
}
