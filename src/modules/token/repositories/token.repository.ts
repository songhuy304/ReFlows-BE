import { TokenEntity } from '@/common/database/entities';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';
import { ITokenRepository } from '../interfaces/token.repository.interface';

@Injectable()
export class TokenRepositoryImpl extends ITokenRepository {
  constructor(
    @InjectRepository(TokenEntity)
    repo: TypeOrmRepository<TokenEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }
}
