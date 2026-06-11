import { useMutation } from '@tanstack/react-query';

import { authService } from '../services/auth.service';

/** Requests a password-reset link for the given e-mail. */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset(email),
  });
}
