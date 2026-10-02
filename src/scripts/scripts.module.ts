import configs from '@/common/configs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from 'src/common/database/database.module';
import { SeedCommand } from './seeds/seed.command';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
  ],
  providers: [SeedCommand],
})
export class ScriptsModule {}
