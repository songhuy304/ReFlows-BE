import { NotificationEntity } from '@/common/database/entities';
import { HelperModule } from '@/common/helper/helper.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsocketModule } from '../websocket/websocket.module';
import { NotificationSenderService } from './services/notification-sender.service';
import { NotificationService } from './services/notification.service';
import { NotificationRepositoryImpl } from './repositories/notification.repository';
import { NotificationController } from './controllers/notification.controller';
import { BullModule } from '@nestjs/bullmq';
import { NOTIFICATION_QUEUE } from './constants/queue.constant';
import { NotificationConsumer } from './consumers/notification.consumer';
import { NotificationProducer } from './producers/notification.producer';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
    }),
    HelperModule,
    WebsocketModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationConsumer,
    NotificationSenderService,
    NotificationService,
    NotificationRepositoryImpl,
    NotificationProducer,
  ],
  exports: [
    NotificationSenderService,
    NotificationService,
    NotificationConsumer,
    NotificationProducer,
  ],
})
export class NotificationModule {}
