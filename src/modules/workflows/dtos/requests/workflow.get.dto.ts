import { PaginationRequestDto } from '@/common/request/dtos';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EWorkflowStatus } from '../../enums';

export class WorkflowRequestDto extends PaginationRequestDto {
  @ApiPropertyOptional({ example: 'onboarding' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  keyword?: string;

  @ApiPropertyOptional({ enum: EWorkflowStatus })
  @IsEnum(EWorkflowStatus)
  @IsOptional()
  status?: EWorkflowStatus;
}
