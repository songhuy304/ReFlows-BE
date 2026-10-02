import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateTokenDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsDate()
  @Type(() => Date)
  expiresAt: Date;

  @IsString()
  type: string;
}

export class GetTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  type: string;
}

export class VerifyTokenDto extends GetTokenDto {}
