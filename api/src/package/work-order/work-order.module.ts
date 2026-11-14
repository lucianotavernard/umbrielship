import { Module } from '@nestjs/common';

import { PrismaModule } from '@/package/shared/module/prisma/prisma.module.js';

import { CustomerModule } from '../customer/customer.module.js';
import { IInspectionTemplatesRepository } from './inspection-template/contracts/inspection-template-repository.contract.js';
import { CreateInspectionTemplateUseCase } from './inspection-template/create-inspection-template.use-case.js';
import { DeleteInspectionTemplateUseCase } from './inspection-template/delete-inspection-template.use-case.js';
import { EditInspectionTemplateUseCase } from './inspection-template/edit-inspection-template.use-case.js';
import { FetchInspectionTemplatesUseCase } from './inspection-template/fetch-inspection-templates.use-case.js';
import { GetInspectionTemplateByIdUseCase } from './inspection-template/get-inspection-template-by-id.use-case.js';
import { InspectionTemplateController } from './inspection-template/inspection-template.controller.js';
import { PrismaInspectionTemplatesRepository } from './inspection-template/inspection-template.repository.js';
import { IWorkOrdersRepository } from './work-order/contracts/work-order-repository.contract.js';
import { CreateWorkOrderUseCase } from './work-order/create-work-order.use-case.js';
import { DeleteWorkOrderUseCase } from './work-order/delete-work-order.use-case.js';
import { EditWorkOrderUseCase } from './work-order/edit-work-order.use-case.js';
import { FetchWorkOrdersUseCase } from './work-order/fetch-work-orders.use-case.js';
import { GetWorkOrderByIdUseCase } from './work-order/get-work-order-by-id.use-case.js';
import { WorkOrderController } from './work-order/work-order.controller.js';
import { PrismaWorkOrdersRepository } from './work-order/work-order.repository.js';
import { IWorkOrderServiceImagesRepository } from './work-order-service-image/contracts/work-order-service-image-repository.contract.js';
import { AddWorkOrderServiceImageUseCase } from './work-order-service-image/add-work-order-service-image.use-case.js';
import { FetchWorkOrderServiceImagesUseCase } from './work-order-service-image/fetch-work-order-service-images.use-case.js';
import { RemoveWorkOrderServiceImageUseCase } from './work-order-service-image/remove-work-order-service-image.use-case.js';
import { WorkOrderServiceImageController } from './work-order-service-image/work-order-service-image.controller.js';
import { PrismaWorkOrderServiceImagesRepository } from './work-order-service-image/work-order-service-image.repository.js';
import { IWorkOrderServicesRepository } from './work-order-service/contracts/work-order-service-repository.contract.js';
import { CreateWorkOrderServiceUseCase } from './work-order-service/create-work-order-service.use-case.js';
import { DeleteWorkOrderServiceUseCase } from './work-order-service/delete-work-order-service.use-case.js';
import { EditWorkOrderServiceUseCase } from './work-order-service/edit-work-order-service.use-case.js';
import { FetchWorkOrderServicesUseCase } from './work-order-service/fetch-work-order-services.use-case.js';
import { GetWorkOrderServiceByIdUseCase } from './work-order-service/get-work-order-service-by-id.use-case.js';
import { WorkOrderServiceController } from './work-order-service/work-order-service.controller.js';
import { PrismaWorkOrderServicesRepository } from './work-order-service/work-order-service.repository.js';

@Module({
  imports: [PrismaModule, CustomerModule],
  controllers: [
    WorkOrderController,
    WorkOrderServiceController,
    WorkOrderServiceImageController,
    InspectionTemplateController,
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
    CreateInspectionTemplateUseCase,
    FetchInspectionTemplatesUseCase,
    GetInspectionTemplateByIdUseCase,
    EditInspectionTemplateUseCase,
    DeleteInspectionTemplateUseCase,
    { provide: IWorkOrdersRepository, useClass: PrismaWorkOrdersRepository },
    {
      provide: IWorkOrderServicesRepository,
      useClass: PrismaWorkOrderServicesRepository,
    },
    {
      provide: IWorkOrderServiceImagesRepository,
      useClass: PrismaWorkOrderServiceImagesRepository,
    },
    {
      provide: IInspectionTemplatesRepository,
      useClass: PrismaInspectionTemplatesRepository,
    },
  ],
})
export class WorkOrderModule {}
