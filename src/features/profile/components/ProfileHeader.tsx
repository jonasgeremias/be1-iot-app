import { Camera } from '@tamagui/lucide-icons';
import { View, XStack, YStack } from 'tamagui';

import { Avatar } from '@/shared/ui/Avatar';
import { Text } from '@/shared/ui/Text';

type Props = {
  name: string;
  role: string;
  location: string;
  monogram: string;
  imageUrl?: string | null;
  onEditAvatar?: () => void;
};

/** Avatar + name + role chip block at the top of the profile screen. */
export function ProfileHeader({
  name,
  role,
  location,
  monogram,
  imageUrl,
  onEditAvatar,
}: Props) {
  return (
    <YStack ai="center" gap="$8" pt="$6" pb="$2">
      <View position="relative">
        <Avatar
          initials={monogram}
          imageUrl={imageUrl}
          size={82}
          radius={26}
          fontSize={28}
          showStatusDot
        />
        {onEditAvatar ? (
          <View
            position="absolute"
            bottom={-2}
            left={-2}
            width={28}
            height={28}
            br={14}
            bg="$brand"
            ai="center"
            jc="center"
            borderWidth={3}
            borderColor="$bg"
            onPress={onEditAvatar}
            cursor="pointer"
            pressStyle={{ opacity: 0.8 }}
            accessibilityRole="button"
            accessibilityLabel="Trocar foto"
          >
            <Camera size={13} color="$white" />
          </View>
        ) : null}
      </View>
      <Text fontSize="$19" fontWeight="800" color="$text" letterSpacing={-0.3}>
        {name}
      </Text>
      <XStack ai="center" gap="$7">
        <XStack bg="$brandSoft" px="$10" py="$4" br={8}>
          <Text fontSize="$11" fontWeight="800" color="$brand">
            {role}
          </Text>
        </XStack>
        {location ? (
          <Text fontSize="$11.5" color="$text3">
            {location}
          </Text>
        ) : null}
      </XStack>
    </YStack>
  );
}
