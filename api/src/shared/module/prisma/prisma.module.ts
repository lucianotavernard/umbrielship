import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { PrismaService } from './service/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
