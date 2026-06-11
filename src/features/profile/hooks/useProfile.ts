import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import { profileService } from '../services/profile.service';

/** The current user's profile. */
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: () => profileService.getProfile(),
  });
}
