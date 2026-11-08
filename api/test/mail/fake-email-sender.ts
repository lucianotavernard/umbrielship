import {
  EmailSender,
  SendEmailParams,
} from '@/package/shared/module/mail/contracts/email-sender';

export class FakeEmailSender implements EmailSender {
  public sentEmails: SendEmailParams[] = [];

  async send(params: SendEmailParams): Promise<void> {
    this.sentEmails.push(params);
  }
}
