import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { type JwtFromRequestFunction, Strategy } from 'passport-jwt';
import * as PassportJwt from 'passport-jwt';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(private configService: ConfigService) {
    const ExtractJwt = PassportJwt.ExtractJwt;
    const jwtFromRequest: JwtFromRequestFunction =
      ExtractJwt.fromAuthHeaderAsBearerToken();

    super({
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.accessToken.secret'),
    });
  }

  async validate(payload: Record<string, string | number>) {
    return payload;
  }
}
