import { apiClient } from '@/services/api/axios';
import { logger } from '@/services/logger/logger';

import {
  profileUserSchema,
  type ProfileUpdateInput,
  type ProfileUser,
} from '../schemas/profile.schema';

function parseUser(data: unknown, scope: string): ProfileUser {
  const result = profileUserSchema.safeParse(data);
  if (!result.success) {
    logger.warn('profile.service', `validation fallback: ${scope}`, {
      issues: result.error.issues.slice(0, 3),
    });
  }
  return data as ProfileUser;
}

/** Picked image asset for the avatar upload. */
export type AvatarAsset = { uri: string; name: string; type: string };

/** Real user IO (be1-app parity): GET/POST /users, PATCH avatar. */
export const profileService = {
  async getProfile(userId: string): Promise<ProfileUser> {
    const { data } = await apiClient.get(`/users/${userId}`);
    return parseUser(data, 'get');
  },

  async updateProfile(
    userId: string,
    payload: ProfileUpdateInput,
  ): Promise<ProfileUser> {
    const { data } = await apiClient.post(`/users/update/${userId}`, payload);
    return parseUser(data, 'update');
  },

  async updateAvatar(asset: AvatarAsset): Promise<void> {
    const form = new FormData();
    form.append('avatar', asset as unknown as Blob);
    await apiClient.patch('/users/update/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
