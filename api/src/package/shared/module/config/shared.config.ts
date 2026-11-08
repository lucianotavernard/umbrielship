import { z } from 'zod';

import { ConfigException } from '@/package/shared/module/config/config.exception';

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

export const sharedConfigSchema = z.object({
  env: environmentSchema,
  port: z.coerce.number().positive().int(),
  jwt: jwtSchema,
  database: databaseSchema,
  redis: z.object({
    url: z.string().regex(/^rediss?:\/\//),
  }),
  web: z.object({
    origin: z.url({ protocol: /^https?$/ }),
  }),
  mail: z.object({
    host: z.string().min(1),
    port: z.coerce.number().int().positive(),
    user: z.string().min(1).optional(),
    pass: z.string().min(1).optional(),
    from: z.string().min(1),
  }),
});

export type Environment = z.infer<typeof environmentSchema>;

export type SharedConfig = z.infer<typeof sharedConfigSchema>;

export const sharedConfigFactory = (): SharedConfig => {
  const result = sharedConfigSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    jwt: {
      secret: process.env.JWT_SECRET,
      expirationIn: process.env.JWT_EXPIRATION_IN,
    },
    database: {
      url: process.env.DATABASE_URL,
    },
    redis: {
      url: process.env.REDIS_URL,
    },
    web: {
      origin: process.env.WEB_ORIGIN,
    },
    mail: {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      user: process.env.MAIL_USER || undefined,
      pass: process.env.MAIL_PASS || undefined,
      from: process.env.MAIL_FROM,
    },
  });

  if (result.success) {
    return result.data;
  }

  throw new ConfigException(
    `Invalid application configuration: ${result.error.message}`,
  );
};
