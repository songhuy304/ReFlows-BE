import { Module } from '@nestjs/common';
import { AI_PROVIDERS, AiProvider } from './interfaces';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { AiService } from './services/ai.service';

const providerStrategies = [GroqProvider, OpenRouterProvider];

@Module({
  providers: [
    ...providerStrategies,
    {
      provide: AI_PROVIDERS,
      useFactory: (...providers: AiProvider[]) => providers,
      inject: providerStrategies,
    },
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}
