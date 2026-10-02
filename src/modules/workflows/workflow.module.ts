import { AiModule } from '@/common/ai/ai.module';
import { WorkflowEntity } from '@/common/database/entities';
import { HelperModule } from '@/common/helper/helper.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from './controllers/workflow.controller';
import { WorkflowRepositoryImpl } from './repositories/workflow.repository';
import { WorkflowAgentService } from './services/workflow-agent.service';
import { WorkflowService } from './services/workflow.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowEntity]), HelperModule, AiModule],
  controllers: [WorkflowController],
  providers: [WorkflowService, WorkflowAgentService, WorkflowRepositoryImpl],
  exports: [WorkflowService],
})
export class WorkflowModule {}
