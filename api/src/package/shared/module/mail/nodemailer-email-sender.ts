import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

import { ConfigService } from '../config/config.service';
import { EmailSender, SendEmailParams } from './contracts/email-sender';

@Injectable()
export class NodemailerEmailSender implements EmailSender {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(configService: ConfigService) {
    const user = configService.get('mail.user');
    const pass = configService.get('mail.pass');

    this.from = configService.get('mail.from');

    this.transporter = createTransport({
      host: configService.get('mail.host'),
      port: configService.get('mail.port'),
      secure: false,
      // A local catcher such as Mailpit takes mail without authentication.
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
  }

  async send(params: SendEmailParams): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
  }
}
