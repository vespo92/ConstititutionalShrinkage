/**
 * Token Counter Utilities
 * Utilities for counting and managing tokens
 */

// Simplified token estimation (real implementation would use tiktoken)
const AVG_CHARS_PER_TOKEN = 4;

export interface TokenCount {
  tokens: number;
  characters: number;
  words: number;
}

export interface TokenBudget {
  total: number;
  used: number;
  remaining: number;
  percentage: number;
}

/**
 * Estimate token count for text
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Simple estimation: ~4 characters per token on average
  return Math.ceil(text.length / AVG_CHARS_PER_TOKEN);
}

/**
 * Get detailed token count
 */
export function getTokenCount(text: string): TokenCount {
  return {
    tokens: estimateTokens(text),
    characters: text.length,
    words: text.split(/\s+/).filter(Boolean).length,
  };
}

/**
 * Check if text fits within token limit
 */
export function fitsWithinLimit(text: string, limit: number): boolean {
  return estimateTokens(text) <= limit;
}

/**
 * Truncate text to fit token limit
 */
export function truncateToTokenLimit(text: string, limit: number): string {
  const estimated = estimateTokens(text);
  if (estimated <= limit) return text;

  // Estimate character limit
  const charLimit = limit * AVG_CHARS_PER_TOKEN;

  // Try to truncate at word boundary
  let truncated = text.slice(0, charLimit);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > charLimit * 0.8) {
    truncated = truncated.slice(0, lastSpace);
  }

  return truncated + '...';
}

/**
 * Calculate token budget
 */
export function calculateBudget(maxTokens: number, usedTokens: number): TokenBudget {
  const remaining = Math.max(0, maxTokens - usedTokens);
  return {
    total: maxTokens,
    used: usedTokens,
    remaining,
    percentage: (usedTokens / maxTokens) * 100,
  };
}

/**
 * Split text into chunks that fit within token limit
 */
export function splitIntoChunks(text: string, maxTokens: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = '';
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);

    if (currentTokens + paragraphTokens > maxTokens) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = paragraph;
      currentTokens = paragraphTokens;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      currentTokens += paragraphTokens;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Estimate cost based on token count
 */
export function estimateCost(
  promptTokens: number,
  completionTokens: number,
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'claude-3-sonnet' | 'claude-3-opus' = 'gpt-4-turbo'
): number {
  const rates: Record<string, { prompt: number; completion: number }> = {
    'gpt-4': { prompt: 0.03 / 1000, completion: 0.06 / 1000 },
    'gpt-4-turbo': { prompt: 0.01 / 1000, completion: 0.03 / 1000 },
    'gpt-3.5-turbo': { prompt: 0.0005 / 1000, completion: 0.0015 / 1000 },
    'claude-3-sonnet': { prompt: 0.003 / 1000, completion: 0.015 / 1000 },
    'claude-3-opus': { prompt: 0.015 / 1000, completion: 0.075 / 1000 },
  };

  const rate = rates[model] || rates['gpt-4-turbo'];
  return promptTokens * rate.prompt + completionTokens * rate.completion;
}

/**
 * Format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}
