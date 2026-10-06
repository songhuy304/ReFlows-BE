import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiChatOptions, AiProviderName } from '../interfaces';
import {
  OpenAiCompatibleConfig,
  OpenAiCompatibleProvider,
} from './openai-compatible.provider';

@Injectable()
export class OpenRouterProvider extends OpenAiCompatibleProvider {
  readonly name = AiProviderName.OPEN_ROUTER;

  protected readonly url = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(private readonly configService: ConfigService) {
    super();
  }

  protected resolveConfig(): OpenAiCompatibleConfig {
    return {
      apiKey: this.configService.getOrThrow<string>('ai.openRouter.apiKey'),
      model: this.configService.getOrThrow<string>('ai.openRouter.model'),
      timeoutMs: this.configService.getOrThrow<number>(
        'ai.openRouter.timeoutMs',
      ),
    };
  }

  protected buildExtraBody(
    options?: AiChatOptions,
  ): Record<string, unknown> {
    // Without this, OpenRouter may route to a provider that silently ignores
    // response_format and returns free-form text.
    if (options?.jsonSchema || options?.responseFormat === 'json') {
      return { provider: { require_parameters: true } };
    }

    return {};
  }
}
