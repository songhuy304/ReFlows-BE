import { EAuthProvider } from '../enums/provider.enum';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { UserOauthDto } from '../dtos/request';
import { BadRequestException } from '@/common/filters/exception';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('auth.googleOauth.clientId'),
      clientSecret: configService.get<string>('auth.googleOauth.secret'),
      callbackURL: configService.get<string>('auth.googleOauth.redirectUrl'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const { displayName, emails, photos } = profile;

    const email = emails[0].value;

    if (!email) {
      throw new BadRequestException('Google account does not have an email');
    }

    const user: UserOauthDto = {
      fullName: displayName,
      email: email,
      provider: EAuthProvider.GOOGLE,
      avatar: photos[0].value,
    };

    return user;
  }
}
