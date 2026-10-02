import {
  FilterInput,
  FilterOperator,
  FilterRule,
} from '@/common/helper/interfaces/helper-query.interface';
import { Brackets, WhereExpressionBuilder } from 'typeorm';
import { uniqueQueryParam } from '@/common/helper/utils';

const OPS_REQUIRE_VALUE: FilterOperator[] = [
  'eq',
  'not',
  'ilike',
  'startsWith',
  'endsWith',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'dateRange',
  'in',
];

function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null;
}

function isRuleValid(rule: FilterRule): boolean {
  if (!OPS_REQUIRE_VALUE.includes(rule.op)) return true;
  if (isEmptyValue(rule.value)) return false;

  if (rule.op === 'in') {
    return Array.isArray(rule.value) && rule.value.length > 0;
  }

  if (rule.op === 'between') {
    if (!Array.isArray(rule.value) || rule.value.length < 2) return false;
    const [from, to] = rule.value;
    return !isEmptyValue(from) && !isEmptyValue(to);
  }

  if (rule.op === 'dateRange') {
    if (!Array.isArray(rule.value)) return false;
    const [from, to] = rule.value;
    return !isEmptyValue(from) || !isEmptyValue(to);
  }

  return true;
}

export function isFilterRule(
  item: FilterRule | FilterInput,
): item is FilterRule {
  return 'field' in item && 'op' in item;
}

function isFilterItemValid(item: FilterRule | FilterInput): boolean {
  if (isFilterRule(item)) return isRuleValid(item);
  return hasValidFilters(item);
}

export function hasValidFilters(input: FilterInput): boolean {
  const and = (input.and ?? []).filter(isFilterItemValid);
  const or = (input.or ?? []).filter(isFilterItemValid);
  return and.length > 0 || or.length > 0;
}

function applyRule(
  qb: WhereExpressionBuilder,
  resolveColumn: (field: string) => string,
  rule: FilterRule,
  method: 'andWhere' | 'orWhere' | 'where',
): void {
  if (!isRuleValid(rule)) return;

  const { op, value } = rule;
  const col = resolveColumn(rule.field);
  const param = uniqueQueryParam(rule.field);

  switch (op) {
    case 'isNull':
      qb[method](`${col} IS NULL`);
      break;
    case 'isNotNull':
      qb[method](`${col} IS NOT NULL`);
      break;
    case 'ilike':
      qb[method](`${col} ILIKE :${param}`, { [param]: `%${value}%` });
      break;
    case 'startsWith':
      qb[method](`${col} ILIKE :${param}`, { [param]: `${value}%` });
      break;
    case 'endsWith':
      qb[method](`${col} ILIKE :${param}`, { [param]: `%${value}` });
      break;
    case 'gt':
      qb[method](`${col} > :${param}`, { [param]: value });
      break;
    case 'gte':
      qb[method](`${col} >= :${param}`, { [param]: value });
      break;
    case 'lt':
      qb[method](`${col} < :${param}`, { [param]: value });
      break;
    case 'lte':
      qb[method](`${col} <= :${param}`, { [param]: value });
      break;
    case 'not':
      qb[method](`${col} != :${param}`, { [param]: value });
      break;
    case 'between': {
      const [from, to] = value as [unknown, unknown];
      qb[method](`${col} BETWEEN :${param}_from AND :${param}_to`, {
        [`${param}_from`]: from,
        [`${param}_to`]: to,
      });
      break;
    }
    case 'dateRange': {
      const [from, to] = value as [
        Date | string | null | undefined,
        Date | string | null | undefined,
      ];
      if (!isEmptyValue(from) && !isEmptyValue(to)) {
        qb[method](`${col} BETWEEN :${param}_from AND :${param}_to`, {
          [`${param}_from`]: from,
          [`${param}_to`]: to,
        });
      } else if (!isEmptyValue(from)) {
        qb[method](`${col} >= :${param}_from`, { [`${param}_from`]: from });
      } else if (!isEmptyValue(to)) {
        qb[method](`${col} <= :${param}_to`, { [`${param}_to`]: to });
      }
      break;
    }
    case 'in':
      qb[method](`${col} IN (:...${param})`, { [param]: value });
      break;
    case 'eq':
    default:
      qb[method](`${col} = :${param}`, { [param]: value });
      break;
  }
}

function applyFilterItems(
  qb: WhereExpressionBuilder,
  items: Array<FilterRule | FilterInput>,
  combinator: 'and' | 'or',
  resolveColumn: (field: string) => string,
): void {
  let isFirst = true;

  for (const item of items) {
    if (!isFilterItemValid(item)) continue;

    if (isFilterRule(item)) {
      const method = isFirst
        ? 'where'
        : combinator === 'or'
          ? 'orWhere'
          : 'andWhere';
      applyRule(qb, resolveColumn, item, method);
      isFirst = false;
      continue;
    }

    const method = isFirst
      ? 'where'
      : combinator === 'or'
        ? 'orWhere'
        : 'andWhere';

    qb[method](
      new Brackets((nestedQb) =>
        applyFilterInput(nestedQb, item, resolveColumn),
      ),
    );
    isFirst = false;
  }
}

export function applyFilterInput(
  qb: WhereExpressionBuilder,
  input: FilterInput,
  resolveColumn: (field: string) => string,
): void {
  const and = (input.and ?? []).filter(isFilterItemValid);
  const or = (input.or ?? []).filter(isFilterItemValid);

  if (and.length === 0 && or.length === 0) return;

  let isFirst = true;

  if (and.length > 0) {
    const method = isFirst ? 'where' : 'andWhere';
    qb[method](
      new Brackets((innerQb) =>
        applyFilterItems(innerQb, and, 'and', resolveColumn),
      ),
    );
    isFirst = false;
  }

  if (or.length > 0) {
    const method = isFirst ? 'where' : 'andWhere';
    qb[method](
      new Brackets((innerQb) =>
        applyFilterItems(innerQb, or, 'or', resolveColumn),
      ),
    );
  }
}
