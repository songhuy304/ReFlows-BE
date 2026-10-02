import { FindOneOptions, FindOptionsWhere } from 'typeorm';
import { IPaginationParams } from '../request/interfaces';
import { PaginatedDto } from '../response';
import { Entity } from './entity';
import { QueryOptions } from '../helper/interfaces/helper-query.interface';

export abstract class Repository<TEntity extends Entity> {
  abstract create(data: Partial<TEntity>): Promise<TEntity>;
  abstract findAll(
    params: IPaginationParams,
    query?: QueryOptions<TEntity>,
  ): Promise<PaginatedDto<TEntity>>;
  abstract findOne(options: FindOneOptions<TEntity>): Promise<TEntity | null>;
  abstract findOneBy(where: FindOptionsWhere<TEntity>): Promise<TEntity | null>;
  abstract update(id: number, data: Partial<TEntity>): Promise<TEntity>;
  abstract remove(id: number): Promise<void>;
}
