import { SendMailOptions } from './mail.interface';

export interface IMailService {
  sendEmail(input: SendMailOptions): Promise<void>;
}
