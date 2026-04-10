import { Module } from '@nestjs/common';

import { PrismaModule } from '@/shared/module/prisma/prisma.module';

import { UserRepository } from '@/identity/core/interface/user.repository';
import { PrismaUsersRepository } from './repository/prisma-users.repository';

const IDENTITY_REPOSITORIES = [
  { provide: UserRepository, useClass: PrismaUsersRepository },
];

@Module({
  imports: [PrismaModule],
  providers: IDENTITY_REPOSITORIES,
  exports: IDENTITY_REPOSITORIES,
})
export class IdentityPersistenceModule {}
