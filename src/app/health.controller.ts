import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { DatabaseService } from '@/common/database/services/database.service';
import { PublicRoute } from '@/common/guard/decorator';

@Controller({
  version: VERSION_NEUTRAL,
  path: '/health',
})
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  @PublicRoute()
  @HealthCheck()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.databaseService.isHealthy(),
    ]);
  }

  @Get('/ping')
  @PublicRoute()
  public async ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
