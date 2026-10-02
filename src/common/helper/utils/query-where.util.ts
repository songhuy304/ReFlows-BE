import { FindOperator, WhereExpressionBuilder } from 'typeorm';
import { uniqueQueryParam } from '@/common/helper/utils';

export function isRelationWhereValue(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof FindOperator)
  );
}

export function applyScalarWhere(
  whereQb: WhereExpressionBuilder,
  column: string,
  value: unknown,
): void {
  const param = uniqueQueryParam(column);

  if (value instanceof FindOperator) {
    const { type, value: opValue } = value;

    switch (type) {
      case 'in':
        whereQb.andWhere(`${column} IN (:...${param})`, { [param]: opValue });
        break;
      case 'not': {
        if (opValue instanceof FindOperator && opValue.type === 'isNull') {
          whereQb.andWhere(`${column} IS NOT NULL`);
        } else {
          whereQb.andWhere(`${column} != :${param}`, { [param]: opValue });
        }
        break;
      }
      case 'isNull':
        whereQb.andWhere(`${column} IS NULL`);
        break;
      case 'lessThan':
        whereQb.andWhere(`${column} < :${param}`, { [param]: opValue });
        break;
      case 'lessThanOrEqual':
        whereQb.andWhere(`${column} <= :${param}`, { [param]: opValue });
        break;
      case 'moreThan':
        whereQb.andWhere(`${column} > :${param}`, { [param]: opValue });
        break;
      case 'moreThanOrEqual':
        whereQb.andWhere(`${column} >= :${param}`, { [param]: opValue });
        break;
      case 'between': {
        const [from, to] = opValue as [unknown, unknown];
        whereQb.andWhere(`${column} BETWEEN :${param}_from AND :${param}_to`, {
          [`${param}_from`]: from,
          [`${param}_to`]: to,
        });
        break;
      }
      case 'ilike':
        whereQb.andWhere(`${column} ILIKE :${param}`, { [param]: opValue });
        break;
      case 'like':
        whereQb.andWhere(`${column} LIKE :${param}`, { [param]: opValue });
        break;
      default:
        whereQb.andWhere(`${column} = :${param}`, { [param]: opValue });
        break;
    }
    return;
  }

  whereQb.andWhere(`${column} = :${param}`, { [param]: value });
}
