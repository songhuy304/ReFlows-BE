import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { ApiGenericResponseDto, PaginationMetadataDto } from '@/common/response';
import { type IDocPaginatedResponseOptions } from '../interfaces/doc.interface';
import { buildEnvelopeSchema } from '../utils/doc.schema.util';

export function DocPaginatedResponse<T>(
  options: IDocPaginatedResponseOptions<T>,
): MethodDecorator {
  const { httpStatus, description, message, serialization } = options;

  return applyDecorators(
    ApiExtraModels(ApiGenericResponseDto, PaginationMetadataDto, serialization),
    ApiResponse({
      status: httpStatus,
      description,
      schema: buildEnvelopeSchema(message, {
        data: { type: 'array', items: { $ref: getSchemaPath(serialization) } },
        meta: { $ref: getSchemaPath(PaginationMetadataDto) },
      }),
    }),
  );
}
