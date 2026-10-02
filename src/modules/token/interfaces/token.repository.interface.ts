import { BaseRepository } from '@/common/core';
import { TokenEntity } from '@/common/database/entities';

export abstract class ITokenRepository extends BaseRepository<TokenEntity> {}
