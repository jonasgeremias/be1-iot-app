import type { ReactNode } from 'react';
import type { GetProps } from 'tamagui';
import { styled, XStack } from 'tamagui';

import { Text } from './Text';

/**
 * Primary CTA + outline/ghost buttons from the prototype:
 *  - primary: brand fill, white label, brand glow shadow, h50/r14
 *  - outline: surface bg, border-2 hairline, text label, h48/r14
 */
const ButtonFrame = styled(XStack, {
  name: 'Button',
  ai: 'center',
  jc: 'center',
  gap: '$9',
  br: '$14',
  px: '$16',
  height: 50,
  cursor: 'pointer',
  animation: 'quick',
  pressStyle: { opacity: 0.9, scale: 0.985 },

  variants: {
    variant: {
      primary: {
        bg: '$brand',
        shadowColor: '$brand',
        shadowOpacity: 0.45,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      },
      outline: {
        bg: '$surface',
        borderWidth: 1,
        borderColor: '$border2',
        height: 48,
      },
      ghost: {
        bg: 'transparent',
        height: 48,
      },
    },
    block: {
      true: { alignSelf: 'stretch' },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    block: true,
  },
});

type Variant = 'primary' | 'outline' | 'ghost';

type Props = GetProps<typeof ButtonFrame> & {
  variant?: Variant;
  children: ReactNode;
  /** Leading icon node. */
  icon?: ReactNode;
  /** Trailing icon node (e.g. arrow on "Entrar"). */
  iconAfter?: ReactNode;
};

export function Button({ variant = 'primary', children, icon, iconAfter, ...rest }: Props) {
  const color = variant === 'primary' ? '$white' : '$text';
  const fontSize = variant === 'primary' ? '$15' : '$13.5';
  return (
    <ButtonFrame variant={variant} accessibilityRole="button" {...rest}>
      {icon}
      <Text color={color} fontWeight="700" fontSize={fontSize}>
        {children}
      </Text>
      {iconAfter}
    </ButtonFrame>
  );
}
