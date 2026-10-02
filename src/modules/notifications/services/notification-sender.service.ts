import { NotificationGateway } from '@/modules/websocket/gateways/notification.gateway';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationPayload, NotificationType } from '../interfaces';
import { NOTIFICATION_EVENT } from '../constants';
import { CreateNotificationDto } from '../dtos/requests/notification.create';
import { NotificationRepositoryImpl } from '../repositories/notification.repository';

@Injectable()
export class NotificationSenderService {
  private readonly logger = new Logger(NotificationSenderService.name);

  constructor(
    private readonly gateway: NotificationGateway,
    private readonly notiRepo: NotificationRepositoryImpl,
  ) {}

  async notifyUser<T>(dto: CreateNotificationDto, data: T) {
    await this.persist(dto);
    await this.emit(dto.userId, dto.type, data);
  }

  private async persist(dto: CreateNotificationDto) {
    try {
      await this.notiRepo.create({ ...dto, isRead: false });
    } catch (error) {
      this.logger.error(`Failed to persist notification: ${error}`);
    }
  }

  private async emit<T>(userId: number, type: NotificationType, data: T) {
    try {
      const payload: NotificationPayload<T> = { type, data };
      this.gateway.emitToUser(userId, NOTIFICATION_EVENT, payload);
    } catch (error) {
      this.logger.error(`Failed to emit notification: ${error}`);
    }
  }
}
