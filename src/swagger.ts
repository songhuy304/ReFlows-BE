import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { DOC_AUTH_ACCESS_TOKEN } from '@/common/doc';

export default function setupSwagger(app: INestApplication) {
  const configService = app.get(ConfigService);
  const logger = new Logger('SwaggerSetup');

  const swaggerConfig = {
    name: configService.get<string>('doc.name', 'API Documentation'),
    description: configService.get<string>(
      'doc.description',
      'API Description',
    ),
    version: configService.get<string>('doc.version', '1.0'),
    prefix: configService.get<string>('doc.prefix', 'docs'),
  };

  const documentBuild = new DocumentBuilder()
    .setTitle(swaggerConfig.name)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your access token',
      },
      DOC_AUTH_ACCESS_TOKEN,
    )
    .build();

  const document = SwaggerModule.createDocument(app, documentBuild, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup(swaggerConfig.prefix, app, document, {
    explorer: true,
    customSiteTitle: swaggerConfig.name,
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      displayOperationId: false,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
      filter: true,
      withCredentials: true,
    },
  });

  logger.log(`Swagger documentation available at /${swaggerConfig.prefix}`);
}
