import { IPaginationParams } from '@/common/request/interfaces';
import { PaginatedDto } from '@/common/response';
import { Injectable, Logger } from '@nestjs/common';
import { FindManyOptions, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class HelperPaginationService {
  private readonly logger = new Logger(HelperPaginationService.name);

  private readonly DEFAULT_LIMIT = 10;
  private readonly MAX_LIMIT = 100;

  constructor() {}

  async paginateQueryBuilder<T>(
    qb: SelectQueryBuilder<T>,
    params: IPaginationParams,
  ): Promise<PaginatedDto<T>> {
    try {
      const { page = 1, limit = this.DEFAULT_LIMIT } = params;

      const currentPage = Math.max(1, page);
      const itemsPerPage = Math.min(Math.max(1, limit), this.MAX_LIMIT);
      const skip = (currentPage - 1) * itemsPerPage;

      qb.skip(skip).take(itemsPerPage);

      const [data, total] = await qb.getManyAndCount();

      return {
        data,
        meta: {
          totalItems: total,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(total / itemsPerPage),
        },
      };
    } catch (error) {
      this.logger.error('Pagination QueryBuilder failed', error);
      throw error;
    }
  }

  async paginate<T>(
    repo: Repository<T>,
    params: IPaginationParams,
    options?: FindManyOptions<T>,
  ): Promise<PaginatedDto<T>> {
    try {
      const { page = 1, limit = this.DEFAULT_LIMIT } = params;

      const currentPage = Math.max(1, page);
      const itemsPerPage = Math.min(Math.max(1, limit), this.MAX_LIMIT);
      const skip = (currentPage - 1) * itemsPerPage;

      const [data, total] = await repo.findAndCount({
        ...options,
        skip,
        take: itemsPerPage,
      });

      return {
        data,
        meta: {
          totalItems: total,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(total / itemsPerPage),
        },
      };
    } catch (error) {
      this.logger.error('Pagination Repository failed', error);
      throw error;
    }
  }
}
