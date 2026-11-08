import { Injectable } from '@nestjs/common';

import { EmailSender } from '@/package/shared/module/mail/contracts/email-sender.js';

import { Role } from '../user/user.entity.js';
import {
  InvitationDelivery,
  InvitationDeliveryInput,
} from './contracts/invitation-delivery.contract.js';

const roleLabels: Record<Role, string> = {
  administrator: 'Administrador',
  operator: 'Operador',
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

@Injectable()
export class EmailInvitationDelivery implements InvitationDelivery {
  constructor(private emailSender: EmailSender) {}

  async deliver({
    email,
    organizationName,
    role,
    acceptUrl,
  }: InvitationDeliveryInput): Promise<void> {
    const invitation = `Você foi convidado para a organização ${organizationName} como ${roleLabels[role]}.`;

    await this.emailSender.send({
      to: email,
      subject: `Convite para ${organizationName}`,
      html: [
        `<p>Você foi convidado para a organização ${escapeHtml(organizationName)} como ${roleLabels[role]}.</p>`,
        `<p>Para aceitar, acesse <a href="${escapeHtml(acceptUrl)}">${escapeHtml(acceptUrl)}</a></p>`,
      ].join('\n'),
      text: `${invitation} Para aceitar, acesse ${acceptUrl}`,
    });
  }
}
