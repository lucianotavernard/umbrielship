import { Module } from '@nestjs/common';

import { ConfigModule } from '@/package/shared/module/config/config.module';
import { CryptographyModule } from '@/package/shared/module/cryptography/cryptography.module';
import { PrismaModule } from '@/package/shared/module/prisma/prisma.module';

import { AuthenticateUserUseCase } from './auth/authenticate-user.use-case';
import { AuthenticationController } from './auth/authentication.controller';
import { GetProfileUseCase } from './auth/get-profile.use-case';
import { JwtStrategy } from './auth/jwt.strategy';
import { ResolveSessionUseCase } from './auth/resolve-session.use-case';
import { SwitchOrganizationUseCase } from './auth/switch-organization.use-case';
import { IOrganizationsRepository } from './organization/contracts/organization-repository.contract';
import { PrismaOrganizationsRepository } from './organization/organization.repository';
import { IUsersRepository } from './user/contracts/user-repository.contract';
import { PrismaUsersRepository } from './user/user.repository';

@Module({
  imports: [ConfigModule, CryptographyModule, PrismaModule],
  controllers: [AuthenticationController],
  providers: [
    JwtStrategy,
    AuthenticateUserUseCase,
    GetProfileUseCase,
    ResolveSessionUseCase,
    SwitchOrganizationUseCase,
    { provide: IUsersRepository, useClass: PrismaUsersRepository },
    {
      provide: IOrganizationsRepository,
      useClass: PrismaOrganizationsRepository,
    },
  ],
})
export class IdentityModule {}
