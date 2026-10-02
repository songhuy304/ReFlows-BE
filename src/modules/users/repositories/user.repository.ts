import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { UserEntity } from '@/common/database/entities';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { IUserRepository } from '../interfaces/user.repository.interface';
import { EAuthProvider } from '@/modules/auth/enums/provider.enum';

@Injectable()
export class UserRepositoryImpl extends IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    repo: TypeOrmRepository<UserEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }

  async findByEmail(
    email: string,
    provider?: EAuthProvider,
  ): Promise<UserEntity | null> {
    return this.repo.findOne({
      where: {
        email,
        ...(provider && { provider }),
      },
    });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.repo.findOne({
      where: { id },
    });
  }

  public async upsertUserRefreshToken(
    userId: number,
    refreshToken: string | null,
  ) {
    const hash = refreshToken ? refreshToken : null;
    await this.repo.update(userId, { refreshToken: hash });
  }
}
