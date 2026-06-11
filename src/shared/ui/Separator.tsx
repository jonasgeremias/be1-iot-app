import { styled, View } from 'tamagui';

/** 1px hairline divider (`height:1px;background:var(--border)`). */
export const Separator = styled(View, {
  name: 'Separator',
  height: 1,
  backgroundColor: '$border',
  alignSelf: 'stretch',
});
