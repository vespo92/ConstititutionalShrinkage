/**
 * LangChain Integration
 * Chain-based processing for complex AI workflows
 */

import { getLLMClient, type LLMMessage } from './client.js';
import { renderPrompt, type PromptKey } from './prompts.js';

export interface ChainStep {
  name: string;
  prompt: PromptKey;
  variables: Record<string, string>;
  outputKey: string;
  parser?: (output: string) => unknown;
}

export interface ChainContext {
  [key: string]: unknown;
}

export interface ChainResult {
  success: boolean;
  outputs: ChainContext;
  steps: {
    name: string;
    success: boolean;
    output?: unknown;
    error?: string;
    tokenUsage?: { prompt: number; completion: number; total: number };
  }[];
  totalTokens: number;
}

/**
 * Execute a chain of LLM operations
 */
export async function executeChain(
  steps: ChainStep[],
  initialContext: ChainContext = {}
): Promise<ChainResult> {
  const client = getLLMClient();
  const context: ChainContext = { ...initialContext };
  const stepResults: ChainResult['steps'] = [];
  let totalTokens = 0;

  for (const step of steps) {
    try {
      // Resolve variables from context
      const resolvedVariables: Record<string, string> = {};
      for (const [key, value] of Object.entries(step.variables)) {
        if (value.startsWith('$')) {
          // Reference to context variable
          const contextKey = value.slice(1);
          resolvedVariables[key] = String(context[contextKey] ?? '');
        } else {
          resolvedVariables[key] = value;
        }
      }

      // Render prompt
      const prompt = renderPrompt(step.prompt, resolvedVariables);

      // Execute LLM call
      const messages: LLMMessage[] = [
        { role: 'user', content: prompt },
      ];

      const response = await client.complete({
        messages,
        temperature: 0.3, // Lower temperature for more consistent outputs
        jsonMode: true,
      });

      totalTokens += response.tokenUsage.total;

      // Parse output
      let parsedOutput: unknown;
      try {
        parsedOutput = step.parser
          ? step.parser(response.content)
          : JSON.parse(response.content);
      } catch {
        parsedOutput = response.content;
      }

      // Store in context
      context[step.outputKey] = parsedOutput;

      stepResults.push({
        name: step.name,
        success: true,
        output: parsedOutput,
        tokenUsage: response.tokenUsage,
      });
    } catch (error) {
      stepResults.push({
        name: step.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Continue or abort based on step criticality
      // For now, we continue but mark the chain as partially failed
    }
  }

  const allSucceeded = stepResults.every((s) => s.success);

  return {
    success: allSucceeded,
    outputs: context,
    steps: stepResults,
    totalTokens,
  };
}

/**
 * Pre-built chains for common operations
 */
export const CHAINS = {
  /**
   * Full bill analysis chain
   */
  fullBillAnalysis: (billContent: string, constitution: string): ChainStep[] => [
    {
      name: 'summarize',
      prompt: 'SUMMARIZE_BILL',
      variables: { billContent },
      outputKey: 'summary',
    },
    {
      name: 'compliance',
      prompt: 'CHECK_COMPLIANCE',
      variables: { billContent, constitution },
      outputKey: 'compliance',
    },
    {
      name: 'categorize',
      prompt: 'CATEGORIZE_BILL',
      variables: {
        billContent,
        categories: 'Healthcare, Education, Environment, Economy, Infrastructure, Civil Rights, Defense, Immigration, Technology, Agriculture',
      },
      outputKey: 'categories',
    },
  ],

  /**
   * Impact analysis chain
   */
  impactAnalysis: (billContent: string, region: string): ChainStep[] => [
    {
      name: 'predict-impact',
      prompt: 'PREDICT_TBL_IMPACT',
      variables: { billContent, region },
      outputKey: 'impact',
    },
    {
      name: 'sentiment',
      prompt: 'ANALYZE_SENTIMENT',
      variables: { text: billContent },
      outputKey: 'sentiment',
    },
  ],

  /**
   * Question answering chain with context retrieval
   */
  questionAnswering: (question: string, context: string, history: string): ChainStep[] => [
    {
      name: 'optimize-query',
      prompt: 'SEMANTIC_SEARCH_QUERY',
      variables: { query: question },
      outputKey: 'optimizedQuery',
      parser: (output) => output.trim(),
    },
    {
      name: 'answer',
      prompt: 'CITIZEN_ASSISTANT',
      variables: { question, context, history },
      outputKey: 'response',
    },
  ],
};

/**
 * Parallel chain execution for independent steps
 */
export async function executeParallelChain(
  steps: ChainStep[],
  context: ChainContext = {}
): Promise<ChainResult> {
  const client = getLLMClient();
  const finalContext: ChainContext = { ...context };
  let totalTokens = 0;

  // Execute all steps in parallel
  const results = await Promise.allSettled(
    steps.map(async (step) => {
      const resolvedVariables: Record<string, string> = {};
      for (const [key, value] of Object.entries(step.variables)) {
        if (value.startsWith('$')) {
          const contextKey = value.slice(1);
          resolvedVariables[key] = String(context[contextKey] ?? '');
        } else {
          resolvedVariables[key] = value;
        }
      }

      const prompt = renderPrompt(step.prompt, resolvedVariables);
      const messages: LLMMessage[] = [{ role: 'user', content: prompt }];

      const response = await client.complete({
        messages,
        temperature: 0.3,
        jsonMode: true,
      });

      let parsedOutput: unknown;
      try {
        parsedOutput = step.parser
          ? step.parser(response.content)
          : JSON.parse(response.content);
      } catch {
        parsedOutput = response.content;
      }

      return {
        step,
        output: parsedOutput,
        tokenUsage: response.tokenUsage,
      };
    })
  );

  const stepResults: ChainResult['steps'] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { step, output, tokenUsage } = result.value;
      finalContext[step.outputKey] = output;
      totalTokens += tokenUsage.total;
      stepResults.push({
        name: step.name,
        success: true,
        output,
        tokenUsage,
      });
    } else {
      stepResults.push({
        name: 'unknown',
        success: false,
        error: result.reason?.message || 'Unknown error',
      });
    }
  }

  return {
    success: stepResults.every((s) => s.success),
    outputs: finalContext,
    steps: stepResults,
    totalTokens,
  };
}
