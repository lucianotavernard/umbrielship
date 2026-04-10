import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@/shared/module/config/service/config.service';

import { accestTokenPayloadSchema } from './util/auth.schema';
import { AccessTokenPayload } from './util/auth.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtSecret = configService.get('jwt.secret');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: AccessTokenPayload) {
    return accestTokenPayloadSchema.parse(payload);
  }
}
