import { Module } from '@nestjs/common';
import { AI_PROVIDERS, AiProvider } from './interfaces';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { AiService } from './services/ai.service';

const providerStrategies = [OpenRouterProvider];

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
