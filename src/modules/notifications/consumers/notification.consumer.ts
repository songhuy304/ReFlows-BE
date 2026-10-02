import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ENotificationJob, NOTIFICATION_QUEUE } from '../constants';
import { NotificationJob } from '../producers/notification.producer';
import { NotificationSenderService } from '../services/notification-sender.service';
import { Logger } from '@nestjs/common';

@Processor(NOTIFICATION_QUEUE)
export class NotificationConsumer extends WorkerHost {
  private readonly logger = new Logger(NotificationConsumer.name);
  constructor(private readonly sender: NotificationSenderService) {
    super();
  }

  async process(job: Job<NotificationJob>) {
    this.logger.log(`Processing job: ${job.id}`);
    switch (job.name) {
      case ENotificationJob.SEND:
        await this.sender.notifyUser(job.data.dto, job.data.data);
        break;
    }

    this.logger.log(`Finished job: ${job.id}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed`, err);
  }
}
