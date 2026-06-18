import { z } from 'zod';

/** A single in-app notification entry. */
export const notificationSchema = z.object({
  id: z.string(),
  /** Visual style of the leading icon chip. */
  tone: z.enum(['alert', 'success', 'info']),
  title: z.string(),
  message: z.string(),
  /** Human-friendly relative time label (e.g. "há 12 min"). */
  time: z.string(),
  read: z.boolean(),
});
export type Notification = z.infer<typeof notificationSchema>;
