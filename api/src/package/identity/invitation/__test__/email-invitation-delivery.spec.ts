import { beforeEach, describe, expect, it } from 'vitest';
import { FakeEmailSender } from '@test/mail/fake-email-sender.js';

import { InvitationDeliveryInput } from '../contracts/invitation-delivery.contract.js';
import { EmailInvitationDelivery } from '../email-invitation-delivery.js';

let emailSender: FakeEmailSender;
let sut: EmailInvitationDelivery;

const input: InvitationDeliveryInput = {
  organizationId: 'organization-1',
  invitationId: 'invitation-1',
  userId: 'user-1',
  email: 'ana@acme.com',
  organizationName: 'Costa Branca',
  role: 'operator',
  acceptUrl: 'http://localhost:4200/invitations/accept?secret=ab12',
};

describe('Email invitation delivery', () => {
  beforeEach(() => {
    emailSender = new FakeEmailSender();
    sut = new EmailInvitationDelivery(emailSender);
  });

  it('[C58] sends one email with the organization, the role and the link', async () => {
    await sut.deliver(input);

    expect(emailSender.sentEmails).toHaveLength(1);
    const [email] = emailSender.sentEmails;
    expect(email.to).toBe('ana@acme.com');
    expect(email.subject).toBe('Convite para Costa Branca');
    expect(email.text).toContain('Costa Branca');
    expect(email.text).toContain('como Operador');
    expect(email.text).toContain(
      'http://localhost:4200/invitations/accept?secret=ab12',
    );
    expect(email.html).toContain(
      'href="http://localhost:4200/invitations/accept?secret=ab12"',
    );
    expect(email.html).toContain('como Operador');

    await sut.deliver({ ...input, role: 'administrator' });
    expect(emailSender.sentEmails[1].text).toContain('como Administrador');
  });

  it('[C58] escapes the values it writes into the html', async () => {
    await sut.deliver({ ...input, organizationName: 'A & <B> "C"' });

    const [email] = emailSender.sentEmails;
    expect(email.html).toContain('A &amp; &lt;B&gt; &quot;C&quot;');
    expect(email.html).not.toContain('<B>');
  });

  it('[C58] rejects when the email sender rejects', async () => {
    const failure = new Error('535 Authentication failed');
    emailSender.send = async () => {
      throw failure;
    };

    await expect(sut.deliver(input)).rejects.toBe(failure);
  });

  it('inspector C18 names the inspector Role Inspetor in the email', async () => {
    await sut.deliver({ ...input, role: 'inspector' });

    const [email] = emailSender.sentEmails;
    expect(email.text).toContain('como Inspetor');
  });
});
