import { Injectable } from '@nestjs/common';
import {
  ConfigService as NestConfigService,
  Path,
  PathValue,
} from '@nestjs/config';

import { Config } from '@/shared/module/config/util/config.type';

@Injectable()
export class ConfigService<C = Config> {
  constructor(private configService: NestConfigService<C, true>) {}

  get<P extends Path<C>>(key: P): PathValue<C, P> {
    return this.configService.get(key, { infer: true });
  }
}
