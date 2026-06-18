import { delay } from '@/utils/async.util';

import { notificationSchema, type Notification } from './notification.schema';

const NOTIFICATIONS_FIXTURE = [
  {
    id: 'n1',
    tone: 'alert',
    title: 'Temperatura acima do limite',
    message: 'O silo 03 atingiu 38 °C. Verifique a ventilação do ambiente.',
    time: 'há 12 min',
    read: false,
  },
  {
    id: 'n2',
    tone: 'success',
    title: 'Dispositivo reconectado',
    message: 'O sensor SCC-014 voltou a enviar dados em tempo real.',
    time: 'há 1 h',
    read: false,
  },
  {
    id: 'n3',
    tone: 'info',
    title: 'Relatório semanal disponível',
    message: 'O resumo de monitoramento da semana já pode ser consultado.',
    time: 'ontem',
    read: false,
  },
];

export const notificationsService = {
  async list(): Promise<Notification[]> {
    await delay(250);
    return notificationSchema.array().parse(NOTIFICATIONS_FIXTURE);
  },
};
