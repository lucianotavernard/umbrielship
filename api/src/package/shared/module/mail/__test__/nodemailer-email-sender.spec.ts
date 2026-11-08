import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTransport } from 'nodemailer';

import { ConfigService } from '../../config/config.service';
import { NodemailerEmailSender } from '../nodemailer-email-sender';

const sendMail = vi.fn(async () => ({}));

vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => ({ sendMail })),
}));

function configWith(mail: Record<string, unknown>) {
  return {
    get: (key: string) => mail[key.replace('mail.', '')],
  } as unknown as ConfigService;
}

describe('Nodemailer email sender', () => {
  beforeEach(() => {
    vi.mocked(createTransport).mockClear();
    sendMail.mockClear();
  });

  it('[C58] sends through one transport built from the mail settings', async () => {
    const sut = new NodemailerEmailSender(
      configWith({
        host: 'smtp.acme.test',
        port: 587,
        user: 'mailer',
        pass: 'mailer-password',
        from: 'Acme <no-reply@acme.test>',
      }),
    );

    await sut.send({
      to: 'ana@acme.com',
      subject: 'Convite',
      html: '<p>Oi</p>',
      text: 'Oi',
    });
    await sut.send({
      to: 'bia@acme.com',
      subject: 'Outro',
      html: '<p>Olá</p>',
    });

    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.acme.test',
      port: 587,
      secure: false,
      auth: { user: 'mailer', pass: 'mailer-password' },
    });
    expect(sendMail).toHaveBeenNthCalledWith(1, {
      from: 'Acme <no-reply@acme.test>',
      to: 'ana@acme.com',
      subject: 'Convite',
      html: '<p>Oi</p>',
      text: 'Oi',
    });
    expect(sendMail).toHaveBeenNthCalledWith(2, {
      from: 'Acme <no-reply@acme.test>',
      to: 'bia@acme.com',
      subject: 'Outro',
      html: '<p>Olá</p>',
      text: undefined,
    });
  });

  it('[C58] connects without authentication when no user is set', () => {
    new NodemailerEmailSender(
      configWith({ host: 'localhost', port: 1025, from: 'no-reply@acme.test' }),
    );

    expect(createTransport).toHaveBeenCalledWith({
      host: 'localhost',
      port: 1025,
      secure: false,
    });
  });
});
