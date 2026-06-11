import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';

import { profileService } from '../services/profile.service';
import { useCurrentUserId } from './useCurrentUserId';

/** The current user's profile (GET /users/{id}). */
export function useProfile() {
  const userId = useCurrentUserId();

  const query = useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: () => profileService.getProfile(userId!),
    enabled: !!userId,
  });

  // While the id is still being read from storage, treat as loading.
  return { ...query, userId, isLoading: query.isLoading || !userId };
}
