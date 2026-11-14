import type { INestApplication, Provider, Type } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { JwtStrategy } from '@/package/identity/auth/jwt.strategy.js';
import { ResolveSessionUseCase } from '@/package/identity/auth/resolve-session.use-case.js';
import { AuthModule } from '@/package/shared/module/auth/auth.module.js';
import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';
import { ConfigModule } from '@/package/shared/module/config/config.module.js';

// Boots controllers behind the real JwtAuthGuard and RolesGuard, with no database: the session
// resolves from `users` by the token's `sub`, and every use case is a provider the spec passes.
export async function bootHttp({
  controllers,
  providers,
  users,
}: {
  controllers: Type[];
  providers: Provider[];
  users: Record<string, UserPayload>;
}): Promise<{ app: INestApplication; sign: (sub: string) => string }> {
  Object.assign(process.env, {
    NODE_ENV: 'test',
    PORT: '3333',
    JWT_SECRET: 'http-spec',
    JWT_EXPIRATION_IN: '1h',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/test',
    REDIS_URL: 'redis://localhost:6379',
    WEB_ORIGIN: 'http://localhost:4200',
    MAIL_HOST: 'localhost',
    MAIL_PORT: '1025',
    MAIL_FROM: 'test@example.com',
  });

  const moduleRef = await Test.createTestingModule({
    imports: [ConfigModule, AuthModule],
    controllers,
    providers: [
      JwtStrategy,
      {
        provide: ResolveSessionUseCase,
        useValue: {
          handle: async ({ userId }: { userId: string }) => users[userId],
        },
      },
      ...providers,
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const jwt = app.get(JwtService);
  return { app, sign: (sub) => jwt.sign({ sub }) };
}
