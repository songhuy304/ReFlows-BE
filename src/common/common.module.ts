import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import configs from '@/common/configs';
import { RequestModule } from '@/common/request/request.module';
import { HelperModule } from './helper/helper.module';
import { GuardModule } from './guard/guard.module';
import { UploadModule } from './upload/upload.module';
import { BullMqModule } from './bullmq/bullmq.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    // Configuration - Global
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),

    // Core Infrastructure
    GuardModule,
    DatabaseModule,
    RequestModule,
    HelperModule,
    CacheModule,
    UploadModule,
    BullMqModule,
  ],
  exports: [DatabaseModule, CacheModule, BullMqModule],
})
export class CommonModule {}
