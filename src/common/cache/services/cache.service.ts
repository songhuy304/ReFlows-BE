import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import * as _ from 'lodash';
import { REDIS_CLIENT } from '../constants/cache.constant';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  async get<T = string>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (_.isNil(value)) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error('Failed to parse cache value', { key, value, error });
      return value as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const serialised =
      typeof value === 'string' ? value : JSON.stringify(value);

    if (_.isNumber(ttl) && ttl > 0) {
      await this.redis.set(key, serialised, 'EX', ttl);
    } else {
      await this.redis.set(key, serialised);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.redis.del(...keys);
  }

  getClient(): Redis {
    return this.redis;
  }
}
