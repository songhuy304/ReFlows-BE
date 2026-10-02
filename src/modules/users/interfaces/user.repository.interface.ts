import { BaseRepository } from '@/common/core';
import { UserEntity } from '@/common/database/entities/user.entity';
import { EAuthProvider } from '@/modules/auth/enums/provider.enum';

export abstract class IUserRepository extends BaseRepository<UserEntity> {
  abstract findByEmail(
    email: string,
    provider?: EAuthProvider,
  ): Promise<UserEntity | null>;
  abstract findById(id: number): Promise<UserEntity | null>;
}
