import { BadGatewayException, ERROR_CODE } from '@/common/filters';
import { Logger } from '@nestjs/common';
import {
  AiChatOptions,
  AiMessage,
  AiProvider,
  AiProviderName,
  AiResponse,
} from '../interfaces';

export interface OpenAiCompatibleConfig {
  apiKey: string;
  model: string;
  timeoutMs: number;
}

export abstract class OpenAiCompatibleProvider implements AiProvider {
  abstract readonly name: AiProviderName;

  protected abstract readonly url: string;

  protected readonly logger = new Logger(this.constructor.name);

  protected abstract resolveConfig(): OpenAiCompatibleConfig;

  /** Provider specific body fields, merged into the request payload. */
  protected buildExtraBody(_options?: AiChatOptions): Record<string, unknown> {
    return {};
  }

  async chat(
    messages: AiMessage[],
    options?: AiChatOptions,
  ): Promise<AiResponse> {
    const config = this.resolveConfig();
    const model = options?.model ?? config.model;

    const response = await this.request(
      {
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        ...this.buildResponseFormat(options),
        ...this.buildExtraBody(options),
      },
      config,
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');

      this.logger.error(
        `AI provider request failed (provider: ${this.name}, model: ${model}, status: ${response.status}): ${body.slice(0, 500)}`,
      );
      throw new BadGatewayException(ERROR_CODE.AI_PROVIDER_FAILED);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const content: unknown = choice?.message?.content;

    if (typeof content !== 'string' || !content.trim()) {
      this.logger.warn(
        `Empty AI response (provider: ${this.name}, model: ${data.model}, finish_reason: ${choice?.finish_reason}, error: ${JSON.stringify(data.error ?? choice?.error)})`,
      );
      throw new BadGatewayException(ERROR_CODE.AI_PROVIDER_EMPTY_RESPONSE);
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

  private async request(
    body: Record<string, unknown>,
    config: OpenAiCompatibleConfig,
  ): Promise<Response> {
    try {
      return await fetch(this.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(config.timeoutMs),
      });
    } catch (error) {
      const reason = error instanceof Error ? error.name : 'Unknown';

      this.logger.error(
        `AI provider unreachable (provider: ${this.name}, reason: ${reason}, timeout: ${config.timeoutMs}ms)`,
      );
      throw new BadGatewayException(
        reason === 'TimeoutError' || reason === 'AbortError'
          ? ERROR_CODE.AI_PROVIDER_TIMEOUT
          : ERROR_CODE.AI_PROVIDER_FAILED,
      );
    }
  }

  private buildResponseFormat(
    options?: AiChatOptions,
  ): Record<string, unknown> {
    if (options?.jsonSchema) {
      return {
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: options.jsonSchema.name,
            strict: true,
            schema: options.jsonSchema.schema,
          },
        },
      };
    }

    if (options?.responseFormat === 'json') {
      return { response_format: { type: 'json_object' } };
    }

    return {};
  }
}
