import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { z } from 'zod';

import type { UserPayload } from '@/package/shared/module/auth/user-payload';
import { ConfigService } from '@/package/shared/module/config/config.service';

const tokenPayloadSchema = z.object({
  sub: z.uuid(),
});

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: unknown): Promise<UserPayload> {
    return tokenPayloadSchema.parse(payload);
  }
}
