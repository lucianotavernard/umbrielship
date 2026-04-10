import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'

import { JwtModule, JwtSignOptions } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { ConfigModule } from '../config/config.module'
import { ConfigService } from '../config/service/config.service'

import { JwtStrategy } from './jwt.strategy'
import { JwtAuthGuard } from './jwt-auth.guard'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory(configService: ConfigService) {
        const jwtSecret = configService.get('jwt.secret');
        const jwtExpiresIn = configService.get('jwt.expirationIn');

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: jwtExpiresIn as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  providers: [
    JwtStrategy,
    ConfigService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}