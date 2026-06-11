import { delay } from '@/utils/async.util';

import {
  deviceDetailSchema,
  deviceGroupSchema,
  type DeviceDetail,
  type DeviceGroup,
} from '../schemas/device.schema';

const online = (value: number) => ({ value, tone: 'online' as const });
const muted = (value: number) => ({ value, tone: 'muted' as const });
const amber = (value: number) => ({ value, tone: 'amber' as const });

const GROUPS_FIXTURE = [
  {
    id: 'lab',
    name: 'LABORATÓRIO',
    total: 8,
    devices: [
      {
        id: 'dev-04634',
        name: 'DEV 04634',
        status: 'online' as const,
        updatedLabel: 'atualizado 11:05',
        temp: 72,
        humidity: 58,
        blowerOn: true,
        model: 'SCC',
        active: true,
        mac: '02:53:EB:39:F5:C4',
        mainTemp: 72,
        mainTone: 'online' as const,
        chambers: [
          online(72),
          online(71),
          online(72),
          online(73),
          online(68),
          online(73),
          online(72),
          online(72),
        ],
      },
      {
        id: 'tb4',
        name: 'Teste de bancada 4',
        status: 'offline' as const,
        updatedLabel: 'ontem às 17:53',
        temp: 75,
        humidity: 61,
        blowerOn: false,
        model: 'SCC',
        active: true,
        mac: '02:53:A4:19:41:F8',
        mainTemp: 75,
        mainTone: 'muted' as const,
        chambers: [
          muted(73),
          muted(77),
          amber(80),
          muted(74),
          muted(74),
          muted(79),
          muted(75),
          muted(75),
        ],
      },
      {
        id: 'tb3',
        name: 'Teste de bancada 3',
        status: 'offline' as const,
        updatedLabel: 'ontem às 17:53',
        temp: 76,
        humidity: 75,
        blowerOn: false,
        model: 'SCC',
        active: true,
        mac: '02:53:65:A7:25:AF',
        mainTemp: 76,
        mainTone: 'muted' as const,
        chambers: [
          muted(77),
          muted(77),
          muted(76),
          muted(74),
          muted(77),
          muted(77),
          muted(74),
          muted(75),
        ],
      },
    ],
  },
];

const DETAIL_BASE = {
  id: 'tb1',
  name: 'Teste de bancada 1',
  status: 'offline' as const,
  model: 'SCC',
  mac: '02:53:29:92:A2:EF',
  lastReadingLabel: 'Ontem às 17:52',
  cycle: 30,
  temp: {
    value: 74,
    target: 80,
    unit: '°C',
    pct: 62,
    deltaLabel: '↓ 6 °C abaixo',
    accent: 'amber' as const,
  },
  humidity: {
    value: 57,
    target: 70,
    unit: '%',
    pct: 81,
    deltaLabel: '↓ 13 % abaixo',
    accent: 'brand' as const,
  },
  blowerOn: true,
  chambers: [3, 4, 5, 6, 7, 8, 1, 2],
  phase: {
    current: 'Amarelação',
    steps: ['Secagem do Talo', 'Secagem da Lâmina', 'Murchamento', 'Amarelação'],
  },
  climate: {
    current: 'Normal',
    options: ['Úmido', 'Seco', 'Normal'],
  },
  hasAlarms: false,
};

export const deviceService = {
  async getGroups(): Promise<DeviceGroup[]> {
    await delay(350);
    return deviceGroupSchema.array().parse(GROUPS_FIXTURE);
  },

  async getDeviceDetail(id: string): Promise<DeviceDetail> {
    await delay(350);
    const item = GROUPS_FIXTURE.flatMap((g) => g.devices).find(
      (d) => d.id === id,
    );
    const merged = item
      ? {
          ...DETAIL_BASE,
          id: item.id,
          name: item.name,
          status: item.status,
          mac: item.mac,
          model: item.model,
          blowerOn: item.blowerOn,
          temp: { ...DETAIL_BASE.temp, value: item.temp },
          humidity: { ...DETAIL_BASE.humidity, value: item.humidity },
        }
      : DETAIL_BASE;
    return deviceDetailSchema.parse(merged);
  },
};
