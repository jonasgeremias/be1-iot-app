import { Image } from 'react-native';
import { View } from 'tamagui';

import { BrandGradient } from './BrandGradient';
import { MonoText, Text } from './Text';

/**
 * Avatar: a photo when `imageUrl` is set, otherwise a gradient monogram
 * (e.g. "TB"). Optional online dot for the profile header, or a count badge
 * (unread notifications) when used as the header profile button.
 */
type Props = {
  initials: string;
  imageUrl?: string | null;
  size?: number;
  radius?: number;
  fontSize?: number;
  showStatusDot?: boolean;
  /** Red count badge in the top-right corner (hidden when 0/undefined). */
  badgeCount?: number;
};

export function Avatar({
  initials,
  imageUrl,
  size = 42,
  radius = 13,
  fontSize = 14,
  showStatusDot = false,
  badgeCount,
}: Props) {
  return (
    <View width={size} height={size} position="relative">
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: radius }}
          accessibilityLabel="Foto de perfil"
        />
      ) : (
        <BrandGradient
          from="brandGrad1"
          to="brandGrad2"
          start={[0.15, 0]}
          end={[0.85, 1]}
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MonoText color="$white" fontWeight="800" fontSize={fontSize}>
            {initials}
          </MonoText>
        </BrandGradient>
      )}
      {showStatusDot ? (
        <View
          position="absolute"
          bottom={-2}
          right={-2}
          width={22}
          height={22}
          br={11}
          bg="$online"
          borderWidth={3}
          borderColor="$bg"
        />
      ) : null}
      {badgeCount && badgeCount > 0 ? (
        <View
          position="absolute"
          top={-5}
          right={-5}
          minWidth={18}
          height={18}
          br={9}
          px={4}
          bg="$red"
          ai="center"
          jc="center"
          borderWidth={2}
          borderColor="$bg"
        >
          <Text color="$white" fontSize={10} fontWeight="800" lineHeight={14}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
