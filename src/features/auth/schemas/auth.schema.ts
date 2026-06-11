import { z } from 'zod';

/**
 * Login form contract. Accepts e-mail OR CPF (be1-app parity) — the service
 * normalizes the identifier before hitting POST /sessions.
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail ou CPF'),
  password: z
    .string()
    .min(1, 'Informe a senha')
    .min(6, 'Mínimo de 6 caracteres'),
  remember: z.boolean(),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Forgot-password form contract. */
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/** User as returned inside the session payload (lenient — full user via /users). */
export const sessionUserSchema = z
  .object({
    id: z.string(),
    name: z.string().optional().default(''),
    email: z.string().optional().default(''),
  })
  .passthrough();

/** Authenticated session returned by POST /sessions. */
export const sessionSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  user: sessionUserSchema,
  permissions: z.array(z.string()).optional(),
});
export type Session = {
  token: string;
  refreshToken: string;
  user: { id: string; name: string; email: string };
  permissions?: string[];
};
