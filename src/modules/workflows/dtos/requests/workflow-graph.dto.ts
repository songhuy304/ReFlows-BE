import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class WorkflowNodeDto {
  @ApiProperty({ example: 'node-1' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({ example: 'trigger' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: { label: 'Start' } })
  @IsObject()
  data: Record<string, unknown>;
}

export class WorkflowEdgeDto {
  @ApiProperty({ example: 'edge-1' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'node-1' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({ example: 'node-2' })
  @IsString()
  @IsNotEmpty()
  target: string;

  @ApiPropertyOptional({ example: 'default' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: {} })
  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;
}

export class WorkflowGraphDto {
  @ApiProperty({ type: [WorkflowNodeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowNodeDto)
  nodes: WorkflowNodeDto[];

  @ApiProperty({ type: [WorkflowEdgeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowEdgeDto)
  edges: WorkflowEdgeDto[];
}
