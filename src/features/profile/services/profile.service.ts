import { delay } from '@/utils/async.util';

import { profileSchema, type Profile } from '../schemas/profile.schema';

const PROFILE_FIXTURE = {
  name: 'TI BE1',
  role: 'ADMINISTRADOR',
  location: 'Criciúma · SC',
  monogram: 'TB',
  email: 'ti@be1.com.br',
  phone: '(48) 99999-9999',
  state: 'Santa Catarina',
  cpf: '912.174.749-00',
  notifications: 3,
  twoFactorEnabled: true,
};

export const profileService = {
  async getProfile(): Promise<Profile> {
    await delay(300);
    return profileSchema.parse(PROFILE_FIXTURE);
  },
};
