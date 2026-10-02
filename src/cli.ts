import 'reflect-metadata';

import { CommandFactory } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { ScriptsModule } from './scripts/scripts.module';

async function bootstrap() {
  try {
    await CommandFactory.run(ScriptsModule, {
      logger: new Logger(),
    });
  } catch (err) {
    Logger.error(err, 'CLI');
    process.exit(1);
  }
}

bootstrap();
