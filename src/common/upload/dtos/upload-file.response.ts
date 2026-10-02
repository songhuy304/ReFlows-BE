import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UploadFileResponse {
  @IsString()
  @ApiProperty({ type: String })
  url: string;
  @IsString()
  @ApiProperty({ type: String })
  key: string;
  @IsString()
  @ApiProperty({ type: String })
  fileName: string;
  @IsNumber()
  @ApiProperty({ type: Number })
  size: number;
}
