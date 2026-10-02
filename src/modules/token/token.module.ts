import { TokenEntity } from '@/common/database/entities';
import { HelperModule } from '@/common/helper/helper.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenRepositoryImpl } from './repositories/token.repository';
import { TokenService } from './services/token.service';

@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity]), HelperModule],
  controllers: [],
  providers: [TokenService, TokenRepositoryImpl],
  exports: [TokenService, TokenRepositoryImpl],
})
export class TokenModule {}
