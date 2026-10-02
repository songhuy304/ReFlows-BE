import { REGEX_PASSWORD } from '@/modules/auth/constants';
import { UserEntity } from '@/common/database/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class SignupDto implements Partial<UserEntity> {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(REGEX_PASSWORD, {
    message:
      'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
  })
  public password: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @Length(6, 100)
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsString()
  public companyName?: string;
}
