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
import { AcceptInvitationUseCase } from './invitation/accept-invitation.use-case';
import { IInvitationsRepository } from './invitation/contracts/invitation-repository.contract';
import { FetchInvitationsUseCase } from './invitation/fetch-invitations.use-case';
import { InvitationController } from './invitation/invitation.controller';
import { PrismaInvitationsRepository } from './invitation/invitation.repository';
import { ResendInvitationUseCase } from './invitation/resend-invitation.use-case';
import { SendInvitationUseCase } from './invitation/send-invitation.use-case';
import { CreateOrganizationUseCase } from './organization/create-organization.use-case';
import { FetchOrganizationsUseCase } from './organization/fetch-organizations.use-case';
import { GetOrganizationByIdUseCase } from './organization/get-organization-by-id.use-case';
import { InternalAdministratorGuard } from './organization/internal-administrator.guard';
import { OrganizationController } from './organization/organization.controller';
import { CountOrganizationRolesUseCase } from './user/count-organization-roles.use-case';
import { CreateUserUseCase } from './user/create-user.use-case';
import { FetchOrganizationUsersUseCase } from './user/fetch-organization-users.use-case';
import { FetchUsersUseCase } from './user/fetch-users.use-case';
import { UserController } from './user/user.controller';
import { IUsersRepository } from './user/contracts/user-repository.contract';
import { PrismaUsersRepository } from './user/user.repository';

@Module({
  imports: [ConfigModule, CryptographyModule, PrismaModule],
  controllers: [
    AuthenticationController,
    OrganizationController,
    UserController,
    InvitationController,
  ],
  providers: [
    JwtStrategy,
    AuthenticateUserUseCase,
    GetProfileUseCase,
    ResolveSessionUseCase,
    SwitchOrganizationUseCase,
    InternalAdministratorGuard,
    CreateOrganizationUseCase,
    FetchOrganizationsUseCase,
    GetOrganizationByIdUseCase,
    CreateUserUseCase,
    FetchOrganizationUsersUseCase,
    FetchUsersUseCase,
    CountOrganizationRolesUseCase,
    SendInvitationUseCase,
    ResendInvitationUseCase,
    AcceptInvitationUseCase,
    FetchInvitationsUseCase,
    { provide: IInvitationsRepository, useClass: PrismaInvitationsRepository },
    { provide: IUsersRepository, useClass: PrismaUsersRepository },
    {
      provide: IOrganizationsRepository,
      useClass: PrismaOrganizationsRepository,
    },
  ],
})
export class IdentityModule {}
