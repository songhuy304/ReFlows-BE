import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAccessGuard } from './providers/jwt.access.guard';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('app.throttle.ttl'),
            limit: configService.get('app.throttle.limit'),
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtAccessGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },
  ],
})
export class GuardModule {}
