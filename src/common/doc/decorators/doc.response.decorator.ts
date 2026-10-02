import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';

import { ApiGenericResponseDto } from '@/common/response';
import { type IDocDataResponseOptions } from '../interfaces/doc.interface';
import {
  buildEnvelopeSchema,
  buildItemSchema,
  isDocPrimitive,
} from '../utils/doc.schema.util';

export function DocResponse<T>(
  options: IDocDataResponseOptions<T>,
): MethodDecorator {
  const { httpStatus, description, message, serialization, isArray } = options;

  const itemSchema = buildItemSchema(serialization);
  const dataSchema = isArray
    ? { type: 'array' as const, items: itemSchema }
    : itemSchema;

  const extraModels = isDocPrimitive(serialization)
    ? [ApiGenericResponseDto]
    : [ApiGenericResponseDto, serialization];

  return applyDecorators(
    ApiExtraModels(...extraModels),
    ApiResponse({
      status: httpStatus,
      description,
      schema: buildEnvelopeSchema(message, { data: dataSchema }),
    }),
  );
}
