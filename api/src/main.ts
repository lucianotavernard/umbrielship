import { mkdirSync } from 'fs';
import { join } from 'path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { ConfigService } from '@/shared/module/config/service/config.service';
import type { Config } from '@/shared/module/config/util/config.type';
import { AppModule } from './app.module';

async function bootstrap() {
  const uploadsRoot = join(process.cwd(), 'uploads');
  const serviceImagesDir = join(uploadsRoot, 'work-order-service-images');
  mkdirSync(serviceImagesDir, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  app.useStaticAssets(uploadsRoot, { prefix: '/uploads' });

  const configService = app.get<ConfigService<Config>>(ConfigService);
  const port = configService.get('port');

  await app.listen(port);

  Logger.log(`Server is running on port ${port}`);
}

void bootstrap();
