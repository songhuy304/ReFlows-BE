import { plainToInstance } from 'class-transformer';
import { NotificationResponseDto } from '../dtos/responses/notification.get.response';
import { NotificationEntity } from '@/common/database/entities/notification.entity';

export class NotificationMapper {
  static toResponse(notification: NotificationEntity): NotificationResponseDto {
    return plainToInstance(NotificationResponseDto, notification, {
      excludeExtraneousValues: true,
    });
  }

  static toResponses(
    notifications: NotificationEntity[],
  ): NotificationResponseDto[] {
    return notifications.map((notification) => this.toResponse(notification));
  }
}
