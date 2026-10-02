import { ConfigFactory } from '@nestjs/config';
import appConfig from './app.config';
import authConfig from './auth.config';
import docConfig from './doc.config';
import redisConfig from './redis.config';
import s3Config from './s3.config';

const configs: ConfigFactory[] = [
  appConfig,
  authConfig,
  docConfig,
  redisConfig,
  s3Config,
];

export default configs;
