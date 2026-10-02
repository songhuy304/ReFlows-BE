import type { AiProviderName } from './ai-provider.interface';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiChatOptions {
  provider?: AiProviderName;
  model?: string;
  temperature?: number;
  responseFormat?: 'text' | 'json';
}

export interface AiResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
