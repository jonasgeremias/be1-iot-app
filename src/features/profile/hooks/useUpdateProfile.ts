import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';
import { storage } from '@/services/storage/storage';
import { StorageKeys } from '@/services/storage/storage.keys';

import type { ProfileUpdateInput } from '../schemas/profile.schema';
import { profileService } from '../services/profile.service';

/** Saves edited profile fields (POST /users/update/{id}). */
export function useUpdateProfile(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileUpdateInput) =>
      profileService.updateProfile(userId!, payload),
    onSuccess: (_data, variables) => {
      // keep the cached name (used by the dashboard greeting) fresh
      if (variables.name) void storage.set(StorageKeys.userName, variables.name);
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.me });
    },
  });
}
