/**
 * Light & dark themes — exact values from the prototype's token script
 * (the `tokens(theme)` function in `BE1 App.dc.html`).
 *
 * Semantic keys (e.g. `surface`, `text2`, `brandSoft`) are consumed throughout
 * the design system. Standard Tamagui keys (`background`, `color`, `borderColor`,
 * …) are also provided so built-in component behavior stays consistent.
 */

const light = {
  // semantic — surfaces
  canvas: '#E7EAF1',
  bg: '#F1F4F9',
  surface: '#FFFFFF',
  surface2: '#F4F7FB',
  surface3: '#EAF0F8',
  // semantic — text
  text: '#0E1A2B',
  text2: '#506377',
  text3: '#8A99AC',
  // semantic — lines
  border: '#E5EBF3',
  border2: '#D3DDEA',
  track: '#E9EEF5',
  // semantic — brand
  brand: '#1366C9',
  brand2: '#0E4E9E',
  brandSoft: '#E7F0FD',
  brandGrad1: '#1E72D6',
  brandGrad2: '#0B3C84',
  // semantic — status
  online: '#16A66A',
  onlineSoft: '#E3F4EC',
  amber: '#E08A0B',
  amberSoft: '#FBEFD6',
  red: '#E04A3F',
  redSoft: '#FBE7E5',

  // standard Tamagui keys
  background: '#F1F4F9',
  backgroundHover: '#EAF0F8',
  backgroundPress: '#EAF0F8',
  backgroundFocus: '#F4F7FB',
  backgroundStrong: '#FFFFFF',
  backgroundTransparent: 'rgba(255,255,255,0)',
  color: '#0E1A2B',
  colorHover: '#0E1A2B',
  colorPress: '#0E1A2B',
  colorFocus: '#0E1A2B',
  colorTransparent: 'rgba(14,26,43,0)',
  borderColor: '#E5EBF3',
  borderColorHover: '#D3DDEA',
  borderColorPress: '#D3DDEA',
  borderColorFocus: '#1366C9',
  placeholderColor: '#8A99AC',
  shadowColor: 'rgba(13,38,76,0.14)',
  shadowColorHover: 'rgba(13,38,76,0.18)',
} as const;

const dark = {
  canvas: '#080C14',
  bg: '#0B1525',
  surface: '#102035',
  surface2: '#14253E',
  surface3: '#1A2E4B',
  text: '#EAF1FB',
  text2: '#9CB0CB',
  text3: '#65799A',
  border: '#1F3355',
  border2: '#2A4670',
  track: '#1C2F4B',
  brand: '#4A95EC',
  brand2: '#2E7BDB',
  brandSoft: '#15315A',
  brandGrad1: '#1E72D6',
  brandGrad2: '#0A2E64',
  online: '#2ECC82',
  onlineSoft: '#123426',
  amber: '#F0A93A',
  amberSoft: '#3A2B12',
  red: '#F26A60',
  redSoft: '#3A1D1B',

  background: '#0B1525',
  backgroundHover: '#14253E',
  backgroundPress: '#14253E',
  backgroundFocus: '#1A2E4B',
  backgroundStrong: '#102035',
  backgroundTransparent: 'rgba(11,21,37,0)',
  color: '#EAF1FB',
  colorHover: '#EAF1FB',
  colorPress: '#EAF1FB',
  colorFocus: '#EAF1FB',
  colorTransparent: 'rgba(234,241,251,0)',
  borderColor: '#1F3355',
  borderColorHover: '#2A4670',
  borderColorPress: '#2A4670',
  borderColorFocus: '#4A95EC',
  placeholderColor: '#65799A',
  shadowColor: 'rgba(0,0,0,0.6)',
  shadowColorHover: 'rgba(0,0,0,0.7)',
} as const;

export const themes = { light, dark };

export type AppTheme = typeof light;
