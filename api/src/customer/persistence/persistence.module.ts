import { Module } from '@nestjs/common';

import { PrismaModule } from '@/shared/module/prisma/prisma.module';

import { CustomerRepository } from '@/customer/core/interface/customer.repository';
import { VesselRepository } from '@/customer/core/interface/vessel.repository';
import { PrismaCustomersRepository } from './repository/prisma-customers.repository';
import { PrismaVesselsRepository } from './repository/prisma-vessels.repository';

const CUSTOMER_REPOSITORIES = [
  { provide: CustomerRepository, useClass: PrismaCustomersRepository },
  { provide: VesselRepository, useClass: PrismaVesselsRepository },
];

@Module({
  imports: [PrismaModule],
  providers: CUSTOMER_REPOSITORIES,
  exports: CUSTOMER_REPOSITORIES,
})
export class CustomerPersistenceModule {}
