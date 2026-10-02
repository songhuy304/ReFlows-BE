import { WorkflowEntity } from '@/common/database/entities';
import { plainToInstance } from 'class-transformer';
import { WorkflowResponseDto } from '../dtos/responses/workflow.response.dto';

export class WorkflowMapper {
  static toResponse(workflow: WorkflowEntity): WorkflowResponseDto {
    return plainToInstance(WorkflowResponseDto, workflow, {
      excludeExtraneousValues: true,
    });
  }

  static toResponses(workflows: WorkflowEntity[]): WorkflowResponseDto[] {
    return workflows.map((workflow) => this.toResponse(workflow));
  }
}
