import { BadGatewayException, BadRequestException } from '@/common/filters';
import { Injectable, Logger } from '@nestjs/common';
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

  private readonly logger = new Logger(OpenRouterProvider.name);

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
    const choice = data.choices?.[0];
    const content: unknown = choice?.message?.content;

    if (typeof content !== 'string' || !content.trim()) {
      this.logger.warn(
        `Empty AI response (model: ${data.model}, finish_reason: ${choice?.finish_reason}, error: ${JSON.stringify(data.error ?? choice?.error)})`,
      );
      throw new BadGatewayException('AI provider returned empty response');
    }

    return {
      content,
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
