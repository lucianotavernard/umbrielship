import { z } from 'zod';

export const environmentSchema = z
  .enum(['test', 'development', 'production'])
  .optional()
  .default('development');

export const jwtSchema = z.object({
  secret: z.string(),
  expirationIn: z.string(),
});

export const databaseSchema = z.object({
  url: z.string().startsWith('postgresql://'),
});

export const configSchema = z.object({
  env: environmentSchema,
  port: z.coerce.number().positive().int(),
  jwt: jwtSchema,
  database: databaseSchema,
});
