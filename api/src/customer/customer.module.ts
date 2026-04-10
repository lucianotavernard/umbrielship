import { Module } from '@nestjs/common';

import { ConfigModule } from '@/shared/module/config/config.module';
import { CryptographyModule } from '@/shared/module/cryptography/cryptography.module';

import { CustomerPersistenceModule } from './persistence/persistence.module';

import { CreateCustomerUseCase } from './core/use-case/create-customer.use-case';
import { FetchCustomersUseCase } from './core/use-case/fetch-customers.use-case';
import { EditCustomerUseCase } from './core/use-case/edit-customer.use-case';
import { GetCustomerByIdUseCase } from './core/use-case/get-customer-by-id.use-case';
import { GetCustomerByIdController } from './http/rest/controller/get-customer.controller';
import { CreateCustomerController } from './http/rest/controller/create-customer.controller';
import { FetchCustomersController } from './http/rest/controller/fetch-customers.controller';
import { EditCustomerController } from './http/rest/controller/edit-customer.controller';

@Module({
  imports: [ConfigModule, CryptographyModule, CustomerPersistenceModule],
  controllers: [
    FetchCustomersController,
    CreateCustomerController,
    GetCustomerByIdController,
    EditCustomerController,
  ],
  providers: [
    CreateCustomerUseCase,
    EditCustomerUseCase,
    FetchCustomersUseCase,
    GetCustomerByIdUseCase,
  ],
})
export class CustomerModule {}
