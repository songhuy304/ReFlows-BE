import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { WorkflowGraphDto } from './workflow-graph.dto';

export const WORKFLOW_CHAT_ROLES = ['user', 'assistant'] as const;

export type WorkflowChatRole = (typeof WORKFLOW_CHAT_ROLES)[number];

export class WorkflowChatMessageDto {
  @ApiProperty({ enum: WORKFLOW_CHAT_ROLES, example: 'user' })
  @IsIn(WORKFLOW_CHAT_ROLES)
  role: WorkflowChatRole;

  @ApiProperty({
    example: 'Create a hiring workflow: screen CV, interview, then offer',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content: string;
}

export class WorkflowChatDto {
  @ApiProperty({ type: [WorkflowChatMessageDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => WorkflowChatMessageDto)
  messages: WorkflowChatMessageDto[];

  @ApiPropertyOptional({
    type: WorkflowGraphDto,
    description:
      'Current graph on the canvas (may be unsaved). Falls back to the saved graph when omitted.',
  })
  @ValidateNested()
  @Type(() => WorkflowGraphDto)
  @IsOptional()
  graph?: WorkflowGraphDto;
}
