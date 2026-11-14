import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ConfigModule } from '@/package/shared/module/config/config.module.js';
import { ConfigService } from '@/package/shared/module/config/config.service.js';
import { JwtAuthGuard } from '@/package/shared/module/auth/jwt-auth.guard.js';
import { RolesGuard } from '@/package/shared/module/auth/roles.guard.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt.secret'),
          signOptions: {
            expiresIn: configService.get(
              'jwt.expirationIn',
            ) as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  providers: [
    // Order matters: the Role is read from the session JwtAuthGuard resolves.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
