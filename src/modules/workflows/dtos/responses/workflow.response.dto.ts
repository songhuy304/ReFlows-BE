import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { WorkflowGraph } from '@/common/database/entities';
import { EWorkflowStatus } from '../../enums';
import { WorkflowGraphDto } from '../requests/workflow-graph.dto';

export class WorkflowResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Onboarding workflow' })
  @Expose()
  name: string;

  @ApiProperty({ enum: EWorkflowStatus, example: EWorkflowStatus.DRAFT })
  @Expose()
  status: EWorkflowStatus;

  @ApiPropertyOptional({ example: null, nullable: true })
  @Expose()
  publishedAt?: Date | null;

  @ApiProperty({ type: WorkflowGraphDto })
  @Expose()
  graph: WorkflowGraph;

  @ApiProperty({ example: 10 })
  @Expose()
  createdById: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
