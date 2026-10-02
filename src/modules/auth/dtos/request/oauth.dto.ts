import { EAuthProvider } from '../../enums/provider.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UserOauthDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsString()
  avatar: string;

  @IsEnum(EAuthProvider)
  provider: EAuthProvider;
}

export class VerifyOauthDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
