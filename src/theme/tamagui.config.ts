import { createTamagui } from 'tamagui';

import { shorthands } from './shorthands';
import { animations } from './animations';
import { bodyFont, monoFont } from './fonts';
import { themes } from './themes';
import { tokens } from './tokens';

export const config = createTamagui({
  animations,
  shorthands,
  fonts: {
    body: bodyFont,
    heading: bodyFont,
    mono: monoFont,
  },
  themes,
  tokens,
  defaultFont: 'body',
  settings: {
    // Default (permissive) style values: semantic colors + spacing come from
    // tokens, while exact one-off component dimensions from the prototype are
    // kept as literal px for pixel-perfect fidelity.
    fastSchemeChange: true,
  },
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
