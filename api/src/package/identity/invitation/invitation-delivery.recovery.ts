import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { RecoverInvitationDeliveriesUseCase } from './recover-invitation-deliveries.use-case.js';

@Injectable()
export class InvitationDeliveryRecovery implements OnApplicationBootstrap {
  constructor(
    private recoverInvitationDeliveries: RecoverInvitationDeliveriesUseCase,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.recoverInvitationDeliveries.handle();
  }
}
