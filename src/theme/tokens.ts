import { createTokens } from 'tamagui';

/**
 * Pixel-faithful scales captured 1:1 from the design prototype
 * (`design/melhoria-visual-app/project/BE1 App.dc.html`).
 *
 * Tokens are keyed by their pixel value so screens stay pixel-perfect while
 * still consuming tokens only (never loose style literals) — e.g. `$13`, `$r18`.
 */

// Spacing / sizing scale (px). Keyed by value for exact, token-based layout.
const space = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
  15: 15,
  16: 16,
  18: 18,
  20: 20,
  22: 22,
  24: 24,
  26: 26,
  28: 28,
  30: 30,
  34: 34,
  38: 38,
  40: 40,
  42: 42,
  46: 46,
  48: 48,
  50: 50,
  52: 52,
  60: 60,
  74: 74,
  82: 82,
  true: 16,
} as const;

// Sizes reuse the spacing scale plus a few component-specific dimensions.
const size = {
  ...space,
  phone: 370,
  chartSm: 58,
  chartMd: 92,
  chartLg: 104,
} as const;

// Corner radii observed across cards, chips, inputs, buttons and the device frame.
const radius = {
  0: 0,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
  15: 15,
  16: 16,
  18: 18,
  20: 20,
  22: 22,
  26: 26,
  38: 38,
  48: 48,
  full: 9999,
  true: 12,
} as const;

const zIndex = {
  0: 0,
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
  true: 0,
} as const;

/**
 * Theme-independent palette. Theme-dependent semantic colors live in
 * `themes.ts`; this only holds fixed brand/utility colors used on gradients
 * and other always-on-dark surfaces.
 */
const color = {
  white: '#FFFFFF',
  black: '#000000',
  whiteA82: 'rgba(255,255,255,.82)',
  whiteA78: 'rgba(255,255,255,.78)',
  whiteA50: 'rgba(255,255,255,.5)',
  whiteA45: 'rgba(255,255,255,.45)',
  whiteA20: 'rgba(255,255,255,.2)',
  whiteA16: 'rgba(255,255,255,.16)',
  whiteA13: 'rgba(255,255,255,.13)',
  whatsapp: '#25D366',
  whatsappInk: '#1FA855',
  // Fixed slide-tag colors (always shown over the brand gradient).
  tagGreen: '#16A66A',
  tagAmber: '#E8930C',
  // Muted gray used for offline temperature cells in the device mini-grid.
  cellMuted: '#8694A6',
  // Always-on brand gradient stops (identical in both themes in the prototype).
  gradFrom: '#1E72D6',
  gradTo: '#0B3C84',
} as const;

export const tokens = createTokens({
  color,
  space,
  size,
  radius,
  zIndex,
});
