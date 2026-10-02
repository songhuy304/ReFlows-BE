import { WorkflowEntity } from '@/common/database/entities';
import { HelperModule } from '@/common/helper/helper.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from './controllers/workflow.controller';
import { WorkflowRepositoryImpl } from './repositories/workflow.repository';
import { WorkflowService } from './services/workflow.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowEntity]), HelperModule],
  controllers: [WorkflowController],
  providers: [WorkflowService, WorkflowRepositoryImpl],
  exports: [WorkflowService],
})
export class WorkflowModule {}
