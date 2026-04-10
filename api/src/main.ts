import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { ConfigService } from '@/shared/module/config/service/config.service';
import type { Config } from '@/shared/module/config/util/config.type';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const configService = app.get<ConfigService<Config>>(ConfigService);
  const port = configService.get('port');

  await app.listen(port);

  Logger.log(`Server is running on port ${port}`);
}

void bootstrap();
