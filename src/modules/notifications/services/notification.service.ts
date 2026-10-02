import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepositoryImpl } from '../repositories/notification.repository';
import { ApiResponseDto, PaginatedResponseDto } from '@/common/response';
import { NotificationRequestDto } from '../dtos/requests/notification.get';
import { IAuthUser } from '@/common/request/interfaces';
import { SortOrder } from '@/common/helper/enums/query.enum';
import { NotificationMapper } from '../mappers/notification.mapper';
import { NotificationResponseDto } from '../dtos/responses/notification.get.response';
import {
  BadRequestException,
  NotFoundException,
} from '@/common/filters/exception';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(private readonly notiRepo: NotificationRepositoryImpl) {}

  async getNotifications(
    query: NotificationRequestDto,
    authUser: IAuthUser,
  ): Promise<PaginatedResponseDto<NotificationResponseDto>> {
    const { limit, page } = query;

    const noti = await this.notiRepo.findMany(
      { limit, page },
      {
        where: { userId: authUser.userId },
        sort: {
          createdAt: SortOrder.DESC,
          id: SortOrder.DESC,
        },
      },
    );

    const dataMap = NotificationMapper.toResponses(noti.data);
    return PaginatedResponseDto.success(dataMap, noti.meta);
  }

  async countUnread(
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<{ count: number }>> {
    const count = await this.notiRepo.count({
      where: { userId: authUser.userId, isRead: false },
    });
    return ApiResponseDto.success({ count });
  }

  async markAsRead(
    id: number,
    authUser: IAuthUser,
  ): Promise<ApiResponseDto<NotificationResponseDto>> {
    const noti = await this.notiRepo.findOneBy({ id: id });

    if (!noti) {
      throw new NotFoundException('Notification not found');
    }
    if (noti.userId !== authUser.userId) {
      throw new BadRequestException('Notification does not belong to user');
    }

    const updated = await this.notiRepo.update(id, {
      isRead: true,
    });

    return ApiResponseDto.success(NotificationMapper.toResponse(updated));
  }

  async markAllAsRead(authUser: IAuthUser): Promise<ApiResponseDto<boolean>> {
    await this.notiRepo.updateMany(
      {
        userId: authUser.userId,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    return ApiResponseDto.success(true);
  }
}
