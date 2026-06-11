import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import type { ProfileUpdateInput } from '../schemas/profile.schema';
import { profileService } from '../services/profile.service';

/** Saves edited profile fields (POST /users/update/{id}). */
export function useUpdateProfile(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileUpdateInput) =>
      profileService.updateProfile(userId!, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.me }),
  });
}
