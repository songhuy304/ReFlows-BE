import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EWorkflowStatus } from '../../enums';
import { CreateWorkflowDto } from './workflow.create.dto';

export class UpdateWorkflowDto extends PartialType(CreateWorkflowDto) {
  @ApiPropertyOptional({
    enum: EWorkflowStatus,
    example: EWorkflowStatus.PUBLISHED,
  })
  @IsEnum(EWorkflowStatus)
  @IsOptional()
  status?: EWorkflowStatus;
}
