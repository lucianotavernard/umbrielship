import { ConfigException } from '../exception/config.exception';
import { configSchema } from './config.schema';
import { Config } from './config.type';

export const factory = (): Config => {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    jwt: {
      secret: process.env.JWT_SECRET,
      expirationIn: process.env.JWT_EXPIRATION_IN,
    },
    database: {
      url: process.env.DATABASE_URL,
    },
  });

  if (result.success) {
    return result.data;
  }

  throw new ConfigException(
    `Invalid application configuration: ${result.error.message}`,
  );
};