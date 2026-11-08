import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@/package/shared/module/config/config.service.js';

import { IOrganizationsRepository } from '../organization/contracts/organization-repository.contract.js';
import { IUsersRepository } from '../user/contracts/user-repository.contract.js';
import { InvitationDelivery } from './contracts/invitation-delivery.contract.js';
import { IInvitationsRepository } from './contracts/invitation-repository.contract.js';
import { Invitation } from './invitation.entity.js';

export const MAX_DELIVERY_ATTEMPTS = 3;
export const DELIVERY_TIMEOUT_MS = 5_000;

type DeliverInvitationUseCaseRequest = {
  invitationId: string;
};

// retry: the attempt failed and the queue must try again; the other outcomes end the job.
export type DeliverInvitationOutcome =
  | 'delivered'
  | 'retry'
  | 'failed'
  | 'skipped';

type DeliverInvitationUseCaseResponse = {
  outcome: DeliverInvitationOutcome;
};

class DeliveryTimedOut extends Error {
  constructor() {
    super(`Delivery did not resolve in ${DELIVERY_TIMEOUT_MS} ms`);
  }
}

@Injectable()
export class DeliverInvitationUseCase {
  private readonly logger = new Logger('identity');

  constructor(
    private invitationsRepository: IInvitationsRepository,
    private usersRepository: IUsersRepository,
    private organizationsRepository: IOrganizationsRepository,
    private invitationDelivery: InvitationDelivery,
    private configService: ConfigService,
  ) {}

  async handle({
    invitationId,
  }: DeliverInvitationUseCaseRequest): Promise<DeliverInvitationUseCaseResponse> {
    const invitation = await this.invitationsRepository.findById(invitationId);
    if (!invitation) return { outcome: 'skipped' };

    if (invitation.status === 'accepted') {
      this.write('log', 'invitation_delivery_skipped', invitation);
      return { outcome: 'skipped' };
    }

    const user = await this.usersRepository.findById(invitation.userId);
    const organization = await this.organizationsRepository.findById(
      invitation.organizationId,
    );
    if (!user || !organization) {
      await this.invitationsRepository.recordDelivery(invitation.id, {
        deliveryStatus: 'failed',
        deliveryAttempts: invitation.deliveryAttempts,
        lastDeliveryFailureAt: invitation.lastDeliveryFailureAt,
      });
      this.write('error', 'invitation_delivery_failed', invitation, {
        reason: 'user or organization not found',
      });
      return { outcome: 'failed' };
    }

    const attempts = invitation.deliveryAttempts + 1;
    this.write('log', 'invitation_delivery_attempt', invitation, {
      attempt: attempts,
    });

    try {
      await this.withTimeout(
        this.invitationDelivery.deliver({
          organizationId: invitation.organizationId,
          invitationId: invitation.id,
          userId: invitation.userId,
          email: user.email,
          organizationName: organization.name,
          role: invitation.role,
          acceptUrl: this.acceptUrl(invitation.secret),
        }),
      );
    } catch (error) {
      const failed = attempts >= MAX_DELIVERY_ATTEMPTS;

      await this.invitationsRepository.recordDelivery(invitation.id, {
        deliveryStatus: failed ? 'failed' : 'queued',
        deliveryAttempts: attempts,
        lastDeliveryFailureAt: new Date(),
      });
      this.write(
        failed ? 'error' : 'warn',
        'invitation_delivery_attempt_failed',
        invitation,
        {
          attempt: attempts,
          message: error instanceof Error ? error.message : String(error),
        },
      );

      return { outcome: failed ? 'failed' : 'retry' };
    }

    await this.invitationsRepository.recordDelivery(invitation.id, {
      deliveryStatus: 'delivered',
      deliveryAttempts: attempts,
      lastDeliveryFailureAt: invitation.lastDeliveryFailureAt,
    });
    this.write('log', 'invitation_delivered', invitation, {
      attempt: attempts,
    });

    return { outcome: 'delivered' };
  }

  private acceptUrl(secret: string): string {
    const origin = this.configService.get('web.origin').replace(/\/+$/, '');

    return `${origin}/invitations/accept?secret=${encodeURIComponent(secret)}`;
  }

  private async withTimeout(delivery: Promise<void>): Promise<void> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new DeliveryTimedOut()),
        DELIVERY_TIMEOUT_MS,
      );
    });

    try {
      await Promise.race([delivery, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }

  // Never the email or the secret: the User is named by id.
  private write(
    level: 'log' | 'warn' | 'error',
    operation: string,
    invitation: Invitation,
    extra: Record<string, unknown> = {},
  ) {
    this.logger[level](
      JSON.stringify({
        operation,
        organizationId: invitation.organizationId,
        invitationId: invitation.id,
        userId: invitation.userId,
        ...extra,
      }),
    );
  }
}
