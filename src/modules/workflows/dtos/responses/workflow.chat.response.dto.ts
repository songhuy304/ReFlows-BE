import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkflowGraph } from '@/common/database/entities';
import { WorkflowGraphDto } from '../requests/workflow-graph.dto';

export class WorkflowChatResponseDto {
  @ApiProperty({ example: 'I created a 5-step hiring workflow.' })
  reply: string;

  @ApiPropertyOptional({
    type: WorkflowGraphDto,
    nullable: true,
    description: 'Proposed graph to preview. Null when the graph is unchanged.',
  })
  graph: WorkflowGraph | null;
}
