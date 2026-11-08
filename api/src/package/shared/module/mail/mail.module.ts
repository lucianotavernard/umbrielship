import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { EmailSender } from './contracts/email-sender';
import { NodemailerEmailSender } from './nodemailer-email-sender';

@Module({
  imports: [ConfigModule],
  providers: [{ provide: EmailSender, useClass: NodemailerEmailSender }],
  exports: [EmailSender],
})
export class MailModule {}
