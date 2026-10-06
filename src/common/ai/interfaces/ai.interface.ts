import type { AiProviderName } from './ai-provider.interface';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiJsonSchema {
  name: string;
  schema: Record<string, unknown>;
}

export interface AiChatOptions {
  provider?: AiProviderName;
  model?: string;
  temperature?: number;
  responseFormat?: 'text' | 'json';

  /**
   * Enforces the exact output shape (strict mode). Requires a provider/model
   * with structured output support and takes precedence over responseFormat.
   * Every property must be listed in `required`; use `["<type>", "null"]` for
   * optional fields.
   */
  jsonSchema?: AiJsonSchema;
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
