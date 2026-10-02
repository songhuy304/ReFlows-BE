import { ApiProperty } from '@nestjs/swagger';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    MaxLength,
} from 'class-validator';
import { NotificationType } from '../../interfaces';

export class CreateNotificationDto {
    @ApiProperty()
    @IsNumber()
    userId: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        enum: NotificationType,
        example: NotificationType.JOINED_TEAM,
    })
    @IsEnum(NotificationType)
    type: NotificationType;
}