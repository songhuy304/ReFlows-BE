import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { registerAs } from '@nestjs/config';

export enum APP_ENVIRONMENT {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  STAGING = 'staging',
}

export default registerAs('app', (): Record<string, any> => {
  const corsConfig: CorsOptions = {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  };

  return {
    env: process.env.APP_ENV ?? APP_ENVIRONMENT.LOCAL,
    name: process.env.APP_NAME ?? 'RecruitHub',
    frontend: process.env.FRONTEND_URL,

    versioning: {
      enable: process.env.HTTP_VERSIONING_ENABLE === 'true',
      prefix: 'v',
      version: process.env.HTTP_VERSION ?? '1',
    },

    throttle: {
      ttl: 60,
      limit: 10,
    },

    http: {
      host: process.env.HTTP_HOST ?? 'localhost',
      port: process.env.HTTP_PORT
        ? Number.parseInt(process.env.HTTP_PORT)
        : 3000,
    },

    cors: corsConfig,

    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.APP_ENV ?? APP_ENVIRONMENT.LOCAL,
    },

    debug: process.env.APP_DEBUG === 'true',
    logLevel: process.env.APP_LOG_LEVEL ?? 'info',

    mail: {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      user: process.env.MAIL_USER,
      password: process.env.MAIL_PASSWORD,
      from: process.env.APP_NAME,
    },

    aws: {
      bucketName: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_S3_REGION,
      previewLinkExpiration: process.env.AWS_S3_PRESIGN_LINK_EXPIRES,
      accessKey: process.env.AWS_ACCESS_KEY,
      secretKey: process.env.AWS_SECRET_KEY,
    },
  };
});
