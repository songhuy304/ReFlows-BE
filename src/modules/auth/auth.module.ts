import { HelperModule } from '@/common/helper/helper.module';
import { JwtAccessStrategy } from '@/modules/auth/providers/access-jwt.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../users/user.module';
import { OauthController } from './controller/auth.oauth.controller';
import { AuthPublicController } from './controller/auth.public.controller';
import { GithubStrategy } from './providers/github.strategy';
import { GoogleStrategy } from './providers/google.strategy';
import { JwtRefreshStrategy } from './providers/refresh-jwt.strategy';
import { AuthMailService } from './services/auth.mail.service';
import { AuthService } from './services/auth.service';

@Module({
  imports: [HelperModule, UserModule, TokenModule, PassportModule],
  controllers: [AuthPublicController, OauthController],
  providers: [
    JwtAccessStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    GithubStrategy,
    AuthService,
    AuthMailService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
