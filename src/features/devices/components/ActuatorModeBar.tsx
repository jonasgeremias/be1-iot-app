import { Play } from '@tamagui/lucide-icons';
import { Spinner, XStack, YStack } from 'tamagui';

import { Button } from '@/shared/ui/Button';
import { SegmentedControl, type SegmentOption } from '@/shared/ui/SegmentedControl';
import { Stepper } from '@/shared/ui/Stepper';
import { Text } from '@/shared/ui/Text';

/** Modos de acionamento expostos pela tela. */
export type ActuatorMode = 'momentary' | 'timed' | 'hold';

const MODE_OPTIONS: SegmentOption<ActuatorMode>[] = [
  { value: 'momentary', label: 'Toque' },
  { value: 'timed', label: 'Tempo' },
  { value: 'hold', label: 'Manter' },
];

/** Limites do tempo (segundos) do modo temporizado. */
export const MIN_SECONDS = 1;
export const MAX_SECONDS = 600;

type Props = {
  mode: ActuatorMode;
  onModeChange: (mode: ActuatorMode) => void;
  seconds: number;
  onSecondsChange: (seconds: number) => void;
  /** Habilita o botão "Acionar". */
  canTrigger: boolean;
  pending: boolean;
  onTrigger: () => void;
};

/** Seletor de modo + tempo + botão "Acionar". */
export function ActuatorModeBar({
  mode,
  onModeChange,
  seconds,
  onSecondsChange,
  canTrigger,
  pending,
  onTrigger,
}: Props) {
  const enabled = canTrigger && !pending;

  return (
    <YStack gap="$12">
      <XStack>
        <SegmentedControl
          variant="solid"
          options={MODE_OPTIONS}
          value={mode}
          onChange={onModeChange}
        />
      </XStack>

      {mode === 'timed' ? (
        <XStack ai="center" jc="space-between">
          <Text fontSize={13} fontWeight="600" color="$text2">
            Tempo de acionamento
          </Text>
          <Stepper
            displayValue={`${seconds}s`}
            onDecrement={() => onSecondsChange(Math.max(MIN_SECONDS, seconds - 1))}
            onIncrement={() => onSecondsChange(Math.min(MAX_SECONDS, seconds + 1))}
            accessibilityLabel="Tempo em segundos"
          />
        </XStack>
      ) : null}

      <Button
        variant="primary"
        opacity={enabled ? 1 : 0.5}
        onPress={enabled ? onTrigger : undefined}
        accessibilityState={{ disabled: !enabled }}
        accessibilityLabel="Acionar atuador"
        icon={pending ? <Spinner color="$white" /> : <Play size={18} color="$white" />}
      >
        {pending ? 'Aguardando…' : 'Acionar'}
      </Button>
    </YStack>
  );
}
