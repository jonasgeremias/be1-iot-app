import type { GetProps } from 'tamagui';
import { styled, XStack } from 'tamagui';

import { Text , MonoText } from './Text';

/**
 * Small label chip — the SCC / Ativo / status / MAC tags and filter pills.
 * `tone` maps to the soft-bg + colored-text pairs used in the prototype.
 */
const ChipFrame = styled(XStack, {
  name: 'Chip',
  ai: 'center',
  gap: '$6',
  px: '$8',
  py: '$3',
  br: '$6',

  variants: {
    tone: {
      brand: { bg: '$brandSoft' },
      online: { bg: '$onlineSoft' },
      amber: { bg: '$amberSoft' },
      red: { bg: '$redSoft' },
      neutral: { bg: '$surface3' },
    },
  } as const,

  defaultVariants: {
    tone: 'neutral',
  },
});

const TONE_COLOR = {
  brand: '$brand',
  online: '$online',
  amber: '$amber',
  red: '$red',
  neutral: '$text3',
} as const;

type Tone = keyof typeof TONE_COLOR;

type Props = GetProps<typeof ChipFrame> & {
  tone?: Tone;
  label: string;
  /** Render the label in JetBrains Mono (MAC addresses, codes). */
  mono?: boolean;
  fontWeight?: '600' | '700' | '800';
};

export function Chip({ tone = 'neutral', label, mono, fontWeight = '700', ...rest }: Props) {
  const Label = mono ? MonoText : Text;
  return (
    <ChipFrame tone={tone} {...rest}>
      <Label fontSize="$10" fontWeight={fontWeight} color={TONE_COLOR[tone]}>
        {label}
      </Label>
    </ChipFrame>
  );
}
