import { EAuthProvider } from '../enums/provider.enum';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserOauthDto } from '../dtos/request';
import { BadRequestException } from '@/common/filters/exception';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('auth.githubOauth.clientId'),
      clientSecret: configService.get<string>('auth.githubOauth.secret'),
      callbackURL: configService.get<string>('auth.githubOauth.redirectUrl'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const { displayName, username, photos } = profile;

    const email = username;

    if (!email) {
      throw new BadRequestException('Github account does not have an email');
    }

    const user: UserOauthDto = {
      fullName: displayName,
      email: email,
      provider: EAuthProvider.GITHUB,
      avatar: photos[0].value,
    };

    return user;
  }
}
