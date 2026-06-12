import { Check, ChevronDown, Search } from '@tamagui/lucide-icons';
import { useMemo, useState } from 'react';
import { FlatList, Modal } from 'react-native';
import { Input as TamaguiInput, Spinner, View, XStack, YStack } from 'tamagui';

import { Card } from './Card';
import { Text } from './Text';

export type SelectOption = { value: string; label: string };

type Props = {
  label?: string;
  value?: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
};

/** Searchable select (trigger row + modal list) — covers state/city pickers. */
export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecione',
  searchable = true,
  loading = false,
  disabled = false,
  accessibilityLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <YStack>
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
        bg="$surface2"
        borderWidth={1}
        borderColor="$border"
        br={13}
        px="$13"
        height={48}
        opacity={disabled ? 0.6 : 1}
        onPress={disabled ? undefined : () => setOpen(true)}
        cursor={disabled ? undefined : 'pointer'}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text flex={1} fontSize="$14" color={selectedLabel ? '$text' : '$text3'} numberOfLines={1}>
          {selectedLabel ?? placeholder}
        </Text>
        {loading ? <Spinner color="$brand" /> : <ChevronDown size={18} color="$text3" />}
      </XStack>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View flex={1} bg="rgba(0,0,0,0.45)" jc="flex-end" onPress={close}>
          <Card br={20} elevated m="$12" maxHeight="70%" onPress={(e) => e.stopPropagation()}>
            {searchable ? (
              <XStack
                ai="center"
                gap="$10"
                bg="$surface2"
                borderWidth={1}
                borderColor="$border"
                br={12}
                px="$12"
                height={44}
                m="$12"
              >
                <Search size={18} color="$text3" />
                <TamaguiInput
                  flex={1}
                  unstyled
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Procurar…"
                  placeholderTextColor="$text3"
                  fontFamily="$body"
                  fontSize="$14"
                  color="$text"
                  height="100%"
                  accessibilityLabel="Procurar"
                />
              </XStack>
            ) : null}

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <XStack
                    ai="center"
                    jc="space-between"
                    px="$16"
                    py="$13"
                    bg={active ? '$brandSoft' : 'transparent'}
                    onPress={() => {
                      onChange(item.value);
                      close();
                    }}
                    cursor="pointer"
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <Text
                      fontSize="$14"
                      color={active ? '$brand' : '$text'}
                      fontWeight={active ? '700' : '500'}
                    >
                      {item.label}
                    </Text>
                    {active ? <Check size={18} color="$brand" /> : null}
                  </XStack>
                );
              }}
              ListEmptyComponent={
                <Text fontSize="$13" color="$text3" ta="center" py="$20">
                  {loading ? 'Carregando…' : 'Nenhum resultado'}
                </Text>
              }
            />
          </Card>
        </View>
      </Modal>
    </YStack>
  );
}
