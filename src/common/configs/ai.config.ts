import { registerAs } from '@nestjs/config';
import { AiProviderName } from '@/common/ai/interfaces';

export default registerAs(
  'ai',
  (): Record<string, any> => ({
    defaultProvider: process.env.AI_DEFAULT_PROVIDER ?? AiProviderName.GROQ,

    fallbackProvider:
      process.env.AI_FALLBACK_PROVIDER ?? AiProviderName.OPEN_ROUTER,

    groq: {
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL,
      timeoutMs: Number(process.env.GROQ_TIMEOUT_MS ?? 60_000),
    },

    openRouter: {
      apiKey: process.env.OPEN_ROUTE_API_KEY,
      model: process.env.OPENROUTER_MODEL,
      timeoutMs: Number(process.env.OPENROUTER_TIMEOUT_MS ?? 60_000),
    },
  }),
);
