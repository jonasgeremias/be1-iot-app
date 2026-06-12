/** Helpers for the device settings tree editor (be1-dashboard parity). */

export type SettingsTree = Record<string, unknown>;

export function isPlainObject(v: unknown): v is SettingsTree {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Immutable set at a nested path. */
export function setPath(
  obj: SettingsTree,
  path: string[],
  value: unknown,
): SettingsTree {
  if (path.length === 0) return obj;
  const [head, ...rest] = path;
  const key = head!;
  if (rest.length === 0) return { ...obj, [key]: value };
  const child = isPlainObject(obj[key]) ? (obj[key] as SettingsTree) : {};
  return { ...obj, [key]: setPath(child, rest, value) };
}

/** Minimal patch (only changed leaves, preserving nesting). */
export function deepDiff(
  original: SettingsTree,
  edited: SettingsTree,
): SettingsTree {
  const out: SettingsTree = {};
  for (const key of Object.keys(edited)) {
    const o = original?.[key];
    const e = edited[key];
    if (isPlainObject(e) && isPlainObject(o)) {
      const sub = deepDiff(o, e);
      if (Object.keys(sub).length > 0) out[key] = sub;
    } else if (JSON.stringify(o) !== JSON.stringify(e)) {
      out[key] = e;
    }
  }
  return out;
}

/** Count of changed leaves in a diff tree. */
export function countLeaves(tree: SettingsTree): number {
  let n = 0;
  for (const value of Object.values(tree)) {
    if (isPlainObject(value)) n += countLeaves(value);
    else n += 1;
  }
  return n;
}

// ── labels (be1-dashboard settingsTranslations) ──────────────────────────────
const SETTINGS_LABELS: Record<string, string> = {
  device: 'Dispositivo',
  device_type: 'Tipo de dispositivo',
  cb200: 'CB-200',
  pc_agricola: 'PC-Agrícola',
  alarms: 'Alarmes',
  mqtt: 'MQTT',
  api: 'API',
  database: 'Banco de dados',
  snapshot: 'Snapshot',
  led: 'LED de status',
  chart: 'Gráfico',
  time_service: 'Serviço de hora',
  usb_export: 'Exportação USB',
  ota: 'OTA',
  tables: 'Tabelas',
};

export function humanizeSettingKey(key: string): string {
  const s = key.replace(/_/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function translateSettingKey(key: string): string {
  return SETTINGS_LABELS[key] ?? humanizeSettingKey(key);
}

/** Section-level warnings shown under the header. */
export const SETTINGS_SECTION_WARNINGS: Record<string, string> = {
  mqtt: 'Alterar host, porta, TLS ou timeouts pode reconectar o dispositivo — ele pode ficar offline se os valores estiverem incorretos.',
  device: 'Alterar o tipo de dispositivo muda o namespace MQTT. Evite alterar remotamente.',
};

/** Fields rendered as a Select with fixed options. */
export const SELECT_FIELDS: Record<string, { value: string; label: string }[]> =
  {
    device_type: [
      { value: 'SCC', label: 'SCC' },
      { value: 'PP', label: 'PP' },
      { value: 'BULK', label: 'BULK' },
    ],
  };
