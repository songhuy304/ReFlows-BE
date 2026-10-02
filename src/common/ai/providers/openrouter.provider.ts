import { BadRequestException } from '@/common/filters';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiChatOptions,
  AiMessage,
  AiProvider,
  AiProviderName,
  AiResponse,
} from '../interfaces';

@Injectable()
export class OpenRouterProvider implements AiProvider {
  readonly name = AiProviderName.OPEN_ROUTER;

  constructor(private readonly configService: ConfigService) {}

  async chat(
    messages: AiMessage[],
    options?: AiChatOptions,
  ): Promise<AiResponse> {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.configService.getOrThrow<string>(
            'ai.openRouter.apiKey',
          )}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model:
            options?.model ??
            this.configService.getOrThrow<string>('ai.openRouter.model'),

          messages,

          temperature: options?.temperature ?? 0.7,

          ...(options?.responseFormat === 'json' && {
            response_format: {
              type: 'json_object',
            },
          }),
        }),
      },
    );

    if (!response.ok) {
      throw new BadRequestException('AI provider request failed');
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
