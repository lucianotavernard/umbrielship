import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { ConfigService } from '@/package/shared/module/config/config.service';
import { ConfigModule } from '@/package/shared/module/config/config.module';
import { CryptographyModule } from '@/package/shared/module/cryptography/cryptography.module';
import { MailModule } from '@/package/shared/module/mail';
import { PrismaModule } from '@/package/shared/module/prisma/prisma.module';

import { AuthenticateUserUseCase } from './auth/authenticate-user.use-case';
import { AuthenticationController } from './auth/authentication.controller';
import { GetProfileUseCase } from './auth/get-profile.use-case';
import { JwtStrategy } from './auth/jwt.strategy';
import { ResolveSessionUseCase } from './auth/resolve-session.use-case';
import { SwitchOrganizationUseCase } from './auth/switch-organization.use-case';
import { IOrganizationsRepository } from './organization/contracts/organization-repository.contract';
import { PrismaOrganizationsRepository } from './organization/organization.repository';
import { InvitationDelivery } from './invitation/contracts/invitation-delivery.contract';
import { InvitationDeliveryQueue } from './invitation/contracts/invitation-delivery-queue.contract';
import { DeliverInvitationUseCase } from './invitation/deliver-invitation.use-case';
import { EmailInvitationDelivery } from './invitation/email-invitation-delivery';
import { INVITATION_DELIVERY_QUEUE } from './invitation/invitation-delivery.queue';
import { InvitationDeliveryQueueConsumer } from './invitation/invitation-delivery.queue-consumer';
import { InvitationDeliveryQueueProducer } from './invitation/invitation-delivery.queue-producer';
import { InvitationDeliveryRecovery } from './invitation/invitation-delivery.recovery';
import { RecoverInvitationDeliveriesUseCase } from './invitation/recover-invitation-deliveries.use-case';
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
