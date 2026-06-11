import { z } from 'zod';

/** Login form contract. Zod is the source of truth (`z.infer`). */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .email('E-mail inválido'),
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

/** Authenticated session returned by the API (validated at the boundary). */
export const sessionSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.string(),
  }),
});
export type Session = z.infer<typeof sessionSchema>;
