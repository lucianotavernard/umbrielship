import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { ConfigService } from '@/package/shared/module/config/config.service.js';
import { sharedConfigFactory } from '@/package/shared/module/config/shared.config.js';

@Module({
  imports: [
    NestConfigModule.forRoot({
      expandVariables: true,
      load: [sharedConfigFactory],
      isGlobal: true,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
