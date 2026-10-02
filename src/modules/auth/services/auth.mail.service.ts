import { HelperMailService } from '@/common/helper/services/helper.mail.service';
import { Injectable, Logger } from '@nestjs/common';
import { IAuthMailService } from '../interfaces/auth.mail.service.interface';
import { UserEntity } from '@/common/database/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMailService implements IAuthMailService {
  private readonly logger = new Logger(AuthMailService.name);
  private readonly frontendUrl: string;
  constructor(
    private readonly helperMailService: HelperMailService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = configService.get<string>('app.frontend');
  }

  public async forgotPasswordMail(
    user: UserEntity,
    token: string,
  ): Promise<void> {
    try {
      const resetLink = `${this.frontendUrl}/auth/reset-password?token=${token}`;

      await this.helperMailService.sendEmail({
        to: user.email,
        subject: 'Reset password',
        template: 'restore-password',
        context: {
          username: user.fullName || user.email,
          link: resetLink,
        },
      });

      this.logger.log(`Mail to ${user.email}`);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
