import { View } from 'tamagui';

import { BrandGradient } from './BrandGradient';
import { MonoText } from './Text';

/**
 * Gradient monogram avatar (e.g. "TB"). Optional online dot for the profile
 * header. Sizes follow the prototype: 42 (header) and 82 (profile).
 */
type Props = {
  initials: string;
  size?: number;
  radius?: number;
  fontSize?: number;
  showStatusDot?: boolean;
};

export function Avatar({
  initials,
  size = 42,
  radius = 13,
  fontSize = 14,
  showStatusDot = false,
}: Props) {
  return (
    <View width={size} height={size} position="relative">
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
    </View>
  );
}
