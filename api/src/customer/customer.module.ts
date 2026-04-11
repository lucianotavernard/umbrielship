import { Module } from '@nestjs/common';

import { ConfigModule } from '@/shared/module/config/config.module';
import { CryptographyModule } from '@/shared/module/cryptography/cryptography.module';

import { CustomerPersistenceModule } from './persistence/persistence.module';

import { CreateCustomerUseCase } from './core/use-case/create-customer.use-case';
import { FetchCustomersUseCase } from './core/use-case/fetch-customers.use-case';
import { EditCustomerUseCase } from './core/use-case/edit-customer.use-case';
import { GetCustomerByIdUseCase } from './core/use-case/get-customer-by-id.use-case';
import { CreateVesselUseCase } from './core/use-case/create-vessel.use-case';
import { DeleteVesselUseCase } from './core/use-case/delete-vessel.use-case';
import { EditVesselUseCase } from './core/use-case/edit-vessel.use-case';
import { FetchVesselsUseCase } from './core/use-case/fetch-vessels.use-case';
import { GetVesselByIdUseCase } from './core/use-case/get-vessel-by-id.use-case';
import { GetCustomerByIdController } from './http/rest/controller/get-customer.controller';
import { CreateCustomerController } from './http/rest/controller/create-customer.controller';
import { FetchCustomersController } from './http/rest/controller/fetch-customers.controller';
import { EditCustomerController } from './http/rest/controller/edit-customer.controller';
import { CreateVesselController } from './http/rest/controller/create-vessel.controller';
import { DeleteVesselController } from './http/rest/controller/delete-vessel.controller';
import { EditVesselController } from './http/rest/controller/edit-vessel.controller';
import { FetchVesselsController } from './http/rest/controller/fetch-vessels.controller';
import { GetVesselController } from './http/rest/controller/get-vessel.controller';

@Module({
  imports: [ConfigModule, CryptographyModule, CustomerPersistenceModule],
  controllers: [
    FetchCustomersController,
    CreateCustomerController,
    GetCustomerByIdController,
    EditCustomerController,
    CreateVesselController,
    EditVesselController,
    FetchVesselsController,
    GetVesselController,
    DeleteVesselController,
  ],
  providers: [
    CreateCustomerUseCase,
    EditCustomerUseCase,
    FetchCustomersUseCase,
    GetCustomerByIdUseCase,
    CreateVesselUseCase,
    EditVesselUseCase,
    FetchVesselsUseCase,
    GetVesselByIdUseCase,
    DeleteVesselUseCase,
  ],
})
export class CustomerModule {}
