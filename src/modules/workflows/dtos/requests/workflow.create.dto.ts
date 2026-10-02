import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { WorkflowGraphDto } from './workflow-graph.dto';

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Onboarding workflow' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ type: WorkflowGraphDto })
  @ValidateNested()
  @Type(() => WorkflowGraphDto)
  graph: WorkflowGraphDto;
}
