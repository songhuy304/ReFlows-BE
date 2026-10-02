import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  public identifier: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  public password: string;
}
