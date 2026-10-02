import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File upload',
  })
  file: Express.Multer.File;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Optional folder path to upload the file',
  })
  @IsOptional()
  @IsString()
  folderPath?: string;
}
