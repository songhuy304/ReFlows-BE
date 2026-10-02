import { BaseRepository } from '@/common/core';
import { WorkflowEntity } from '@/common/database/entities';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository as TypeOrmRepository } from 'typeorm';

@Injectable()
export class WorkflowRepositoryImpl extends BaseRepository<WorkflowEntity> {
  constructor(
    @InjectRepository(WorkflowEntity)
    repo: TypeOrmRepository<WorkflowEntity>,
    helperQuery: HelperQueryService,
  ) {
    super(repo, helperQuery);
  }

  async softRemove(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}
