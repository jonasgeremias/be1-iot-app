import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import { profileService, type AvatarAsset } from '../services/profile.service';

/** Uploads a new avatar (PATCH /users/update/avatar). */
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (asset: AvatarAsset) => profileService.updateAvatar(asset),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.me }),
  });
}
