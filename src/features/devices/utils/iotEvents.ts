import {
  CircleAlert,
  Info,
  ShieldAlert,
  TriangleAlert,
} from '@tamagui/lucide-icons';
import type { NamedExoticComponent } from 'react';

import type { IotEventSeverity } from '../schemas/device.schema';

type LucideIcon = NamedExoticComponent<{ size?: number; color?: string }>;

/** Severity label / accent color / icon — be1-dashboard parity. */
export const SEVERITY_META: Record<
  IotEventSeverity,
  { label: string; color: string; Icon: LucideIcon }
> = {
  I: { label: 'Informação', color: '#1976D2', Icon: Info as LucideIcon },
  W: { label: 'Aviso', color: '#F57C00', Icon: TriangleAlert as LucideIcon },
  E: { label: 'Erro', color: '#E53935', Icon: CircleAlert as LucideIcon },
  C: { label: 'Crítico', color: '#7B1FA2', Icon: ShieldAlert as LucideIcon },
};

export const SEVERITY_ORDER: IotEventSeverity[] = ['I', 'W', 'E', 'C'];

/**
 * Normalize a backend severity (single letter, word, or numeric level) to one
 * of I/W/E/C. Tolerant of casing and formats ('warning', 'W', 2, etc.).
 */
export function normalizeSeverity(raw: unknown): IotEventSeverity {
  if (typeof raw === 'number') {
    if (raw >= 4) return 'C';
    if (raw === 3) return 'E';
    if (raw === 2) return 'W';
    return 'I';
  }
  const s = String(raw ?? '').trim().toUpperCase();
  if (!s) return 'I';
  if (s.startsWith('C') || s === 'FATAL') return 'C';
  if (s.startsWith('E')) return 'E';
  if (s.startsWith('W') || s.startsWith('A')) return 'W'; // Warning / Aviso
  return 'I';
}

/** Severity meta (label/color/icon) for a raw backend value. */
export function getSeverityMeta(raw: unknown) {
  return SEVERITY_META[normalizeSeverity(raw)];
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  DEVICE_AUTH: 'Dispositivo autenticado',
  DEVICE_POWER_ON: 'Dispositivo ligado',
  DEVICE_CHANGE_RTC: 'RTC alterado',
  USER_ACTION: 'Ação do usuário',
  LOCAL_ACTION: 'Ação local',
  CHANGE_SETTINGS_REMOTE: 'Configurações remotas alteradas',
  CHANGE_DEVICE_SETTINGS: 'Configurações do dispositivo alteradas',
  CHANGE_SILO_SETTINGS: 'Configurações do silo alteradas',
  CHANGE_RULES_OF_EXCELLENCE_SETTINGS: 'Regras de excelência alteradas',
  CHANGE_PENDULUMS_SETTINGS: 'Configurações dos pêndulos alteradas',
  CHANGE_HUB_SETTINGS: 'Configurações do Hub alteradas',
  CHANGE_HUB_SERVER_SETTINGS: 'Configurações do servidor do Hub alteradas',
};

export function translateEventType(eventType: string): string {
  return EVENT_TYPE_LABELS[eventType] ?? eventType;
}

// ── period presets (be1-dashboard) ───────────────────────────────────────────
export type EventPreset = {
  key: string;
  label: string;
  range: () => { start: string; end: string };
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000);
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

export const EVENT_PRESETS: EventPreset[] = [
  { key: '24h', label: 'Últimas 24h', range: () => ({ start: hoursAgo(24).toISOString(), end: new Date().toISOString() }) },
  { key: '3d', label: '3 dias', range: () => ({ start: daysAgo(3).toISOString(), end: new Date().toISOString() }) },
  { key: '7d', label: '7 dias', range: () => ({ start: daysAgo(7).toISOString(), end: new Date().toISOString() }) },
  { key: '30d', label: '30 dias', range: () => ({ start: daysAgo(30).toISOString(), end: new Date().toISOString() }) },
  {
    key: 'thisMonth',
    label: 'Este mês',
    range: () => ({ start: startOfMonth(new Date()).toISOString(), end: new Date().toISOString() }),
  },
  {
    key: 'lastMonth',
    label: 'Mês anterior',
    range: () => {
      const now = new Date();
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { start: startOfMonth(prev).toISOString(), end: endOfMonth(prev).toISOString() };
    },
  },
];

export const EVENT_PAGE_SIZES = [10, 25, 50, 100];
