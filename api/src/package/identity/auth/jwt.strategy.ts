import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { z } from 'zod';

import { NotFoundDomainException } from '@/package/shared/lib/exception/not-found-domain.exception.js';
import type { UserPayload } from '@/package/shared/module/auth/user-payload.js';
import { ConfigService } from '@/package/shared/module/config/config.service.js';

import { ResolveSessionUseCase } from './resolve-session.use-case.js';

const tokenPayloadSchema = z.object({
  sub: z.uuid(),
});

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private resolveSession: ResolveSessionUseCase,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  // The active Organization is read from the User on every request, so a switch
  // takes effect for every session of that User.
  async validate(payload: unknown): Promise<UserPayload> {
    const { sub } = tokenPayloadSchema.parse(payload);

    try {
      return await this.resolveSession.handle({ userId: sub });
    } catch (error) {
      if (error instanceof NotFoundDomainException) {
        throw new UnauthorizedException();
      }

      throw error;
    }
  }
}
