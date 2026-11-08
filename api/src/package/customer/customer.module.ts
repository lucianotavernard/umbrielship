import { Module } from '@nestjs/common';

import { PrismaModule } from '@/package/shared/module/prisma/prisma.module';

import { CustomerFacade } from './customer.facade';
import { ICustomersRepository } from './customer/contracts/customer-repository.contract';
import { CreateCustomerUseCase } from './customer/create-customer.use-case';
import { CustomerController } from './customer/customer.controller';
import { PrismaCustomersRepository } from './customer/customer.repository';
import { EditCustomerUseCase } from './customer/edit-customer.use-case';
import { FetchCustomersUseCase } from './customer/fetch-customers.use-case';
import { GetCustomerByIdUseCase } from './customer/get-customer-by-id.use-case';
import { IVesselsRepository } from './vessel/contracts/vessel-repository.contract';
import { CreateVesselUseCase } from './vessel/create-vessel.use-case';
import { DeleteVesselUseCase } from './vessel/delete-vessel.use-case';
import { EditVesselUseCase } from './vessel/edit-vessel.use-case';
import { FetchVesselsUseCase } from './vessel/fetch-vessels.use-case';
import { GetVesselByIdUseCase } from './vessel/get-vessel-by-id.use-case';
import { VesselController } from './vessel/vessel.controller';
import { PrismaVesselsRepository } from './vessel/vessel.repository';

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
