import { Module } from '@nestjs/common';

import { ConfigModule } from '@/package/shared/module/config/config.module.js';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service.js';

@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
