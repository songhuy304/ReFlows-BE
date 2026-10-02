import { SortOrder } from '@/common/helper/enums';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export type FilterOperator =
  | 'eq'
  | 'not'
  | 'ilike'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'dateRange'
  | 'in'
  | 'isNull'
  | 'isNotNull';

export interface FilterRule {
  field: string;
  op: FilterOperator;
  value?: unknown;
}

export type FilterInput = {
  and?: Array<FilterRule | FilterInput>;
  or?: Array<FilterRule | FilterInput>;
};

// ─── Query Options ────────────────────────────────────────────────────────────

export interface QueryOptions<T extends ObjectLiteral> {
  /**
   * Hard conditions — always applied as AND (e.g. ownerId).
   */
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];

  /**
   * Dynamic filter conditions with AND/OR group support.
   * Merged with `where` as AND at the top level.
   */
  filters?: FilterInput;

  sort?: Partial<Record<string, SortOrder>>;
  pagination?: PaginationOptions;
  relations?: FindOptionsRelations<T>;
  select?: FindOptionsSelect<T>;
}
