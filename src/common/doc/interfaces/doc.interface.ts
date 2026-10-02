import { type HttpStatus } from '@nestjs/common';
import type { ClassConstructor } from 'class-transformer';

export type DocPrimitive =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor;

export type DocSerialization<T> = ClassConstructor<T> | DocPrimitive;

export interface IDocBaseOptions {
  summary: string;
  description?: string;
  /** Applied with `@HttpCode`, so the documented status is the real one. Defaults to 200. */
  httpStatus?: HttpStatus;
  /** Example value of the `message` field in the response body. */
  message?: string;
  /** Must match `@PublicRoute()`: public endpoints are documented without bearer auth. */
  isPublic?: boolean;
}

export interface IDocGenericOptions extends IDocBaseOptions {
  serialization?: never;
  isArray?: never;
  paginated?: never;
}

export interface IDocDataOptions<T> extends IDocBaseOptions {
  serialization: DocSerialization<T>;
  isArray?: boolean;
  paginated?: never;
}

export interface IDocPaginatedOptions<T> extends IDocBaseOptions {
  serialization: ClassConstructor<T>;
  paginated: true;
  isArray?: never;
}

export type IDocOptions<T> =
  | IDocGenericOptions
  | IDocDataOptions<T>
  | IDocPaginatedOptions<T>;

export interface IDocResponseOptions {
  httpStatus: HttpStatus;
  description?: string;
  message: string;
}

export interface IDocDataResponseOptions<T> extends IDocResponseOptions {
  serialization: DocSerialization<T>;
  isArray?: boolean;
}

export interface IDocPaginatedResponseOptions<T> extends IDocResponseOptions {
  serialization: ClassConstructor<T>;
}
