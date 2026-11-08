import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { ConfigService } from '@/package/shared/module/config/config.service.js';
import { ConfigModule } from '@/package/shared/module/config/config.module.js';
import { CryptographyModule } from '@/package/shared/module/cryptography/cryptography.module.js';
import { MailModule } from '@/package/shared/module/mail/index.js';
import { PrismaModule } from '@/package/shared/module/prisma/prisma.module.js';

import { AuthenticateUserUseCase } from './auth/authenticate-user.use-case.js';
import { AuthenticationController } from './auth/authentication.controller.js';
import { GetProfileUseCase } from './auth/get-profile.use-case.js';
import { JwtStrategy } from './auth/jwt.strategy.js';
import { ResolveSessionUseCase } from './auth/resolve-session.use-case.js';
import { SwitchOrganizationUseCase } from './auth/switch-organization.use-case.js';
import { IOrganizationsRepository } from './organization/contracts/organization-repository.contract.js';
import { PrismaOrganizationsRepository } from './organization/organization.repository.js';
import { InvitationDelivery } from './invitation/contracts/invitation-delivery.contract.js';
import { InvitationDeliveryQueue } from './invitation/contracts/invitation-delivery-queue.contract.js';
import { DeliverInvitationUseCase } from './invitation/deliver-invitation.use-case.js';
import { EmailInvitationDelivery } from './invitation/email-invitation-delivery.js';
import { INVITATION_DELIVERY_QUEUE } from './invitation/invitation-delivery.queue.js';
import { InvitationDeliveryQueueConsumer } from './invitation/invitation-delivery.queue-consumer.js';
import { InvitationDeliveryQueueProducer } from './invitation/invitation-delivery.queue-producer.js';
import { InvitationDeliveryRecovery } from './invitation/invitation-delivery.recovery.js';
import { RecoverInvitationDeliveriesUseCase } from './invitation/recover-invitation-deliveries.use-case.js';
import { AcceptInvitationUseCase } from './invitation/accept-invitation.use-case.js';
import { IInvitationsRepository } from './invitation/contracts/invitation-repository.contract.js';
import { FetchInvitationsUseCase } from './invitation/fetch-invitations.use-case.js';
import { InvitationController } from './invitation/invitation.controller.js';
import { PrismaInvitationsRepository } from './invitation/invitation.repository.js';
import { ResendInvitationUseCase } from './invitation/resend-invitation.use-case.js';
import { SendInvitationUseCase } from './invitation/send-invitation.use-case.js';
import { CreateOrganizationUseCase } from './organization/create-organization.use-case.js';
import { FetchOrganizationsUseCase } from './organization/fetch-organizations.use-case.js';
import { GetOrganizationByIdUseCase } from './organization/get-organization-by-id.use-case.js';
import { InternalAdministratorGuard } from './organization/internal-administrator.guard.js';
import { OrganizationController } from './organization/organization.controller.js';
import { CountOrganizationRolesUseCase } from './user/count-organization-roles.use-case.js';
import { CreateUserUseCase } from './user/create-user.use-case.js';
import { FetchOrganizationUsersUseCase } from './user/fetch-organization-users.use-case.js';
import { FetchUsersUseCase } from './user/fetch-users.use-case.js';
import { UserController } from './user/user.controller.js';
import { IUsersRepository } from './user/contracts/user-repository.contract.js';
import { PrismaUsersRepository } from './user/user.repository.js';

@Module({
  imports: [
    ConfigModule,
    CryptographyModule,
    MailModule,
    PrismaModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: { url: configService.get('redis.url') },
      }),
    }),
    BullModule.registerQueue({ name: INVITATION_DELIVERY_QUEUE }),
  ],
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
    DeliverInvitationUseCase,
    RecoverInvitationDeliveriesUseCase,
    InvitationDeliveryQueueConsumer,
    InvitationDeliveryRecovery,
    {
      provide: InvitationDeliveryQueue,
      useClass: InvitationDeliveryQueueProducer,
    },
    { provide: InvitationDelivery, useClass: EmailInvitationDelivery },
    { provide: IInvitationsRepository, useClass: PrismaInvitationsRepository },
    { provide: IUsersRepository, useClass: PrismaUsersRepository },
    {
      provide: IOrganizationsRepository,
      useClass: PrismaOrganizationsRepository,
    },
  ],
})
export class IdentityModule {}
