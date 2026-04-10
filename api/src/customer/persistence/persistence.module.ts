import { Module } from '@nestjs/common';

import { PrismaModule } from '@/shared/module/prisma/prisma.module';

import { CustomerRepository } from '@/customer/core/interface/customer.repository';
import { PrismaCustomersRepository } from './repository/prisma-customers.repository';

const CUSTOMER_REPOSITORIES = [
  { provide: CustomerRepository, useClass: PrismaCustomersRepository },
];

@Module({
  imports: [PrismaModule],
  providers: CUSTOMER_REPOSITORIES,
  exports: CUSTOMER_REPOSITORIES,
})
export class CustomerPersistenceModule {}
