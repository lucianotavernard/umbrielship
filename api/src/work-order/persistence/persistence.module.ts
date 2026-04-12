import { Module } from '@nestjs/common';

import { PrismaModule } from '@/shared/module/prisma/prisma.module';

import { WorkOrderRepository } from '@/work-order/core/interface/work-order.repository';
import { WorkOrderServiceImageRepository } from '@/work-order/core/interface/work-order-service-image.repository';
import { WorkOrderServiceRepository } from '@/work-order/core/interface/work-order-service.repository';
import { PrismaWorkOrderServiceImagesRepository } from './repository/prisma-work-order-service-images.repository';
import { PrismaWorkOrderServicesRepository } from './repository/prisma-work-order-services.repository';
import { PrismaWorkOrdersRepository } from './repository/prisma-work-orders.repository';

const WORK_ORDER_REPOSITORIES = [
  { provide: WorkOrderRepository, useClass: PrismaWorkOrdersRepository },
  {
    provide: WorkOrderServiceRepository,
    useClass: PrismaWorkOrderServicesRepository,
  },
  {
    provide: WorkOrderServiceImageRepository,
    useClass: PrismaWorkOrderServiceImagesRepository,
  },
];

@Module({
  imports: [PrismaModule],
  providers: WORK_ORDER_REPOSITORIES,
  exports: WORK_ORDER_REPOSITORIES,
})
export class WorkOrderPersistenceModule {}
