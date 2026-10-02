import { UserEntity } from '@/common/database/entities';
import { HelperModule } from '@/common/helper/helper.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepositoryImpl } from './repositories/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), HelperModule],
  controllers: [UserController],
  providers: [UserService, UserRepositoryImpl],
  exports: [UserService, UserRepositoryImpl],
})
export class UserModule {}
