import { Injectable, Logger } from '@nestjs/common';
import { IMailService } from '../interfaces/mail.service.interface';
import { SendMailOptions } from '../interfaces/mail.interface';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class HelperMailService implements IMailService {
  private readonly logger = new Logger(HelperMailService.name);

  constructor(private readonly mailerService: MailerService) {}

  public async sendEmail(input: SendMailOptions): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: input.to,
        subject: input.subject,
        template: input.template,
        context: input.context,
      });

      this.logger.log(`Mail sent to ${input.to}`);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
