/**
 * LLM Client
 * Unified client for OpenAI and Anthropic LLM providers
 */

import type { LLMConfig, LLMResponse, LLMProvider } from '../../types/index.js';

// Default configurations
const DEFAULT_OPENAI_MODEL = 'gpt-4-turbo-preview';
const DEFAULT_ANTHROPIC_MODEL = 'claude-3-sonnet-20240229';
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.7;

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  jsonMode?: boolean;
}

export class LLMClient {
  private config: LLMConfig;
  private openaiApiKey?: string;
  private anthropicApiKey?: string;

  constructor(config?: Partial<LLMConfig>) {
    this.config = {
      provider: config?.provider || (process.env.LLM_PROVIDER as LLMProvider) || 'openai',
      model: config?.model || this.getDefaultModel(config?.provider),
      maxTokens: config?.maxTokens || DEFAULT_MAX_TOKENS,
      temperature: config?.temperature || DEFAULT_TEMPERATURE,
    };

    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  }

  private getDefaultModel(provider?: LLMProvider): string {
    const p = provider || this.config?.provider || 'openai';
    return p === 'anthropic' ? DEFAULT_ANTHROPIC_MODEL : DEFAULT_OPENAI_MODEL;
  }

  async complete(options: CompletionOptions): Promise<LLMResponse> {
    const { messages, maxTokens, temperature, stopSequences, jsonMode } = options;

    if (this.config.provider === 'anthropic') {
      return this.completeWithAnthropic(messages, {
        maxTokens: maxTokens || this.config.maxTokens,
        temperature: temperature || this.config.temperature,
        stopSequences,
      });
    }

    return this.completeWithOpenAI(messages, {
      maxTokens: maxTokens || this.config.maxTokens,
      temperature: temperature || this.config.temperature,
      stopSequences,
      jsonMode,
    });
  }

  private async completeWithOpenAI(
    messages: LLMMessage[],
    options: { maxTokens: number; temperature: number; stopSequences?: string[]; jsonMode?: boolean }
  ): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        stop: options.stopSequences,
        response_format: options.jsonMode ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice.message.content,
      tokenUsage: {
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
        total: data.usage.total_tokens,
      },
      model: data.model,
      finishReason: choice.finish_reason,
    };
  }

  private async completeWithAnthropic(
    messages: LLMMessage[],
    options: { maxTokens: number; temperature: number; stopSequences?: string[] }
  ): Promise<LLMResponse> {
    // Extract system message if present
    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.anthropicApiKey || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        system: systemMessage?.content,
        messages: conversationMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        stop_sequences: options.stopSequences,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      tokenUsage: {
        prompt: data.usage.input_tokens,
        completion: data.usage.output_tokens,
        total: data.usage.input_tokens + data.usage.output_tokens,
      },
      model: data.model,
      finishReason: data.stop_reason,
    };
  }

  async completeWithRetry(options: CompletionOptions, maxRetries = 3): Promise<LLMResponse> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.complete(options);
      } catch (error) {
        lastError = error as Error;

        // Don't retry on non-retryable errors
        if (lastError.message.includes('invalid_api_key') ||
            lastError.message.includes('rate_limit')) {
          throw lastError;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Failed after max retries');
  }

  async streamComplete(
    options: CompletionOptions,
    onChunk: (chunk: string) => void
  ): Promise<LLMResponse> {
    // For simplicity, we'll use non-streaming and return the full response
    // In production, you'd implement actual streaming with SSE
    const response = await this.complete(options);
    onChunk(response.content);
    return response;
  }

  getProvider(): LLMProvider {
    return this.config.provider;
  }

  getModel(): string {
    return this.config.model;
  }

  setProvider(provider: LLMProvider): void {
    this.config.provider = provider;
    this.config.model = this.getDefaultModel(provider);
  }

  setModel(model: string): void {
    this.config.model = model;
  }
}

// Singleton instance
let defaultClient: LLMClient | undefined;

export function getLLMClient(config?: Partial<LLMConfig>): LLMClient {
  if (config) {
    return new LLMClient(config);
  }

  if (!defaultClient) {
    defaultClient = new LLMClient();
  }

  return defaultClient;
}

export function resetLLMClient(): void {
  defaultClient = undefined;
}
