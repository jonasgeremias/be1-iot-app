import { ChevronDown, ChevronRight, TriangleAlert } from '@tamagui/lucide-icons';
import { useEffect, useState } from 'react';
import { Input as TamaguiInput, View, XStack, YStack } from 'tamagui';

import { Select } from '@/shared/ui/Select';
import { Switch } from '@/shared/ui/Switch';
import { Text } from '@/shared/ui/Text';

import {
  isPlainObject,
  SELECT_FIELDS,
  SETTINGS_SECTION_WARNINGS,
  translateSettingKey,
} from '../utils/settingsTree';

type Props = {
  keyName: string;
  value: unknown;
  original: unknown;
  path: string[];
  onChange: (path: string[], value: unknown) => void;
  depth: number;
};

const fieldInput = {
  bg: '$surface2',
  borderWidth: 1,
  borderColor: '$border',
  br: 10,
  px: '$10',
  height: 38,
  fontFamily: '$body',
  fontSize: '$13',
  color: '$text',
} as const;

function NumberField({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const [text, setText] = useState(value == null ? '' : String(value));
  useEffect(() => {
    const cur = text.trim() === '' ? null : Number(text);
    // resync only when the external value actually differs (e.g. after fetch)
    if (cur !== value && (cur === null || !Number.isNaN(cur))) {
      setText(value == null ? '' : String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <TamaguiInput
      {...fieldInput}
      width={120}
      textAlign="right"
      keyboardType="numeric"
      value={text}
      onChangeText={(t) => {
        setText(t);
        if (t.trim() === '') return onChange(null);
        const n = Number(t);
        if (Number.isFinite(n)) onChange(n);
      }}
      accessibilityLabel="Valor numérico"
    />
  );
}

/** Recursive settings tree node: collapsible group or editable leaf. */
export function SettingsNode({ keyName, value, original, path, onChange, depth }: Props) {
  const [open, setOpen] = useState(depth === 0 ? false : true);
  const label = translateSettingKey(keyName);

  // ── group ──────────────────────────────────────────────────────────────────
  if (isPlainObject(value)) {
    const warning = SETTINGS_SECTION_WARNINGS[keyName];
    const orig = isPlainObject(original) ? original : {};
    const keys = Object.keys(value);
    return (
      <YStack>
        <XStack ai="center" gap="$8" py="$8" onPress={() => setOpen((v) => !v)} cursor="pointer">
          {open ? (
            <ChevronDown size={16} color="$text3" />
          ) : (
            <ChevronRight size={16} color="$text3" />
          )}
          <Text
            fontSize={depth === 0 ? 13 : 12.5}
            fontWeight={depth === 0 ? '800' : '700'}
            color={depth === 0 ? '$text' : '$text2'}
            textTransform={depth === 0 ? 'uppercase' : 'none'}
            letterSpacing={depth === 0 ? 0.4 : 0}
            flex={1}
          >
            {label}
          </Text>
        </XStack>

        {open ? (
          <YStack pl="$12" ml="$6" borderLeftWidth={1} borderLeftColor="$border" gap="$2">
            {warning ? (
              <XStack ai="flex-start" gap="$6" bg="$amberSoft" br={8} p="$8" my="$6">
                <TriangleAlert size={14} color="$amber" />
                <Text fontSize={11} color="$amber" flex={1}>
                  {warning}
                </Text>
              </XStack>
            ) : null}
            {keys.map((k) => (
              <SettingsNode
                key={k}
                keyName={k}
                value={value[k]}
                original={orig[k]}
                path={[...path, k]}
                onChange={onChange}
                depth={depth + 1}
              />
            ))}
          </YStack>
        ) : null}
      </YStack>
    );
  }

  // ── leaf ─────────────────────────────────────────────────────────────────
  const changed = JSON.stringify(value) !== JSON.stringify(original);

  let control: React.ReactNode;
  const selectOptions = SELECT_FIELDS[keyName];

  if (Array.isArray(value)) {
    control = (
      <Text fontSize={12} color="$text3">
        [{value.length} itens]
      </Text>
    );
  } else if (selectOptions) {
    control = (
      <View width={140}>
        <Select
          accessibilityLabel={label}
          value={value == null ? '' : String(value)}
          options={selectOptions}
          searchable={false}
          onChange={(v) => onChange(path, v)}
        />
      </View>
    );
  } else if (typeof value === 'boolean' || typeof original === 'boolean') {
    control = (
      <Switch
        value={value === true}
        onValueChange={(v) => onChange(path, v)}
        accessibilityLabel={label}
      />
    );
  } else if (typeof value === 'number') {
    control = <NumberField value={value} onChange={(v) => onChange(path, v)} />;
  } else {
    control = (
      <TamaguiInput
        {...fieldInput}
        width={150}
        value={value == null ? '' : String(value)}
        onChangeText={(t) => onChange(path, t)}
        accessibilityLabel={label}
      />
    );
  }

  return (
    <XStack ai="center" jc="space-between" gap="$10" py="$7">
      <Text
        flex={1}
        fontSize={13}
        color={changed ? '$brand' : '$text'}
        fontWeight={changed ? '700' : '500'}
        numberOfLines={2}
      >
        {label}
      </Text>
      {control}
    </XStack>
  );
}
