import { createAnimations } from '@tamagui/animations-react-native';

/**
 * Spring/timing presets used for the prototype's micro-interactions:
 * carousel slides, tab-chip background fades, button press feedback,
 * status-dot pulses (the latter handled with Reanimated where infinite).
 */
export const animations = createAnimations({
  fast: { type: 'spring', damping: 20, mass: 1, stiffness: 250 },
  medium: { type: 'spring', damping: 18, mass: 1, stiffness: 180 },
  slow: { type: 'spring', damping: 20, mass: 1, stiffness: 110 },
  bouncy: { type: 'spring', damping: 12, mass: 0.9, stiffness: 200 },
  quick: { type: 'timing', duration: 200 },
});
