import { AiChatOptions, AiMessage, AiResponse } from './ai.interface';

export enum AiProviderName {
  OPEN_ROUTER = 'openrouter',
}

export const AI_PROVIDERS = Symbol('AI_PROVIDERS');

export interface AiProvider {
  readonly name: AiProviderName;

  chat(messages: AiMessage[], options?: AiChatOptions): Promise<AiResponse>;
}
