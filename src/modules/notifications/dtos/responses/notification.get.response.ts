import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class NotificationResponseDto {
    @ApiProperty({
        example: 1,
    })
    @Expose()
    id: number;

    @ApiProperty({
        example: 'Team invitation',
    })
    @Expose()
    title: string;

    @ApiProperty({
        example: 'You have been invited to join the team.',
    })
    @Expose()
    content: string;

    @ApiProperty({
        example: 'TEAM_INVITE',
    })
    @Expose()
    type: string;

    @ApiProperty({
        example: false,
    })
    @Expose()
    isRead: boolean;

    @ApiProperty({
        example: 10,
    })
    @Expose()
    userId: number;
}

export class NotificationUnreadCountResponseDto {
    @ApiProperty({
        example: 3,
    })
    @Expose()
    count: number;
}