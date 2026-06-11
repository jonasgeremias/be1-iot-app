import { createFont } from 'tamagui';

/**
 * Two type families from the prototype:
 *  - Plus Jakarta Sans  → all UI text (weights 400–800)
 *  - JetBrains Mono     → telemetry, numbers, MAC addresses, timestamps
 *
 * Font face names map to the keys registered with `useFonts` in the root
 * layout (see `app/_layout.tsx`). Size keys are pixel-valued to stay faithful
 * to the prototype's exact type sizes.
 */

// Exact font sizes observed in the prototype.
const sizes = [
  9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 16, 16.5, 17,
  18, 19, 20, 21, 23, 25, 28, 34,
] as const;

function buildScale(ratio: number) {
  const size: Record<string, number> = {};
  const lineHeight: Record<string, number> = {};
  for (const s of sizes) {
    const key = String(s);
    size[key] = s;
    lineHeight[key] = Math.round(s * ratio);
  }
  // Tamagui needs a `true` (default) entry.
  size.true = 14;
  lineHeight.true = Math.round(14 * ratio);
  return { size, lineHeight };
}

const jakarta = buildScale(1.3);
const mono = buildScale(1.25);

const weight = {
  true: '400',
  400: '400',
  500: '500',
  600: '600',
  700: '700',
  800: '800',
} as const;

const letterSpacing = {
  true: 0,
} as const;

export const bodyFont = createFont({
  family: 'PlusJakartaSans_400Regular',
  size: jakarta.size,
  lineHeight: jakarta.lineHeight,
  weight,
  letterSpacing,
  face: {
    400: { normal: 'PlusJakartaSans_400Regular' },
    500: { normal: 'PlusJakartaSans_500Medium' },
    600: { normal: 'PlusJakartaSans_600SemiBold' },
    700: { normal: 'PlusJakartaSans_700Bold' },
    800: { normal: 'PlusJakartaSans_800ExtraBold' },
  },
});

export const monoFont = createFont({
  family: 'JetBrainsMono_400Regular',
  size: mono.size,
  lineHeight: mono.lineHeight,
  weight,
  letterSpacing,
  face: {
    400: { normal: 'JetBrainsMono_400Regular' },
    500: { normal: 'JetBrainsMono_500Medium' },
    600: { normal: 'JetBrainsMono_600SemiBold' },
    700: { normal: 'JetBrainsMono_700Bold' },
    800: { normal: 'JetBrainsMono_700Bold' },
  },
});
