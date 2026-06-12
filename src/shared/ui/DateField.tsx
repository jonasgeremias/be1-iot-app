import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Modal, Platform } from 'react-native';
import { View, XStack, YStack } from 'tamagui';

import { Button } from './Button';
import { Card } from './Card';
import { Text } from './Text';

const pad2 = (n: number) => String(n).padStart(2, '0');
const fmtDmy = (d: Date) =>
  `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;

type Props = {
  label?: string;
  value: Date | null;
  onChange: (d: Date) => void;
  accessibilityLabel: string;
  placeholder?: string;
  /** Initial date used when `value` is null. */
  defaultDate?: Date;
};

/**
 * Native date field. Android opens the platform dialog; iOS shows the picker in
 * a modal with Confirmar/Cancelar (RN Modal works on iOS).
 */
export function DateField({
  label,
  value,
  onChange,
  accessibilityLabel,
  placeholder = 'Selecionar',
  defaultDate,
}: Props) {
  const [show, setShow] = useState(false);
  const [temp, setTemp] = useState<Date>(value ?? defaultDate ?? new Date());

  const open = () => {
    setTemp(value ?? defaultDate ?? new Date());
    setShow(true);
  };

  const onAndroid = (_e: DateTimePickerEvent, d?: Date) => {
    setShow(false);
    if (d) onChange(d);
  };

  return (
    <YStack flex={1}>
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
        onPress={open}
        cursor="pointer"
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Calendar size={18} color="$text3" />
        <Text flex={1} fontSize="$14" color={value ? '$text' : '$text3'}>
          {value ? fmtDmy(value) : placeholder}
        </Text>
      </XStack>

      {Platform.OS === 'android' && show ? (
        <DateTimePicker
          value={value ?? defaultDate ?? new Date()}
          mode="date"
          onChange={onAndroid}
        />
      ) : null}

      {Platform.OS !== 'android' ? (
        <Modal
          visible={show}
          transparent
          animationType="fade"
          onRequestClose={() => setShow(false)}
        >
          <View
            flex={1}
            bg="rgba(0,0,0,0.45)"
            jc="flex-end"
            onPress={() => setShow(false)}
          >
            <Card
              radius={20}
              elevated
              m="$12"
              p="$12"
              onPress={(e) => e.stopPropagation()}
            >
              <DateTimePicker
                value={temp}
                mode="date"
                display="spinner"
                onChange={(_e, d) => {
                  if (d) setTemp(d);
                }}
                style={{ alignSelf: 'center' }}
              />
              <XStack gap="$10" mt="$8">
                <Button variant="ghost" flex={1} onPress={() => setShow(false)}>
                  Cancelar
                </Button>
                <Button
                  flex={1}
                  onPress={() => {
                    onChange(temp);
                    setShow(false);
                  }}
                >
                  Confirmar
                </Button>
              </XStack>
            </Card>
          </View>
        </Modal>
      ) : null}
    </YStack>
  );
}
