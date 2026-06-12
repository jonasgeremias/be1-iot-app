import {
  Ban,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Search,
} from '@tamagui/lucide-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View, XStack, YStack } from 'tamagui';

import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { IconButton } from '@/shared/ui/IconButton';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { MonoText, Text } from '@/shared/ui/Text';

import { useIotDevice } from '../hooks/useIotDevice';
import { useIotDeviceEvents } from '../hooks/useIotDeviceEvents';
import type { IotDeviceEvent, IotEventSeverity } from '../schemas/device.schema';
import { formatMac } from '../utils/iotConstants';
import {
  EVENT_PRESETS,
  SEVERITY_META,
  SEVERITY_ORDER,
  translateEventType,
} from '../utils/iotEvents';

const pad = (n: number) => String(n).padStart(2, '0');
function fmtEventDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EventRow({ event }: { event: IotDeviceEvent }) {
  const [open, setOpen] = useState(false);
  const meta = SEVERITY_META[event.severity] ?? SEVERITY_META.I;
  const Icon = meta.Icon;
  const hasMeta = event.metadata != null;
  const metaText =
    typeof event.metadata === 'string'
      ? event.metadata
      : JSON.stringify(event.metadata, null, 2);

  return (
    <Card
      br={14}
      elevated={false}
      borderLeftWidth={3}
      borderLeftColor={meta.color}
      p="$12"
      gap="$8"
    >
      <XStack ai="center" gap="$10">
        <XStack
          width={32}
          height={32}
          br={16}
          ai="center"
          jc="center"
          bg={meta.color + '22'}
        >
          <Icon size={18} color={meta.color} />
        </XStack>
        <YStack flex={1} minWidth={0}>
          <Text fontSize={13.5} fontWeight="700" color="$text" numberOfLines={2}>
            {translateEventType(event.eventType)}
          </Text>
          <MonoText fontSize={11} color="$text3">
            {fmtEventDate(event.timeEmitted)}
          </MonoText>
        </YStack>
        <View bg={meta.color + '22'} px="$8" py="$3" br={6}>
          <Text fontSize={10} fontWeight="800" color={meta.color}>
            {meta.label}
          </Text>
        </View>
      </XStack>

      {hasMeta ? (
        <YStack>
          <Text
            fontSize={11}
            fontWeight="700"
            color="$brand"
            onPress={() => setOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="Ver detalhes"
          >
            {open ? 'Ocultar detalhes' : 'Ver detalhes'}
          </Text>
          {open ? (
            <View bg="$surface2" br={8} p="$10" mt="$6">
              <MonoText fontSize={11} color="$text2">
                {metaText}
              </MonoText>
            </View>
          ) : null}
        </YStack>
      ) : null}
    </Card>
  );
}

/** Device events · list with severity/period filters (be1-dashboard parity). */
export function DeviceEventsScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const deviceId = id ?? '';
  const router = useRouter();

  const { device, isLoading: isLoadingDevice } = useIotDevice(deviceId);

  const [presetKey, setPresetKey] = useState('7d');
  const [severities, setSeverities] = useState<IotEventSeverity[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const { start, end } = useMemo(
    () => (EVENT_PRESETS.find((p) => p.key === presetKey) ?? EVENT_PRESETS[2]!).range(),
    [presetKey],
  );

  const supported =
    device?.deviceType === 'SCC' ||
    device?.deviceType === 'PP' ||
    device?.deviceType === 'BULK';

  // Load as soon as we have an id; only block once we KNOW it's an unsupported type.
  const { data, isLoading, isError, refetch, isFetching } = useIotDeviceEvents(
    deviceId,
    { severities, start, end, page, limit, enabled: device == null || supported },
  );

  const setPreset = (k: string) => {
    setPresetKey(k);
    setPage(1);
  };
  const toggleSeverity = (s: IotEventSeverity) => {
    setSeverities((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
    setPage(1);
  };

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const pageEnd = Math.min(page * limit, total);

  const header = (
    <XStack px="$16" pt="$4" pb="$8" ai="center" gap="$12">
      <IconButton accessibilityLabel="Voltar" onPress={() => router.back()}>
        <ChevronLeft size={19} color="$text" />
      </IconButton>
      <YStack flex={1} minWidth={0}>
        <Text fontSize="$19" fontWeight="800" color="$text" letterSpacing={-0.3}>
          Eventos
        </Text>
        {device ? (
          <Text fontSize="$11" color="$text3" numberOfLines={1}>
            {device.nickname || formatMac(device.macAddress)}
          </Text>
        ) : null}
      </YStack>
    </XStack>
  );

  if (isLoadingDevice && !device) {
    return (
      <Screen tabBarSpacing>
        {header}
        <LoadingState />
      </Screen>
    );
  }

  if (device && !supported) {
    return (
      <Screen tabBarSpacing>
        {header}
        <YStack ai="center" jc="center" p="$32" gap="$12">
          <Ban size={44} color="$text3" />
          <Text fontSize={15} ta="center" color="$text2">
            Eventos não disponíveis para este tipo de dispositivo.
          </Text>
        </YStack>
      </Screen>
    );
  }

  return (
    <Screen scroll tabBarSpacing>
      {header}

      {/* period presets */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}
      >
        {EVENT_PRESETS.map((p) => {
          const active = p.key === presetKey;
          return (
            <View
              key={p.key}
              px="$12"
              py="$7"
              br={9}
              bg={active ? '$brand' : '$surface'}
              borderWidth={1}
              borderColor={active ? '$brand' : '$border'}
              onPress={() => setPreset(p.key)}
              cursor="pointer"
            >
              <Text
                fontSize={12}
                fontWeight={active ? '700' : '600'}
                color={active ? '$white' : '$text2'}
              >
                {p.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* severity filter */}
      <XStack px="$16" pt="$10" gap="$6" flexWrap="wrap">
        {SEVERITY_ORDER.map((s) => {
          const m = SEVERITY_META[s];
          const active = severities.includes(s);
          return (
            <View
              key={s}
              px="$10"
              py="$6"
              br={8}
              bg={active ? m.color + '22' : '$surface'}
              borderWidth={1}
              borderColor={active ? m.color : '$border'}
              onPress={() => toggleSeverity(s)}
              cursor="pointer"
            >
              <Text
                fontSize={11.5}
                fontWeight="700"
                color={active ? m.color : '$text3'}
              >
                {m.label}
              </Text>
            </View>
          );
        })}
      </XStack>

      {/* buscar */}
      <XStack px="$16" pt="$12">
        <Button
          onPress={() => {
            setPage(1);
            void refetch();
          }}
          disabled={isFetching}
          opacity={isFetching ? 0.7 : 1}
          icon={<Search size={17} color="$white" />}
        >
          {isFetching ? 'Buscando…' : 'Buscar'}
        </Button>
      </XStack>

      {/* body */}
      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading ? (
        <LoadingState />
      ) : total === 0 ? (
        <EmptyState
          title="Nenhum evento"
          description="Nenhum evento no período/filtros selecionados."
        />
      ) : (
        <YStack px="$16" pt="$12" gap="$8">
          {(data?.data ?? []).map((ev: IotDeviceEvent) => (
            <EventRow key={ev.id} event={ev} />
          ))}

          {/* pagination */}
          <XStack ai="center" jc="space-between" pt="$8">
            <IconButton
              accessibilityLabel="Página anterior"
              size="sm"
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              opacity={page <= 1 || isFetching ? 0.4 : 1}
            >
              <ChevronLeftIcon size={18} color="$text" />
            </IconButton>
            <Text fontSize={12} color="$text2" fontWeight="600">
              {pageStart}–{pageEnd} de {total}
            </Text>
            <IconButton
              accessibilityLabel="Próxima página"
              size="sm"
              onPress={() =>
                setPage((p) => (p < totalPages ? p + 1 : p))
              }
              opacity={page >= totalPages || isFetching ? 0.4 : 1}
            >
              <ChevronRightIcon size={18} color="$text" />
            </IconButton>
          </XStack>

          <XStack ai="center" jc="center" pt="$4">
            <SegmentedControl<string>
              value={String(limit)}
              onChange={(v) => {
                setLimit(Number(v));
                setPage(1);
              }}
              options={[
                { value: '25', label: '25' },
                { value: '50', label: '50' },
                { value: '100', label: '100' },
              ]}
            />
          </XStack>
        </YStack>
      )}
    </Screen>
  );
}
