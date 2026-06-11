import { Search, SlidersHorizontal } from '@tamagui/lucide-icons';
import { Input as TamaguiInput, XStack } from 'tamagui';

import { IconButton } from '@/shared/ui/IconButton';

/**
 * Search row from the devices list: surface card, search icon, placeholder
 * input, trailing filter/sort icon.
 */
type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
};

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Pesquisar dispositivo…',
  onFilterPress,
}: Props) {
  return (
    <XStack
      ai="center"
      gap="$10"
      bg="$surface"
      borderWidth={1}
      borderColor="$border"
      br={14}
      px="$13"
      height={46}
      shadowColor="$shadowColor"
      shadowOpacity={1}
      shadowRadius={12}
      shadowOffset={{ width: 0, height: 4 }}
      elevation={2}
    >
      <Search size={18} color="$text3" />
      <TamaguiInput
        flex={1}
        unstyled
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="$text3"
        fontFamily="$body"
        fontSize="$13.5"
        color="$text"
        height="100%"
        accessibilityLabel="Pesquisar dispositivo"
      />
      <IconButton
        accessibilityLabel="Filtros"
        tone="brandSoft"
        size="sm"
        onPress={onFilterPress}
        bg="transparent"
      >
        <SlidersHorizontal size={18} color="$brand" />
      </IconButton>
    </XStack>
  );
}
