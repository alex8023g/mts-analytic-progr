import { z } from 'zod';

export const searchParamsSchema = z.object({
  full_name: z.string().optional(),
  division: z.string().optional(),
  status: z.string().optional(),
  report_date: z.string().optional(),
});
