import { Module } from '@nestjs/common';

import { CustomerPersistenceModule } from '@/customer/persistence/persistence.module';

import { AddWorkOrderServiceImageUseCase } from './core/use-case/add-work-order-service-image.use-case';
import { CreateWorkOrderUseCase } from './core/use-case/create-work-order.use-case';
import { CreateWorkOrderServiceUseCase } from './core/use-case/create-work-order-service.use-case';
import { DeleteWorkOrderUseCase } from './core/use-case/delete-work-order.use-case';
import { DeleteWorkOrderServiceUseCase } from './core/use-case/delete-work-order-service.use-case';
import { EditWorkOrderUseCase } from './core/use-case/edit-work-order.use-case';
import { EditWorkOrderServiceUseCase } from './core/use-case/edit-work-order-service.use-case';
import { FetchWorkOrdersUseCase } from './core/use-case/fetch-work-orders.use-case';
import { FetchWorkOrderServiceImagesUseCase } from './core/use-case/fetch-work-order-service-images.use-case';
import { FetchWorkOrderServicesUseCase } from './core/use-case/fetch-work-order-services.use-case';
import { GetWorkOrderByIdUseCase } from './core/use-case/get-work-order-by-id.use-case';
import { GetWorkOrderServiceByIdUseCase } from './core/use-case/get-work-order-service-by-id.use-case';
import { RemoveWorkOrderServiceImageUseCase } from './core/use-case/remove-work-order-service-image.use-case';
import { WorkOrderPersistenceModule } from './persistence/persistence.module';
import { CreateWorkOrderController } from './http/rest/controller/create-work-order.controller';
import { CreateWorkOrderServiceController } from './http/rest/controller/create-work-order-service.controller';
import { DeleteWorkOrderController } from './http/rest/controller/delete-work-order.controller';
import { DeleteWorkOrderServiceController } from './http/rest/controller/delete-work-order-service.controller';
import { DeleteWorkOrderServiceImageController } from './http/rest/controller/delete-work-order-service-image.controller';
import { EditWorkOrderController } from './http/rest/controller/edit-work-order.controller';
import { EditWorkOrderServiceController } from './http/rest/controller/edit-work-order-service.controller';
import { FetchWorkOrdersController } from './http/rest/controller/fetch-work-orders.controller';
import { FetchWorkOrderServiceImagesController } from './http/rest/controller/fetch-work-order-service-images.controller';
import { FetchWorkOrderServicesController } from './http/rest/controller/fetch-work-order-services.controller';
import { GetWorkOrderController } from './http/rest/controller/get-work-order.controller';
import { GetWorkOrderServiceController } from './http/rest/controller/get-work-order-service.controller';
import { UploadWorkOrderServiceImageController } from './http/rest/controller/upload-work-order-service-image.controller';

@Module({
  imports: [WorkOrderPersistenceModule, CustomerPersistenceModule],
  controllers: [
    CreateWorkOrderController,
    FetchWorkOrdersController,
    GetWorkOrderController,
    EditWorkOrderController,
    DeleteWorkOrderController,
    CreateWorkOrderServiceController,
    FetchWorkOrderServicesController,
    GetWorkOrderServiceController,
    EditWorkOrderServiceController,
    DeleteWorkOrderServiceController,
    UploadWorkOrderServiceImageController,
    FetchWorkOrderServiceImagesController,
    DeleteWorkOrderServiceImageController,
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
  ],
})
export class WorkOrderModule {}
