import { Module } from '@nestjs/common';

import { ConfigModule } from '@/package/shared/module/config/config.module';
import { PrismaService } from '@/package/shared/module/prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
