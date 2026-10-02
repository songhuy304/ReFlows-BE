import { ApiEndpoint } from '@/common/doc';
import { AuthUser } from '@/common/guard/decorator';
import { IAuthUser } from '@/common/request/interfaces';
import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationRequestDto } from '../dtos/requests/notification.get';
import {
  NotificationResponseDto,
  NotificationUnreadCountResponseDto,
} from '../dtos/responses/notification.get.response';
import { NotificationService } from '../services/notification.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notiService: NotificationService) {}

  @Get()
  @ApiEndpoint({
    summary: 'Get notifications of current user',
    serialization: NotificationResponseDto,
    paginated: true,
  })
  getNotifications(
    @Query() query: NotificationRequestDto,
    @AuthUser() user: IAuthUser,
  ) {
    return this.notiService.getNotifications(query, user);
  }

  @Get('unread-count')
  @ApiEndpoint({
    summary: 'Count unread notifications of current user',
    serialization: NotificationUnreadCountResponseDto,
  })
  countUnread(@AuthUser() user: IAuthUser) {
    return this.notiService.countUnread(user);
  }

  @Patch(':id/mark-as-read')
  @ApiEndpoint({
    summary: 'Mark a notification as read',
    serialization: NotificationResponseDto,
  })
  markAsRead(@Param('id') id: number, @AuthUser() user: IAuthUser) {
    return this.notiService.markAsRead(id, user);
  }

  @Patch('mark-all-as-read')
  @ApiEndpoint({
    summary: 'Mark all notifications of current user as read',
    serialization: Boolean,
  })
  markAllAsRead(@AuthUser() user: IAuthUser) {
    return this.notiService.markAllAsRead(user);
  }
}
