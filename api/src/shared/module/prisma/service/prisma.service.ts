import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { ConfigService } from '@/shared/module/config/service/config.service';
import { PrismaClient } from '@/shared/module/prisma/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.get('database.url'),
    });

    super({ adapter });
  }
}
