import { ApiEndpoint } from '@/common/doc';
import { BadRequestException } from '@/common/filters/exception';
import { ApiResponseDto } from '@/common/response';
import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadFileDto, UploadFileResponse } from '../dtos';
import { UploadService } from '../services/upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiEndpoint({
    summary: 'Upload a file',
    serialization: UploadFileResponse,
    httpStatus: HttpStatus.OK,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFileDto,
  ): Promise<ApiResponseDto<UploadFileResponse>> {
    const response = await this.uploadService.uploadFile(file, body.folderPath);
    return response;
  }

  @Delete('delete')
  async deleteFile(@Body() body: { key: string }) {
    if (!body.key) {
      throw new BadRequestException('Key is required');
    }
    await this.uploadService.deleteFile(body.key);
    return { message: 'File deleted successfully' };
  }
}
