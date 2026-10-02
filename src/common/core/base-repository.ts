import {
  DeepPartial,
  FindOneOptions,
  FindOptionsWhere,
  QueryDeepPartialEntity,
  Repository as TypeOrmRepository,
} from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { QueryOptions } from '@/common/helper/interfaces/helper-query.interface';
import { HelperQueryService } from '@/common/helper/services/helper.query.service';
import { IPaginationParams } from '@/common/request/interfaces';
import { PaginatedDto } from '@/common/response';
import { Entity } from './entity';

export abstract class BaseRepository<TEntity extends Entity> {
  constructor(
    protected readonly repo: TypeOrmRepository<TEntity>,
    protected readonly helperQuery: HelperQueryService,
  ) {}

  get repository(): TypeOrmRepository<TEntity> {
    return this.repo;
  }

  async create(data: DeepPartial<TEntity>): Promise<TEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity as TEntity);
  }

  async findOne(options: FindOneOptions<TEntity>): Promise<TEntity | null> {
    return this.repo.findOne(options);
  }

  async findOneBy(where: FindOptionsWhere<TEntity>): Promise<TEntity | null> {
    return this.repo.findOneBy(where);
  }

  async update(id: number, data: DeepPartial<TEntity>): Promise<TEntity> {
    const result = await this.repo.update(
      id,
      data as QueryDeepPartialEntity<TEntity>,
    );

    if (!result.affected) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }

    const entity = await this.findOneBy({ id } as FindOptionsWhere<TEntity>);

    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }

    return entity;
  }

  async updateMany(
    where: FindOptionsWhere<TEntity>,
    data: QueryDeepPartialEntity<TEntity>,
  ): Promise<number> {
    const result = await this.repo.update(where, data);

    return result.affected ?? 0;
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async exists(where: FindOptionsWhere<TEntity>): Promise<boolean> {
    return this.repo.exists({ where });
  }

  async findMany(
    pagination: IPaginationParams,
    query?: Omit<QueryOptions<TEntity>, 'pagination'>,
  ): Promise<PaginatedDto<TEntity>> {
    return this.helperQuery.findMany(this.repo, {
      ...query,
      pagination,
    });
  }

  async findAll(
    query?: Omit<QueryOptions<TEntity>, 'pagination'>,
  ): Promise<TEntity[]> {
    return this.helperQuery.findAll(this.repo, query);
  }

  async count(
    query?: Pick<QueryOptions<TEntity>, 'filters' | 'where'>,
  ): Promise<number> {
    return this.helperQuery.count(this.repo, query);
  }

  async groupCount<K extends keyof TEntity & string>(
    field: K,
    query?: Pick<QueryOptions<TEntity>, 'filters' | 'where'>,
  ): Promise<
    {
      key: TEntity[K];
      count: number;
    }[]
  > {
    return this.helperQuery.groupCount(this.repo, field, query);
  }
}
