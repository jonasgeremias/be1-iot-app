import { z } from 'zod';

/** Authenticated user's profile (screen 06). */
export const profileSchema = z.object({
  name: z.string(),
  role: z.string(),
  location: z.string(),
  monogram: z.string(),
  email: z.string().email(),
  phone: z.string(),
  state: z.string(),
  cpf: z.string(),
  notifications: z.number(),
  twoFactorEnabled: z.boolean(),
});
export type Profile = z.infer<typeof profileSchema>;
