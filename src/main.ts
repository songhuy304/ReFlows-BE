import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import express from 'express';
import {
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import setupSwagger from './swagger';

async function bootstrap() {
  const server = express();
  const logger = new Logger('Bootstrap');
  let app: INestApplication | undefined;

  try {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    const config = app.get(ConfigService);

    const port = config.getOrThrow<number>('app.http.port');
    const host = config.getOrThrow<string>('app.http.host');
    const version = config.get<string>('app.versioning.version');

    app.setGlobalPrefix('api');
    app.enableCors(config.get('app.cors'));
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: version ?? '1',
      prefix: config.get<string>('app.versioning.prefix'),
    });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    );

    setupSwagger(app);

    await app.listen(port, host);

    logger.log(`Server running on: ${await app.getUrl()}`);
  } catch (error) {
    logger.error(
      'Server failed to start',
      error instanceof Error ? error.stack : String(error),
    );

    if (app) {
      await app.close();
    }

    process.exit(1);
  }
}

void bootstrap();
