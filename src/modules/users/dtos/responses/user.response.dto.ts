import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ERole } from '@/common/guard/constants/role.constant';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'john@gmail.com' })
  @Expose()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'https://avatar.com/a.png', required: false })
  @Expose()
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ enum: ERole, example: ERole.USER })
  @Expose()
  @IsEnum(ERole)
  role: ERole;

  @ApiProperty({ example: true })
  @Expose()
  @IsBoolean()
  isVerified: boolean;
}
