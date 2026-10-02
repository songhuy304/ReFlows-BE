import { BaseRepository } from '@/common/core';
import { NotificationEntity } from '@/common/database/entities/notification.entity';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';

@Injectable()
export class NotificationRepositoryImpl extends BaseRepository<NotificationEntity> {
  constructor(
    @InjectRepository(NotificationEntity)
    repo: TypeOrmRepository<NotificationEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }
}
