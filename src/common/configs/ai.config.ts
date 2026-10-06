import { registerAs } from '@nestjs/config';
import { AiProviderName } from '@/common/ai/interfaces';

export default registerAs(
  'ai',
  (): Record<string, any> => ({
    defaultProvider:
      process.env.AI_DEFAULT_PROVIDER ?? AiProviderName.OPEN_ROUTER,

    openRouter: {
      apiKey: process.env.OPEN_ROUTE_API_KEY,
      model: process.env.OPENROUTER_MODEL,
      timeoutMs: Number(process.env.OPENROUTER_TIMEOUT_MS ?? 60_000),
    },
  }),
);
