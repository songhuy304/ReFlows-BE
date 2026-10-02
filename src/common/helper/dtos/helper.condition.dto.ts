import {
  Between,
  FindOperator,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Raw,
} from 'typeorm';

/**
 * Tập hợp các TypeORM condition helper, giúp viết filter ngắn gọn, type-safe.
 */
export const FilterConditions = {
  /**
   * Case-insensitive partial match.
   * @example ilike('hello') → ILike('%hello%')
   */
  ilike: (value: string): FindOperator<string> => ILike(`%${value}%`),

  /**
   * Case-insensitive starts-with.
   * @example startsWith('hel') → ILike('hel%')
   */
  startsWith: (value: string): FindOperator<string> => ILike(`${value}%`),

  /**
   * Case-insensitive ends-with.
   * @example endsWith('llo') → ILike('%llo')
   */
  endsWith: (value: string): FindOperator<string> => ILike(`%${value}`),

  /**
   * Inclusive range.
   * @example between(1, 100) → Between(1, 100)
   */
  between: <T>(from: T, to: T): FindOperator<T> => Between(from, to),

  /**
   * Date range (inclusive) — accepts Date or ISO string.
   */
  dateRange: (from: Date | string, to: Date | string): FindOperator<Date> => {
    const start = typeof from === 'string' ? new Date(from) : from;
    const end = typeof to === 'string' ? new Date(to) : to;
    // Set end to end-of-day to include the whole day
    end.setHours(23, 59, 59, 999);
    return Between(start, end);
  },

  /**
   * Match any value in array.
   */
  inList: <T>(values: T[]): FindOperator<T> => In(values) as FindOperator<T>,

  /** Greater than */
  gt: <T>(value: T): FindOperator<T> => MoreThan(value),

  /** Greater than or equal */
  gte: <T>(value: T): FindOperator<T> => MoreThanOrEqual(value),

  /** Less than */
  lt: <T>(value: T): FindOperator<T> => LessThan(value),

  /** Less than or equal */
  lte: <T>(value: T): FindOperator<T> => LessThanOrEqual(value),

  /** Null check */
  isNull: (): FindOperator<null> => IsNull() as FindOperator<null>,

  /** Not null */
  isNotNull: (): FindOperator<null> => Not(IsNull()) as FindOperator<null>,

  /** Negation */
  not: <T>(value: T | FindOperator<T>): FindOperator<T> => Not(value),

  /**
   * Raw SQL condition — dùng khi các operator trên chưa đủ.
   * @example raw(alias => `${alias} @> ARRAY[:id]`, { id: 5 })
   */
  raw: <T>(
    query: (alias: string) => string,
    params?: Record<string, unknown>,
  ): FindOperator<T> => Raw(query, params) as FindOperator<T>,
};
