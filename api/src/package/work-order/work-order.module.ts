import { Module } from '@nestjs/common';

import { PrismaModule } from '@/package/shared/module/prisma/prisma.module';

import { CustomerModule } from '../customer/customer.module';
import { IWorkOrdersRepository } from './work-order/contracts/work-order-repository.contract';
import { CreateWorkOrderUseCase } from './work-order/create-work-order.use-case';
import { DeleteWorkOrderUseCase } from './work-order/delete-work-order.use-case';
import { EditWorkOrderUseCase } from './work-order/edit-work-order.use-case';
import { FetchWorkOrdersUseCase } from './work-order/fetch-work-orders.use-case';
import { GetWorkOrderByIdUseCase } from './work-order/get-work-order-by-id.use-case';
import { WorkOrderController } from './work-order/work-order.controller';
import { PrismaWorkOrdersRepository } from './work-order/work-order.repository';
import { IWorkOrderServiceImagesRepository } from './work-order-service-image/contracts/work-order-service-image-repository.contract';
import { AddWorkOrderServiceImageUseCase } from './work-order-service-image/add-work-order-service-image.use-case';
import { FetchWorkOrderServiceImagesUseCase } from './work-order-service-image/fetch-work-order-service-images.use-case';
import { RemoveWorkOrderServiceImageUseCase } from './work-order-service-image/remove-work-order-service-image.use-case';
import { WorkOrderServiceImageController } from './work-order-service-image/work-order-service-image.controller';
import { PrismaWorkOrderServiceImagesRepository } from './work-order-service-image/work-order-service-image.repository';
import { IWorkOrderServicesRepository } from './work-order-service/contracts/work-order-service-repository.contract';
import { CreateWorkOrderServiceUseCase } from './work-order-service/create-work-order-service.use-case';
import { DeleteWorkOrderServiceUseCase } from './work-order-service/delete-work-order-service.use-case';
import { EditWorkOrderServiceUseCase } from './work-order-service/edit-work-order-service.use-case';
import { FetchWorkOrderServicesUseCase } from './work-order-service/fetch-work-order-services.use-case';
import { GetWorkOrderServiceByIdUseCase } from './work-order-service/get-work-order-service-by-id.use-case';
import { WorkOrderServiceController } from './work-order-service/work-order-service.controller';
import { PrismaWorkOrderServicesRepository } from './work-order-service/work-order-service.repository';

@Module({
  imports: [PrismaModule, CustomerModule],
  controllers: [
    WorkOrderController,
    WorkOrderServiceController,
    WorkOrderServiceImageController,
  ],
  providers: [
    CreateWorkOrderUseCase,
    FetchWorkOrdersUseCase,
    GetWorkOrderByIdUseCase,
    EditWorkOrderUseCase,
    DeleteWorkOrderUseCase,
    CreateWorkOrderServiceUseCase,
    FetchWorkOrderServicesUseCase,
    GetWorkOrderServiceByIdUseCase,
    EditWorkOrderServiceUseCase,
    DeleteWorkOrderServiceUseCase,
    AddWorkOrderServiceImageUseCase,
    RemoveWorkOrderServiceImageUseCase,
    FetchWorkOrderServiceImagesUseCase,
    { provide: IWorkOrdersRepository, useClass: PrismaWorkOrdersRepository },
    {
      provide: IWorkOrderServicesRepository,
      useClass: PrismaWorkOrderServicesRepository,
    },
    {
      provide: IWorkOrderServiceImagesRepository,
      useClass: PrismaWorkOrderServiceImagesRepository,
    },
  ],
})
export class WorkOrderModule {}
