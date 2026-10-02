import { Module } from '@nestjs/common';
import { HelperPaginationService } from './services/helper.pagination.service';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { HelperEncryptionService } from './services/helper.encryption.service';
import { JwtService } from '@nestjs/jwt';
import { HelperMailService } from './services/helper.mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('app.mail.host'),
          port: configService.get<number>('app.mail.port'),
          auth: {
            user: configService.get<string>('app.mail.user'),
            pass: configService.get<string>('app.mail.password'),
          },
        },
        defaults: {
          from: configService.get<string>('app.mail.from'),
        },
        template: {
          dir: join(process.cwd(), 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [],
  providers: [
    HelperPaginationService,
    HelperQueryService,
    HelperEncryptionService,
    JwtService,
    HelperMailService,
  ],
  exports: [
    HelperPaginationService,
    HelperQueryService,
    HelperEncryptionService,
    JwtService,
    HelperMailService,
  ],
})
export class HelperModule {}
