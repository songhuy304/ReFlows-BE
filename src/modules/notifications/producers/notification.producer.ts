import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import { CreateNotificationDto } from '../dtos/requests/notification.create';
import { ENotificationJob, NOTIFICATION_QUEUE } from '../constants';

export interface NotificationJob<T = unknown> {
  dto: CreateNotificationDto;
  data: T;
}

@Injectable()
export class NotificationProducer {
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly queue: Queue,
  ) {}

  async send<T>(dto: CreateNotificationDto, data: T) {
    await this.queue.add(
      ENotificationJob.SEND,
      {
        dto,
        data,
      },
      {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}
