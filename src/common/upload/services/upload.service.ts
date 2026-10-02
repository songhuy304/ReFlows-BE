import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadFileResponse } from '../dtos/upload-file.response';
import { BadRequestException } from '@/common/filters/exception';
import { randomUUID } from 'crypto';
import { Upload } from '@aws-sdk/lib-storage';
import { ApiResponseDto } from '@/common/response';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get('s3.region'),
      endpoint: this.configService.get('s3.endpoint'),
      credentials: {
        accessKeyId: this.configService.get('s3.accessKeyId'),
        secretAccessKey: this.configService.get('s3.secretAccessKey'),
      },
      forcePathStyle: true,
    });

    this.bucketName = this.configService.get('s3.bucketName');
  }

  async uploadFile(
    file: Express.Multer.File,
    folderPath: string = '',
  ): Promise<ApiResponseDto<UploadFileResponse>> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const fileName = `images/${randomUUID()}-${file.originalname}`;
      const key = folderPath ? `${folderPath}/${fileName}` : fileName;

      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            'original-name': file.originalname,
            'upload-date': new Date().toISOString(),
          },
        },
        queueSize: 4,
        partSize: 5 * 1024 * 1024,
        leavePartsOnError: false,
      });

      await upload.done();

      const publicUrl = `${this.configService.get('s3.publicUrl')}${this.bucketName}/${key}`;

      const response = {
        fileName: file.originalname,
        key,
        url: publicUrl,
        size: file.size,
      };

      return ApiResponseDto.success(response);
    } catch (error) {
      this.logger.error('failed to upload file', error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new BadRequestException(`File deletion failed: ${error.message}`);
    }
  }
}
