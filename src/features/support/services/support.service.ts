import { appConfig } from '@/config/app.config';
import { delay } from '@/utils/async.util';

import { supportInfoSchema, type SupportInfo } from '../schemas/support.schema';

export const supportService = {
  async getInfo(): Promise<SupportInfo> {
    await delay(250);
    return supportInfoSchema.parse({
      whatsapp: appConfig.support.whatsapp,
      email: appConfig.support.email,
      address: appConfig.support.address,
      hours: appConfig.support.hours,
      online: true,
    });
  },
};
