import { styled, Text as TamaguiText } from 'tamagui';

/**
 * Base text — Plus Jakarta Sans, default body color. All copy in the app uses
 * this (or `MonoText`) so font + token color are never hardcoded.
 */
export const Text = styled(TamaguiText, {
  name: 'Text',
  fontFamily: '$body',
  color: '$text',
});

/** JetBrains Mono — telemetry values, MAC addresses, timestamps, counters. */
export const MonoText = styled(TamaguiText, {
  name: 'MonoText',
  fontFamily: '$mono',
  color: '$text',
});
