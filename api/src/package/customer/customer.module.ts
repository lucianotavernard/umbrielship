import { Module } from '@nestjs/common';

import { PrismaModule } from '@/package/shared/module/prisma/prisma.module.js';

import { CustomerFacade } from './customer.facade.js';
import { ICustomersRepository } from './customer/contracts/customer-repository.contract.js';
import { CreateCustomerUseCase } from './customer/create-customer.use-case.js';
import { CustomerController } from './customer/customer.controller.js';
import { PrismaCustomersRepository } from './customer/customer.repository.js';
import { EditCustomerUseCase } from './customer/edit-customer.use-case.js';
import { FetchCustomersUseCase } from './customer/fetch-customers.use-case.js';
import { GetCustomerByIdUseCase } from './customer/get-customer-by-id.use-case.js';
import { IVesselsRepository } from './vessel/contracts/vessel-repository.contract.js';
import { CreateVesselUseCase } from './vessel/create-vessel.use-case.js';
import { DeleteVesselUseCase } from './vessel/delete-vessel.use-case.js';
import { EditVesselUseCase } from './vessel/edit-vessel.use-case.js';
import { FetchVesselsUseCase } from './vessel/fetch-vessels.use-case.js';
import { GetVesselByIdUseCase } from './vessel/get-vessel-by-id.use-case.js';
import { VesselController } from './vessel/vessel.controller.js';
import { PrismaVesselsRepository } from './vessel/vessel.repository.js';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerController, VesselController],
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
    CustomerFacade,
    { provide: ICustomersRepository, useClass: PrismaCustomersRepository },
    { provide: IVesselsRepository, useClass: PrismaVesselsRepository },
  ],
  exports: [CustomerFacade],
})
export class CustomerModule {}
