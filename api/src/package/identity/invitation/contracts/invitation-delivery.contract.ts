import { Role } from '../../user/user.entity';

export type InvitationDeliveryInput = {
  organizationId: string;
  invitationId: string;
  userId: string;
  email: string;
  organizationName: string;
  role: Role;
  acceptUrl: string;
};

export abstract class InvitationDelivery {
  abstract deliver(input: InvitationDeliveryInput): Promise<void>;
}
