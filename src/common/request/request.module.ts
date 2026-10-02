import { RequestMiddleware } from '@/common/request/middlewares/request.middleware';
import { MiddlewareConsumer, Module } from '@nestjs/common';

@Module({
  imports: [],
})
export class RequestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestMiddleware).forRoutes('*');
  }
}
