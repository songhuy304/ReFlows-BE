import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import {
  DOC_AUTH_ACCESS_TOKEN,
  DOC_DEFAULT_MESSAGE,
} from '../constants/doc.constant';
import type {
  IDocOptions,
  IDocResponseOptions,
} from '../interfaces/doc.interface';
import { DocGenericResponse } from './doc.generic.decorator';
import { DocPaginatedResponse } from './doc.paginated.decorator';
import { DocResponse } from './doc.response.decorator';
import { getStatusDescription } from '../utils/doc.schema.util';

function buildSuccessResponse<T>(
  options: IDocOptions<T>,
  base: IDocResponseOptions,
): MethodDecorator {
  if (options.paginated) {
    return DocPaginatedResponse({
      ...base,
      serialization: options.serialization,
    });
  }

  if (options.serialization) {
    return DocResponse({
      ...base,
      serialization: options.serialization,
      isArray: options.isArray,
    });
  }

  return DocGenericResponse(base);
}

export function ApiEndpoint<T>(options: IDocOptions<T>): MethodDecorator {
  const httpStatus = options.httpStatus ?? HttpStatus.OK;

  const decorators: MethodDecorator[] = [
    HttpCode(httpStatus),
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
    buildSuccessResponse(options, {
      httpStatus,
      description: getStatusDescription(httpStatus),
      message: options.message ?? DOC_DEFAULT_MESSAGE,
    }),
  ];

  if (!options.isPublic) {
    decorators.push(ApiBearerAuth(DOC_AUTH_ACCESS_TOKEN));
  }

  return applyDecorators(...decorators);
}
