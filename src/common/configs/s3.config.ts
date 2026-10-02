import { registerAs } from '@nestjs/config';

export default registerAs(
  's3',
  (): Record<string, any> => ({
    region: process.env.AWS_S3_REGION,
    bucketName: process.env.AWS_S3_BUCKET,
    endpoint: process.env.AWS_S3_ENDPOINT,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    publicUrl: process.env.AWS_S3_PUBLIC_URL,
  }),
);
