import { QueryOptions } from '@/common/helper/interfaces/helper-query.interface';
import { buildSelectQueryBuilder } from '@/common/helper/utils';
import { PaginatedDto } from '@/common/response';
import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';

export type {
  FilterInput,
  FilterOperator,
  FilterRule,
  QueryOptions,
} from '@/common/helper/interfaces/helper-query.interface';

@Injectable()
export class HelperQueryService {
  private createBuilder<T extends ObjectLiteral>(
    repo: Repository<T>,
    options: QueryOptions<T>,
  ) {
    return buildSelectQueryBuilder(repo, options);
  }

  async findMany<T extends ObjectLiteral>(
    repo: Repository<T>,
    options: QueryOptions<T> = {},
  ): Promise<PaginatedDto<T>> {
    const page = Math.max(1, options.pagination?.page ?? 1);
    const limit = Math.max(1, options.pagination?.limit ?? 20);

    const qb = this.createBuilder(repo, options);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne<T extends ObjectLiteral>(
    repo: Repository<T>,
    options: QueryOptions<T> = {},
  ): Promise<T | null> {
    const qb = this.createBuilder(repo, options);
    return qb.getOne();
  }

  async findAll<T extends ObjectLiteral>(
    repo: Repository<T>,
    options: Omit<QueryOptions<T>, 'pagination'> = {},
  ): Promise<T[]> {
    const qb = this.createBuilder(repo, options);
    return qb.getMany();
  }

  async count<T extends ObjectLiteral>(
    repo: Repository<T>,
    options: Pick<QueryOptions<T>, 'where' | 'filters'> = {},
  ): Promise<number> {
    const qb = this.createBuilder(repo, options);
    return qb.getCount();
  }
  async groupCount<T extends ObjectLiteral, K extends keyof T & string>(
    repo: Repository<T>,
    field: K,
    options: Pick<QueryOptions<T>, 'where' | 'filters'> = {},
  ): Promise<
    {
      key: T[K];
      count: number;
    }[]
  > {
    const qb = this.createBuilder(repo, options);

    const result = await qb
      .select(`${qb.alias}.${field}`, 'key')
      .addSelect('COUNT(*)', 'count')
      .groupBy(`${qb.alias}.${field}`)
      .getRawMany<{ key: T[K]; count: string }>();

    return result.map((item) => ({
      key: item.key,
      count: Number(item.count),
    }));
  }

  async exists<T extends ObjectLiteral>(
    repo: Repository<T>,
    options: Pick<QueryOptions<T>, 'where' | 'filters'> = {},
  ): Promise<boolean> {
    return (await this.count(repo, options)) > 0;
  }
}
