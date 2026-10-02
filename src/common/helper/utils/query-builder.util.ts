import { SortOrder } from '@/common/helper/enums';
import { QueryOptions } from '@/common/helper/interfaces/helper-query.interface';
import {
  applyFilterInput,
  hasValidFilters,
  resetQueryParams,
  createRelationQueryContext,
} from '@/common/helper/utils';
import {
  Brackets,
  FindOptionsRelations,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

export function buildSelectQueryBuilder<T extends ObjectLiteral>(
  repo: Repository<T>,
  options: QueryOptions<T>,
): SelectQueryBuilder<T> {
  resetQueryParams();

  const alias = repo.metadata.tableName;
  const { where, filters, sort, relations, select } = options;

  const qb = repo.createQueryBuilder(alias);
  const { ensureRelationJoin, resolveColumn, applyWhereConditions } =
    createRelationQueryContext(qb, alias, repo.metadata);

  if (relations) {
    for (const [relation, value] of Object.entries(relations)) {
      if (!value) continue;

      ensureRelationJoin(alias, relation, {
        select: true,
        nested:
          typeof value === 'object'
            ? (value as FindOptionsRelations<ObjectLiteral>)
            : undefined,
      });
    }
  }

  if (select) {
    const selectedCols = Object.entries(select)
      .filter(([, v]) => v)
      .map(([k]) => `${alias}.${k}`);
    if (selectedCols.length > 0) qb.select(selectedCols);
  }

  if (where) {
    const whereArray = Array.isArray(where) ? where : [where];
    whereArray.forEach((condition, idx) => {
      const method = idx === 0 ? 'where' : 'orWhere';
      qb[method](
        new Brackets((whereQb) => {
          applyWhereConditions(whereQb, alias, condition);
        }),
      );
    });
  }

  if (filters && hasValidFilters(filters)) {
    qb.andWhere(
      new Brackets((filterQb) =>
        applyFilterInput(filterQb, filters, resolveColumn),
      ),
    );
  }

  if (sort) {
    for (const [field, direction] of Object.entries(sort)) {
      qb.addOrderBy(`${alias}.${field}`, direction as SortOrder);
    }
  }

  return qb;
}
