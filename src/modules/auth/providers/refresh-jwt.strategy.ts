import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => request.body?.refreshToken ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('auth.refreshToken.secret'),
    });
  }

  async validate(payload: Record<string, string | number>) {
    return payload;
  }
}
