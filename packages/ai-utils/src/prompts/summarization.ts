/**
 * Summarization Prompt Templates
 */

export const SUMMARIZATION_PROMPTS = {
  BILL_SUMMARY: `You are an expert at explaining legislation in plain, accessible language.

Given the following bill text, provide a comprehensive but accessible summary.

Bill Text:
{content}

Provide:
1. A 2-3 paragraph summary for a general audience
2. 3-5 key bullet points
3. List of groups/communities most affected
4. A single-sentence TL;DR

Format your response as JSON with keys: summary, keyPoints, affectedGroups, tldr`,

  SECTION_EXPLANATION: `Explain this section of legislation in plain language:

Section:
{section}

Context:
{context}

Provide an explanation that a high school student could understand.
Include definitions for any legal terms used.`,

  AMENDMENT_SUMMARY: `Summarize the changes made by this amendment:

Original Text:
{original}

Amended Text:
{amended}

Explain:
1. What changed
2. Why it matters
3. Who is affected`,

  EXECUTIVE_SUMMARY: `Create an executive summary of this legislation for policymakers:

{content}

The summary should:
- Be under 500 words
- Highlight fiscal impact
- Note implementation requirements
- Identify potential challenges`,
};

export type SummarizationPromptKey = keyof typeof SUMMARIZATION_PROMPTS;

export function getSummarizationPrompt(key: SummarizationPromptKey): string {
  return SUMMARIZATION_PROMPTS[key];
}

export function renderSummarizationPrompt(
  key: SummarizationPromptKey,
  variables: Record<string, string>
): string {
  let prompt = SUMMARIZATION_PROMPTS[key];
  for (const [varName, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`\\{${varName}\\}`, 'g'), value);
  }
  return prompt;
}
