import { Modal } from 'react-native';
import { Input, View, YStack } from 'tamagui';

import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

type Props = {
  visible: boolean;
  value: string;
  isLoading: boolean;
  onChange: (text: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

/** Rename a device — be1-app EditNameModal. */
export function EditNameModal({ visible, value, isLoading, onChange, onCancel, onSave }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View flex={1} bg="rgba(0,0,0,0.45)" ai="center" jc="center" px="$16" onPress={onCancel}>
        <Card
          br={20}
          elevated
          p="$16"
          width="100%"
          maxWidth={400}
          onPress={(e) => e.stopPropagation()}
        >
          <Text fontSize={16} fontWeight="800" color="$text" mb="$12">
            Editar nome
          </Text>
          <Input
            value={value}
            onChangeText={onChange}
            placeholder="Nome do dispositivo"
            placeholderTextColor="$text3"
            fontFamily="$body"
            fontSize="$14"
            color="$text"
            bg="$surface2"
            borderWidth={1}
            borderColor="$border"
            br={12}
            px="$12"
            height={46}
          />
          <YStack mt="$14" gap="$8">
            <Button onPress={isLoading ? undefined : onSave} opacity={isLoading ? 0.6 : 1}>
              {isLoading ? 'Salvando…' : 'Salvar'}
            </Button>
            <Button variant="ghost" onPress={isLoading ? undefined : onCancel}>
              Cancelar
            </Button>
          </YStack>
        </Card>
      </View>
    </Modal>
  );
}
