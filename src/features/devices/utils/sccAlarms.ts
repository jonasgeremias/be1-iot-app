import {
  ArrowLeftRight,
  BatteryWarning,
  Flame,
  MemoryStick,
  PlugZap,
  Snowflake,
  Unlink,
} from '@tamagui/lucide-icons';
import type { NamedExoticComponent } from 'react';

export type SccAlarmSeverity = 'critical' | 'warning';

type LucideIcon = NamedExoticComponent<{ size?: number; color?: string }>;

export interface SccAlarm {
  mask: number;
  type: string;
  severity: SccAlarmSeverity;
  label: string;
  compactLabel: string;
  Icon: LucideIcon;
}

/** Alarm bits in display order (be1-app iot-scc §7.1). Bits >0x0040 ignored. */
export const ALARM_BITS: SccAlarm[] = [
  {
    mask: 0x0001,
    type: 'PowerLoss',
    severity: 'critical',
    label: 'Falta de energia',
    compactLabel: 'Falta de energia',
    Icon: BatteryWarning as LucideIcon,
  },
  {
    mask: 0x0002,
    type: 'InverterFault',
    severity: 'critical',
    label: 'Inversor em falha',
    compactLabel: 'Inversor falha',
    Icon: PlugZap as LucideIcon,
  },
  {
    mask: 0x0004,
    type: 'SensorsDisconnected',
    severity: 'warning',
    label: 'Sensores desconectados',
    compactLabel: 'Sensores desc.',
    Icon: Unlink as LucideIcon,
  },
  {
    mask: 0x0008,
    type: 'EepromI2c',
    severity: 'critical',
    label: 'Erro EEPROM I2C',
    compactLabel: 'Erro EEPROM',
    Icon: MemoryStick as LucideIcon,
  },
  {
    mask: 0x0010,
    type: 'TempLow',
    severity: 'warning',
    label: 'Temperatura baixa',
    compactLabel: 'Temperatura baixa',
    Icon: Snowflake as LucideIcon,
  },
  {
    mask: 0x0020,
    type: 'TempHigh',
    severity: 'warning',
    label: 'Temperatura alta',
    compactLabel: 'Temperatura alta',
    Icon: Flame as LucideIcon,
  },
  {
    mask: 0x0040,
    type: 'HighVariation',
    severity: 'warning',
    label: 'Variação alta entre câmaras (sobrecarga nos grampos)',
    compactLabel: 'Variação alta',
    Icon: ArrowLeftRight as LucideIcon,
  },
];

export function decodeSccAlarms(flags: number): SccAlarm[] {
  if (!flags) return [];
  return ALARM_BITS.filter((bit) => (flags & bit.mask) !== 0);
}

/** critical if ANY active alarm is critical; otherwise warning. */
export function sccAlarmsSeverity(alarms: SccAlarm[]): SccAlarmSeverity {
  return alarms.some((a) => a.severity === 'critical') ? 'critical' : 'warning';
}
