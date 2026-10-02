import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokenDto {
  @ApiProperty({
    required: true,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({
    required: true,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LoginResponseDto extends TokenDto {}
export class SignupResponseDto extends TokenDto {}
export class AuthRefreshResponseDto extends TokenDto {}
export class OauthResponseDto extends TokenDto {}
