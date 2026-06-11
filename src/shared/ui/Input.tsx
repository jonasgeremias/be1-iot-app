import type { ReactNode } from 'react';
import { Input as TamaguiInput, XStack } from 'tamagui';

import { Text } from './Text';

/**
 * Labeled text field — icon + input row from login/forgot/profile, matching
 * `background:var(--surface-2);border:1px solid var(--border);radius:13px;h48`.
 * Renders a real RN TextInput so it works with React Hook Form.
 */
type Props = {
  label?: string;
  icon?: ReactNode;
  /** Trailing node (e.g. password visibility toggle). */
  iconAfter?: ReactNode;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  accessibilityLabel: string;
  /** Surface tone — login uses surface-2, forgot uses surface. */
  tone?: '$surface' | '$surface2';
};

export function Input({
  label,
  icon,
  iconAfter,
  value,
  onChangeText,
  onBlur,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  accessibilityLabel,
  tone = '$surface2',
}: Props) {
  return (
    <>
      {label ? (
        <Text
          fontSize="$10.5"
          fontWeight="700"
          color="$text2"
          textTransform="uppercase"
          letterSpacing={0.6}
          mb="$8"
        >
          {label}
        </Text>
      ) : null}
      <XStack
        ai="center"
        gap="$10"
        bg={tone}
        borderWidth={1}
        borderColor="$border"
        br={13}
        px="$13"
        height={48}
      >
        {icon}
        <TamaguiInput
          flex={1}
          unstyled
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor="$text3"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          accessibilityLabel={accessibilityLabel}
          fontFamily="$body"
          fontSize="$14"
          fontWeight="500"
          color="$text"
          height="100%"
        />
        {iconAfter}
      </XStack>
    </>
  );
}
