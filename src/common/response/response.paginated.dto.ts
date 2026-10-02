import {
  IApiPaginated,
  IPaginationMetadata,
} from '@/common/response/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PaginationMetadataDto implements IPaginationMetadata {
  @ApiProperty({ description: 'Current page number', example: 1 })
  @Expose()
  @IsNumber()
  currentPage: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  @Expose()
  @IsNumber()
  itemsPerPage: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  @Expose()
  @IsNumber()
  totalItems: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  @Expose()
  @IsNumber()
  totalPages: number;
}

export class PaginatedDto<T> {
  @ApiProperty({ description: 'Array of data items', isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Expose()
  data: T[];

  @ApiProperty({ description: 'Pagination metadata' })
  @Expose()
  @ValidateNested()
  @Type(() => PaginationMetadataDto)
  meta: PaginationMetadataDto;
}

export class PaginatedResponseDto<T>
  extends PaginatedDto<T>
  implements IApiPaginated<T>
{
  @IsBoolean()
  @Expose()
  success: boolean;

  @Expose()
  @IsString()
  message: string;

  constructor(
    data: T[],
    meta: PaginationMetadataDto,
    message: string,
    success: boolean,
  ) {
    super();
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  static success<T>(
    data: T[],
    meta: PaginationMetadataDto | null,
    message: string = 'success',
  ): PaginatedResponseDto<T> {
    return new PaginatedResponseDto<T>(data, meta, message, true);
  }

  static error<T>(
    message: string = 'error!',
    data: T[] = [],
    meta?: PaginationMetadataDto,
  ): PaginatedResponseDto<T> {
    const defaultMeta: PaginationMetadataDto = meta || {
      currentPage: 0,
      itemsPerPage: 0,
      totalItems: 0,
      totalPages: 0,
    };
    return new PaginatedResponseDto<T>(data, defaultMeta, message, false);
  }
}
