import { Injectable } from '@nestjs/common';
import {
  ConfigService as NestConfigService,
  Path,
  PathValue,
} from '@nestjs/config';

import type { SharedConfig } from '@/package/shared/module/config/shared.config';

@Injectable()
export class ConfigService<C = SharedConfig> {
  constructor(private configService: NestConfigService<C, true>) {}

  get<P extends Path<C>>(key: P): PathValue<C, P> {
    return this.configService.get(key, { infer: true });
  }
}
