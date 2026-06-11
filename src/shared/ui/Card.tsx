import { styled, YStack } from 'tamagui';

/**
 * Surface card — the prototype's repeated `background:var(--surface);border:1px
 * solid var(--border);border-radius:18px;box-shadow:var(--shadow)` block.
 * Radius is a variant because the design uses 15/16/18/20 in different places.
 */
export const Card = styled(YStack, {
  name: 'Card',
  backgroundColor: '$surface',
  borderWidth: 1,
  borderColor: '$border',
  borderRadius: '$18',
  overflow: 'hidden',

  variants: {
    radius: {
      15: { borderRadius: '$15' },
      16: { borderRadius: '$16' },
      18: { borderRadius: '$18' },
      20: { borderRadius: '$20' },
      22: { borderRadius: '$22' },
    },
    elevated: {
      true: {
        shadowColor: '$shadowColor',
        shadowOpacity: 1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 4,
      },
    },
  } as const,

  defaultVariants: {
    elevated: true,
  },
});
