import { env } from '@/config/env';
import { apiClient } from '@/services/api/axios';
import { logger } from '@/services/logger/logger';
import { storage } from '@/services/storage/storage';
import { StorageKeys } from '@/services/storage/storage.keys';

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

  async updateProfile(userId: string, payload: ProfileUpdateInput): Promise<ProfileUser> {
    const { data } = await apiClient.post(`/users/update/${userId}`, payload);
    return parseUser(data, 'update');
  },

  /**
   * PATCH /users/update/avatar (multipart). Per the API contract the file field
   * must be named exactly `file`, and the Content-Type must NOT be set manually
   * (RN/fetch adds the multipart boundary). Uses fetch + the stored bearer token
   * so the boundary is handled correctly.
   */
  async updateAvatar(asset: AvatarAsset): Promise<void> {
    const token = await storage.get(StorageKeys.authToken);
    const form = new FormData();
    form.append('file', {
      uri: asset.uri,
      name: asset.name,
      type: asset.type,
    } as unknown as Blob);

    const res = await fetch(`${env.API_URL}/users/update/avatar`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });

    if (!res.ok) {
      let message = 'Falha ao atualizar a foto.';
      try {
        const body = (await res.json()) as { message?: string };
        if (body?.message) message = body.message;
      } catch {
        // ignore non-JSON error bodies
      }
      logger.warn('profile.service', 'avatar upload failed', {
        status: res.status,
      });
      throw new Error(message);
    }
  },
};
