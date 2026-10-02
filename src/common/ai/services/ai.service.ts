import { Inject, Injectable } from '@nestjs/common';
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
  private readonly providers: Map<AiProviderName, AiProvider>;

  constructor(
    @Inject(AI_PROVIDERS) providers: AiProvider[],
    private readonly configService: ConfigService,
  ) {
    this.providers = new Map(
      providers.map((provider) => [provider.name, provider]),
    );
  }

  chat(messages: AiMessage[], options?: AiChatOptions): Promise<AiResponse> {
    return this.resolveProvider(options?.provider).chat(messages, options);
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
