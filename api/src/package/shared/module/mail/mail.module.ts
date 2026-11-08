import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module.js';
import { EmailSender } from './contracts/email-sender.js';
import { NodemailerEmailSender } from './nodemailer-email-sender.js';

@Module({
  imports: [ConfigModule],
  providers: [{ provide: EmailSender, useClass: NodemailerEmailSender }],
  exports: [EmailSender],
})
export class MailModule {}
