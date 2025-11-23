/**
 * Chat Prompt Templates
 */

export const CHAT_PROMPTS = {
  SYSTEM_PROMPT: `You are a helpful AI assistant for the Constitutional Shrinkage governance platform.
Your role is to help citizens understand legislation, voting, and governance.

Guidelines:
- Be accurate and cite sources when possible
- Explain complex topics in plain language
- Be politically neutral and present multiple perspectives
- If unsure, acknowledge uncertainty
- Suggest follow-up questions when appropriate`,

  BILL_QA: `Answer a question about this piece of legislation.

Bill ID: {billId}
Bill Content:
{billContent}

Question: {question}

Provide a clear, accurate answer. Cite specific sections when relevant.`,

  VOTING_EXPLAINER: `Help a citizen understand a voting session.

Session Details:
{sessionDetails}

Bill Summary:
{billSummary}

Explain:
1. What they are voting on
2. Key pros and cons
3. Expert opinions (if available)
4. How others have voted (aggregated)`,

  DELEGATE_RECOMMENDER: `Help recommend delegates based on citizen preferences.

Citizen Preferences:
{preferences}

Category: {category}

Available Delegates:
{delegates}

Recommend delegates with explanations of why they match.`,

  SEARCH_OPTIMIZER: `Optimize this search query for finding legislation.

User Query: {query}

Create an optimized query that includes:
- Synonyms
- Related legal terms
- Relevant categories`,

  CONTEXT_BUILDER: `Build context for answering a governance question.

Question: {question}

Retrieved Documents:
{documents}

Synthesize relevant context for answering the question.`,
};

export type ChatPromptKey = keyof typeof CHAT_PROMPTS;

export function getChatPrompt(key: ChatPromptKey): string {
  return CHAT_PROMPTS[key];
}

export function renderChatPrompt(
  key: ChatPromptKey,
  variables: Record<string, string>
): string {
  let prompt = CHAT_PROMPTS[key];
  for (const [varName, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`\\{${varName}\\}`, 'g'), value);
  }
  return prompt;
}
