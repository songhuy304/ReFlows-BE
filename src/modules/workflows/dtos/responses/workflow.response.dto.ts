import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { WorkflowEntity, WorkflowGraph } from '@/common/database/entities';
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
  @Transform(({ obj }: { obj: WorkflowEntity }) => obj.graph)
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
