import { Check } from '@tamagui/lucide-icons';
import { Modal } from 'react-native';
import { View, XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import { TIME_RANGE_OPTIONS, type TimeRangePresetOptions } from '../utils/timeRangePresets';

type Props = {
  visible: boolean;
  selected: TimeRangePresetOptions;
  onClose: () => void;
  onSelect: (opt: TimeRangePresetOptions) => void;
};

/** Bottom-sheet style time-range selector — be1-app TimeRangePicker. */
export function TimeRangePicker({ visible, selected, onClose, onSelect }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View flex={1} bg="rgba(0,0,0,0.45)" jc="flex-end" onPress={onClose}>
        <Card br={20} elevated p="$16" m="$12" onPress={(e) => e.stopPropagation()}>
          <Text fontSize={16} fontWeight="800" color="$text" mb="$12">
            Período
          </Text>
          <YStack gap="$6">
            {TIME_RANGE_OPTIONS.map((opt) => {
              const active = opt.key === selected;
              return (
                <XStack
                  key={opt.key}
                  ai="center"
                  jc="space-between"
                  px="$12"
                  py="$12"
                  br={12}
                  bg={active ? '$brandSoft' : '$surface2'}
                  onPress={() => {
                    onSelect(opt.key);
                    onClose();
                  }}
                  cursor="pointer"
                  pressStyle={{ opacity: 0.8 }}
                >
                  <Text
                    fontSize={14}
                    fontWeight={active ? '700' : '500'}
                    color={active ? '$brand' : '$text'}
                  >
                    {opt.label}
                  </Text>
                  {active ? <Check size={18} color="$brand" /> : null}
                </XStack>
              );
            })}
          </YStack>
        </Card>
      </View>
    </Modal>
  );
}
