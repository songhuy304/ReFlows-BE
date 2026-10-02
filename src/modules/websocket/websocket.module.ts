import { HelperModule } from '@/common/helper/helper.module';
import { Module } from '@nestjs/common';
import { NotificationGateway } from './gateways/notification.gateway';

@Module({
    imports: [HelperModule],
    providers: [NotificationGateway],
    exports: [NotificationGateway],
})
export class WebsocketModule { }