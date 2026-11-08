import { z } from 'zod';

export const pageQueryParamSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().int().min(1)),
  per_page: z
    .string()
    .optional()
    .default('20')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
});

export type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>;
