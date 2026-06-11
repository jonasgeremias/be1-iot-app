import { z } from 'zod';

/** Support / assistance contact info (screen 08). */
export const supportInfoSchema = z.object({
  whatsapp: z.string(),
  email: z.string().email(),
  address: z.string(),
  hours: z.string(),
  online: z.boolean(),
});
export type SupportInfo = z.infer<typeof supportInfoSchema>;
