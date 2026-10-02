import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger';

import { ApiGenericResponseDto } from '@/common/response';
import { type IDocResponseOptions } from '../interfaces/doc.interface';
import { buildEnvelopeSchema } from '../utils/doc.schema.util';

export function DocGenericResponse(
  options: IDocResponseOptions,
): MethodDecorator {
  const { httpStatus, description, message } = options;

  return applyDecorators(
    ApiExtraModels(ApiGenericResponseDto),
    ApiResponse({
      status: httpStatus,
      description,
      schema: buildEnvelopeSchema(message),
    }),
  );
}
