import { applyScalarWhere, isRelationWhereValue } from '@/common/helper/utils';
import {
  EntityMetadata,
  FindOptionsRelations,
  FindOptionsWhere,
  ObjectLiteral,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';

export interface RelationJoinOptions {
  select?: boolean;
  nested?: FindOptionsRelations<ObjectLiteral>;
}

export interface RelationQueryContext {
  ensureRelationJoin: (
    parentAlias: string,
    relationName: string,
    joinOptions?: RelationJoinOptions,
  ) => string;
  resolveColumn: (field: string) => string;
  applyWhereConditions: (
    whereQb: WhereExpressionBuilder,
    entityAlias: string,
    condition: FindOptionsWhere<ObjectLiteral>,
  ) => void;
}

export function createRelationQueryContext<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  rootAlias: string,
  rootMetadata: EntityMetadata,
): RelationQueryContext {
  const joinedAliases = new Set<string>([rootAlias]);
  const aliasMetadata = new Map<string, EntityMetadata>([
    [rootAlias, rootMetadata],
  ]);

  const ensureRelationJoin = (
    parentAlias: string,
    relationName: string,
    joinOptions?: RelationJoinOptions,
  ): string => {
    const joinAlias = `${parentAlias}_${relationName}`;
    const parentMeta = aliasMetadata.get(parentAlias);
    const relationMeta = parentMeta?.relations.find(
      (relation) => relation.propertyName === relationName,
    );

    if (!relationMeta) {
      return joinAlias;
    }

    if (!joinedAliases.has(joinAlias)) {
      const shouldSelect = joinOptions?.select ?? false;

      if (shouldSelect) {
        qb.leftJoinAndSelect(`${parentAlias}.${relationName}`, joinAlias);
      } else {
        qb.innerJoin(`${parentAlias}.${relationName}`, joinAlias);
      }

      joinedAliases.add(joinAlias);
      aliasMetadata.set(joinAlias, relationMeta.inverseEntityMetadata);
    }

    if (joinOptions?.nested) {
      for (const [nestedRelation, nestedValue] of Object.entries(
        joinOptions.nested,
      )) {
        if (!nestedValue) continue;

        ensureRelationJoin(joinAlias, nestedRelation, {
          select: true,
          nested:
            typeof nestedValue === 'object'
              ? (nestedValue as FindOptionsRelations<ObjectLiteral>)
              : undefined,
        });
      }
    }

    return joinAlias;
  };

  const resolveColumn = (field: string): string => {
    const parts = field.split('.');

    if (parts.length === 1) {
      return `${rootAlias}.${field}`;
    }

    let currentAlias = rootAlias;
    for (let i = 0; i < parts.length - 1; i++) {
      currentAlias = ensureRelationJoin(currentAlias, parts[i]);
    }

    return `${currentAlias}.${parts[parts.length - 1]}`;
  };

  const applyWhereConditions = (
    whereQb: WhereExpressionBuilder,
    entityAlias: string,
    condition: FindOptionsWhere<ObjectLiteral>,
  ): void => {
    const metadata = aliasMetadata.get(entityAlias);
    if (!metadata) return;

    for (const [key, value] of Object.entries(condition)) {
      if (value === undefined || value === null) continue;

      const relationMeta = metadata.relations.find(
        (relation) => relation.propertyName === key,
      );

      if (relationMeta && isRelationWhereValue(value)) {
        const joinAlias = ensureRelationJoin(entityAlias, key);
        applyWhereConditions(
          whereQb,
          joinAlias,
          value as FindOptionsWhere<ObjectLiteral>,
        );
        continue;
      }

      applyScalarWhere(whereQb, `${entityAlias}.${key}`, value);
    }
  };

  return {
    ensureRelationJoin,
    resolveColumn,
    applyWhereConditions,
  };
}
