import { Global, Module } from '@nestjs/common'
import {
  ConfigModule as NestConfigModule,
} from '@nestjs/config';

import { ConfigService } from './service/config.service';
import { factory } from './util/config.factory';

@Module({
  imports: [
    NestConfigModule.forRoot({
      expandVariables: true,
      load: [factory],
      isGlobal: true,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}