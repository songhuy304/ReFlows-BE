import { STATUS_CODES } from 'http';

import { getSchemaPath } from '@nestjs/swagger';
import type {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { ApiGenericResponseDto } from '@/common/response';
import type {
  DocPrimitive,
  DocSerialization,
} from '../interfaces/doc.interface';

const PRIMITIVE_TYPES = new Map<DocPrimitive, SchemaObject['type']>([
  [String, 'string'],
  [Number, 'number'],
  [Boolean, 'boolean'],
]);

export function isDocPrimitive(
  serialization: DocSerialization<unknown>,
): serialization is DocPrimitive {
  return PRIMITIVE_TYPES.has(serialization as DocPrimitive);
}

export function buildItemSchema(
  serialization: DocSerialization<unknown>,
): SchemaObject | ReferenceObject {
  if (isDocPrimitive(serialization)) {
    return { type: PRIMITIVE_TYPES.get(serialization) };
  }

  return { $ref: getSchemaPath(serialization) };
}

/** Extends `ApiGenericResponseDto` (`success`, `message`) with extra top-level fields. */
export function buildEnvelopeSchema(
  message: string,
  extraProperties: Record<string, SchemaObject | ReferenceObject> = {},
): SchemaObject {
  const required = Object.keys(extraProperties);

  return {
    allOf: [
      { $ref: getSchemaPath(ApiGenericResponseDto) },
      {
        type: 'object',
        properties: {
          message: { type: 'string', example: message },
          ...extraProperties,
        },
        ...(required.length ? { required } : {}),
      },
    ],
  };
}

export function getStatusDescription(status: number): string {
  return STATUS_CODES[status] ?? String(status);
}
