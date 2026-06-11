import { z } from 'zod';

/** A carousel highlight slide. */
export const highlightSchema = z.object({
  id: z.string(),
  /** Visual style of the slide tag. */
  tone: z.enum(['feature', 'update', 'event', 'success']),
  tag: z.string(),
  date: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  /** Render the BE1 logo + @handle layout (first slide). */
  branded: z.boolean(),
});
export type Highlight = z.infer<typeof highlightSchema>;

/** Home greeting + account summary. */
export const dashboardSummarySchema = z.object({
  greeting: z.string(),
  accountName: z.string(),
  notifications: z.number(),
  monogram: z.string(),
  deviceCount: z.number(),
  groupCount: z.number(),
});
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
