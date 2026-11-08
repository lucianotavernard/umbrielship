import {
  InvitationDelivery,
  InvitationDeliveryInput,
} from '@/package/identity/invitation/contracts/invitation-delivery.contract';

export class FakeInvitationDelivery implements InvitationDelivery {
  public delivered: InvitationDeliveryInput[] = [];
  // Each call shifts one behaviour: 'fail', 'hang' or anything else succeeds.
  public script: ('ok' | 'fail' | 'hang')[] = [];

  async deliver(input: InvitationDeliveryInput): Promise<void> {
    const step = this.script.shift() ?? 'ok';
    if (step === 'fail') throw new Error('smtp down');
    if (step === 'hang') return new Promise<void>(() => undefined);
    this.delivered.push(input);
  }
}
