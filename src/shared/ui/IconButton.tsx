import type { ReactNode } from 'react';
import type { GetProps } from 'tamagui';
import { styled, XStack } from 'tamagui';

/**
 * Square icon button — back chevron, settings, edit, header actions.
 * Tones mirror the prototype: neutral surface, soft brand, solid brand.
 */
const Frame = styled(XStack, {
  name: 'IconButton',
  ai: 'center',
  jc: 'center',
  width: 38,
  height: 38,
  br: '$12',
  cursor: 'pointer',
  animation: 'quick',
  pressStyle: { opacity: 0.85, scale: 0.96 },

  variants: {
    tone: {
      surface: {
        bg: '$surface',
        borderWidth: 1,
        borderColor: '$border',
        shadowColor: '$shadowColor',
        shadowOpacity: 1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      },
      brandSoft: { bg: '$brandSoft' },
      brand: {
        bg: '$brand',
        shadowColor: '$brand',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
      },
    },
    size: {
      sm: { width: 34, height: 34, br: '$10' },
      md: { width: 38, height: 38, br: '$12' },
      lg: { width: 42, height: 42, br: '$13' },
    },
  } as const,

  defaultVariants: {
    tone: 'surface',
    size: 'md',
  },
});

type Props = GetProps<typeof Frame> & {
  children: ReactNode;
  accessibilityLabel: string;
};

export function IconButton({ children, accessibilityLabel, ...rest }: Props) {
  return (
    <Frame
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      {...rest}
    >
      {children}
    </Frame>
  );
}
