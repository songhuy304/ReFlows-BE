import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AI_PROVIDERS,
  AiChatOptions,
  AiMessage,
  AiProvider,
  AiProviderName,
  AiResponse,
} from '../interfaces';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  private readonly providers: Map<AiProviderName, AiProvider>;

  constructor(
    @Inject(AI_PROVIDERS) providers: AiProvider[],
    private readonly configService: ConfigService,
  ) {
    this.providers = new Map(
      providers.map((provider) => [provider.name, provider]),
    );
  }

  async chat(
    messages: AiMessage[],
    options?: AiChatOptions,
  ): Promise<AiResponse> {
    const primary = this.resolveProvider(options?.provider);

    try {
      return await primary.chat(messages, options);
    } catch (error) {
      const fallback = this.resolveFallback(options, primary.name);

      if (!fallback) {
        throw error;
      }

      this.logger.warn(
        `AI provider "${primary.name}" failed, falling back to "${fallback.name}": ${
          error instanceof Error ? error.message : error
        }`,
      );

      return fallback.chat(messages, { ...options, provider: fallback.name });
    }
  }

  private resolveFallback(
    options: AiChatOptions | undefined,
    primaryName: AiProviderName,
  ): AiProvider | undefined {
    // An explicitly requested provider must not be silently swapped.
    if (options?.provider) {
      return undefined;
    }

    const fallbackName = this.configService.get<AiProviderName>(
      'ai.fallbackProvider',
    );

    if (!fallbackName || fallbackName === primaryName) {
      return undefined;
    }

    return this.providers.get(fallbackName);
  }

  private resolveProvider(name?: AiProviderName): AiProvider {
    const providerName =
      name ??
      this.configService.getOrThrow<AiProviderName>('ai.defaultProvider');

    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`AI provider "${providerName}" is not registered`);
    }

    return provider;
  }
}
