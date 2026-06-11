import { BellRing, CheckCircle2 } from '@tamagui/lucide-icons';
import { View, XStack, YStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { MonoText, Text } from '@/shared/ui/Text';

import {
  decodeSccAlarms,
  sccAlarmsSeverity,
  type SccAlarm,
} from '../utils/sccAlarms';

type Props = {
  alarmsFlags: number;
};

/** Alarms card — be1-app IotAlarmCard (decodes the u16 alarm bitmask). */
export function IotAlarmCard({ alarmsFlags }: Props) {
  const alarms = decodeSccAlarms(alarmsFlags);
  const count = alarms.length;
  const hasAlarms = count > 0;
  const severity = sccAlarmsSeverity(alarms);

  const bell = !hasAlarms
    ? { color: '#6B7280', bg: 'rgba(128,128,128,0.18)' }
    : severity === 'critical'
      ? { color: '#B91C1C', bg: 'rgba(185,28,28,0.16)' }
      : { color: '#B45309', bg: 'rgba(245,158,11,0.20)' };

  const badgeBg = severity === 'critical' ? '#DC2626' : '#F59E0B';
  const badgeText = severity === 'critical' ? '#FFFFFF' : '#78350F';

  const twoCols = count > 4;
  const compact = count >= 9;

  return (
    <Card br={12} elevated={false} p="$12" gap="$10">
      <XStack ai="center" gap="$8">
        <XStack width={32} height={32} br={16} ai="center" jc="center" bg={bell.bg}>
          <BellRing size={18} color={bell.color} />
        </XStack>
        <Text
          flex={1}
          fontSize={12}
          fontWeight="700"
          color="$text2"
          textTransform="uppercase"
          letterSpacing={0.4}
        >
          Alarmes
        </Text>
        {hasAlarms ? (
          <View minWidth={22} px="$6" py="$2" br={11} bg={badgeBg} ai="center">
            <MonoText fontSize={12} fontWeight="700" color={badgeText}>
              {count}
            </MonoText>
          </View>
        ) : null}
      </XStack>

      {!hasAlarms ? (
        <XStack
          ai="center"
          gap="$10"
          bg="rgba(21,128,61,0.10)"
          br={8}
          p="$12"
        >
          <CheckCircle2 size={24} color="#15803D" />
          <YStack>
            <Text fontSize={14} fontWeight="700" color="#15803D">
              Sem alarmes ativos
            </Text>
            <Text fontSize={12} color="#15803D">
              Sistema operando normalmente
            </Text>
          </YStack>
        </XStack>
      ) : (
        <XStack flexWrap="wrap" gap="$8">
          {alarms.map((a) => (
            <AlarmItem key={a.mask} alarm={a} twoCols={twoCols} compact={compact} />
          ))}
        </XStack>
      )}
    </Card>
  );
}

function AlarmItem({
  alarm,
  twoCols,
  compact,
}: {
  alarm: SccAlarm;
  twoCols: boolean;
  compact: boolean;
}) {
  const critical = alarm.severity === 'critical';
  const bg = critical ? 'rgba(185,28,28,0.10)' : 'rgba(245,158,11,0.18)';
  const color = critical ? '#B91C1C' : '#B45309';
  const Icon = alarm.Icon;

  return (
    <XStack
      width={twoCols ? '48%' : '100%'}
      ai="center"
      gap="$8"
      bg={bg}
      br={8}
      px={compact ? '$8' : '$10'}
      py={compact ? '$6' : '$8'}
    >
      <Icon size={compact ? 16 : 18} color={color} />
      <Text fontSize={compact ? 11 : 12} fontWeight="600" color={color} flex={1} numberOfLines={2}>
        {compact ? alarm.compactLabel : alarm.label}
      </Text>
    </XStack>
  );
}
