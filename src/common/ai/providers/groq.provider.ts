import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProviderName } from '../interfaces';
import {
  OpenAiCompatibleConfig,
  OpenAiCompatibleProvider,
} from './openai-compatible.provider';

@Injectable()
export class GroqProvider extends OpenAiCompatibleProvider {
  readonly name = AiProviderName.GROQ;

  protected readonly url = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(private readonly configService: ConfigService) {
    super();
  }

  protected resolveConfig(): OpenAiCompatibleConfig {
    return {
      apiKey: this.configService.getOrThrow<string>('ai.groq.apiKey'),
      model: this.configService.getOrThrow<string>('ai.groq.model'),
      timeoutMs: this.configService.getOrThrow<number>('ai.groq.timeoutMs'),
    };
  }
}
