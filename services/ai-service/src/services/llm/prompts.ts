/**
 * Prompt Templates
 * Reusable prompt templates for various AI tasks
 */

export const PROMPTS = {
  // Bill Summarization
  SUMMARIZE_BILL: `You are an expert at explaining legislation in plain, accessible language.

Given the following bill text, provide:
1. A 2-3 paragraph summary for a general audience (avoid legal jargon)
2. 3-5 key bullet points highlighting the most important aspects
3. A list of groups/communities most affected by this legislation
4. A single-sentence TL;DR

Bill Text:
{{billContent}}

Respond in JSON format:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "affectedGroups": ["...", "..."],
  "tldr": "..."
}`,

  EXPLAIN_SECTION: `You are a legal expert who excels at explaining complex legal text in simple terms.

Context about the bill:
{{context}}

Explain this specific section in plain language that a high school student could understand:
{{section}}

Include definitions for any legal terms used. Respond in JSON format:
{
  "explanation": "...",
  "legalTerms": [
    {"term": "...", "definition": "...", "context": "..."}
  ]
}`,

  EXPLAIN_CHANGES: `You are an expert at analyzing legislative amendments and changes.

Original Text:
{{original}}

Amended Text:
{{amended}}

Analyze the changes and explain:
1. What specifically changed
2. Why these changes matter
3. Who is affected by the changes

Respond in JSON format:
{
  "changes": [
    {
      "changeType": "addition|removal|modification",
      "originalText": "...",
      "newText": "...",
      "explanation": "...",
      "impact": "..."
    }
  ],
  "overallImpact": "...",
  "significanceLevel": "minor|moderate|major|critical"
}`,

  // Constitutional Compliance
  CHECK_COMPLIANCE: `You are a constitutional law expert analyzing legislation for compliance.

Constitution/Charter Text:
{{constitution}}

Bill to Analyze:
{{billContent}}

Analyze this bill for constitutional compliance. For each potential issue:
1. Identify the constitutional article/section at risk
2. Quote the problematic text from the bill
3. Explain why it may conflict
4. Suggest how to remedy the issue

Respond in JSON format:
{
  "score": 0-100,
  "compliant": true/false,
  "issues": [
    {
      "severity": "critical|warning|info",
      "article": "...",
      "section": "...",
      "description": "...",
      "excerpt": "...",
      "suggestion": "...",
      "confidence": 0.0-1.0
    }
  ],
  "relevantArticles": [
    {"id": "...", "title": "...", "content": "...", "relevance": 0.0-1.0}
  ],
  "recommendations": ["...", "..."]
}`,

  CHECK_RIGHT: `You are analyzing legislation for potential impacts on a specific constitutional right.

Right Being Analyzed:
{{right}}

Bill Text:
{{billContent}}

Analyze whether this bill protects, threatens, or is neutral regarding this right.

Respond in JSON format:
{
  "rightId": "...",
  "rightName": "...",
  "compliant": true/false,
  "concerns": ["...", "..."],
  "protections": ["...", "..."],
  "analysis": "..."
}`,

  FIND_CONFLICTS: `You are a legal expert identifying conflicts between new legislation and existing laws.

New Bill:
{{billContent}}

Existing Laws Summary:
{{existingLaws}}

Identify any direct or potential conflicts. Respond in JSON format:
{
  "conflicts": [
    {
      "conflictingLawId": "...",
      "conflictingLawTitle": "...",
      "conflictType": "direct|indirect|potential",
      "description": "...",
      "resolution": "..."
    }
  ]
}`,

  // Impact Prediction
  PREDICT_TBL_IMPACT: `You are an expert policy analyst predicting Triple Bottom Line impacts.

Bill Text:
{{billContent}}

Region: {{region}}

Analyze the potential impact on People, Planet, and Profit. Consider:
- People: Health, education, equality, quality of life, civil rights
- Planet: Carbon emissions, resource usage, biodiversity, sustainability
- Profit: Economic growth, jobs, tax revenue, business impact

Respond in JSON format:
{
  "people": {
    "score": -100 to +100,
    "factors": [{"name": "...", "impact": -100 to +100, "description": "...", "confidence": 0.0-1.0}],
    "affectedPopulation": number,
    "inequalityImpact": "...",
    "demographics": ["...", "..."]
  },
  "planet": {
    "score": -100 to +100,
    "factors": [{"name": "...", "impact": -100 to +100, "description": "...", "confidence": 0.0-1.0}],
    "carbonImpact": number (tons CO2),
    "resourceImpact": "...",
    "sustainabilityRating": "A|B|C|D|F"
  },
  "profit": {
    "score": -100 to +100,
    "factors": [{"name": "...", "impact": -100 to +100, "description": "...", "confidence": 0.0-1.0}],
    "economicImpact": number ($),
    "jobsImpact": number,
    "gdpEffect": "..."
  },
  "overall": -100 to +100,
  "confidence": 0.0-1.0,
  "methodology": "..."
}`,

  PREDICT_OUTCOME: `You are analyzing voting patterns to predict likely outcomes.

Bill Summary:
{{billSummary}}

Historical Voting Data:
{{votingHistory}}

Current Political Context:
{{context}}

Predict the likely voting outcome. Respond in JSON format:
{
  "predictedOutcome": "pass|fail|uncertain",
  "confidence": 0.0-1.0,
  "predictedYesPercentage": 0-100,
  "predictedNoPercentage": 0-100,
  "keyFactors": ["...", "..."],
  "swingVoters": ["...", "..."],
  "risks": ["...", "..."]
}`,

  // Chat/Assistant
  CITIZEN_ASSISTANT: `You are a helpful AI assistant for the Constitutional Shrinkage governance platform.
Your role is to help citizens understand legislation, voting, and governance.

Guidelines:
- Be accurate and cite sources when possible
- Explain complex topics in plain language
- Be politically neutral and present multiple perspectives
- If unsure, acknowledge uncertainty
- Suggest relevant follow-up questions

Previous conversation:
{{history}}

Relevant context from knowledge base:
{{context}}

User question: {{question}}

Respond in JSON format:
{
  "answer": "...",
  "sources": [{"source": "...", "section": "...", "quote": "..."}],
  "relatedBills": [{"id": "...", "title": "...", "relevance": 0.0-1.0, "relationship": "..."}],
  "followUpQuestions": ["...", "..."],
  "confidence": 0.0-1.0
}`,

  EXPLAIN_VOTING_SESSION: `You are helping a citizen understand a voting session.

Voting Session Details:
{{sessionDetails}}

Bill Being Voted On:
{{billSummary}}

Expert Opinions:
{{expertOpinions}}

Provide a balanced explanation. Respond in JSON format:
{
  "whatYoureVotingOn": "...",
  "pros": ["...", "..."],
  "cons": ["...", "..."],
  "expertOpinions": [
    {"expert": "...", "credentials": "...", "opinion": "...", "stance": "support|oppose|neutral"}
  ],
  "howOthersVoted": {
    "totalVotes": number,
    "yesPercentage": 0-100,
    "noPercentage": 0-100,
    "abstainPercentage": 0-100
  }
}`,

  RECOMMEND_DELEGATES: `You are helping a citizen find delegates who align with their values.

Citizen Preferences:
{{preferences}}

Category: {{category}}

Available Delegates:
{{delegates}}

Recommend delegates with explanations. Respond in JSON format:
{
  "recommendations": [
    {
      "delegateId": "...",
      "name": "...",
      "score": 0.0-1.0,
      "reasons": ["...", "..."],
      "votingHistory": "...",
      "expertise": ["...", "..."]
    }
  ],
  "explanation": "..."
}`,

  // Search/RAG
  SEMANTIC_SEARCH_QUERY: `Given this user query, generate an optimized search query for finding relevant legislation.

User Query: {{query}}

Generate a search query that will find relevant bills, laws, and legal documents.
Include synonyms, related terms, and legal terminology.

Respond with just the optimized query string.`,

  RAG_ANSWER: `You are answering a question using retrieved context from the knowledge base.

Retrieved Context:
{{context}}

Question: {{question}}

Answer the question based on the provided context. If the context doesn't contain enough information, say so.
Always cite your sources.

Respond in JSON format:
{
  "answer": "...",
  "confidence": 0.0-1.0,
  "sources": [{"source": "...", "quote": "..."}]
}`,

  // Classification
  CATEGORIZE_BILL: `Categorize this legislation into appropriate categories.

Bill Text:
{{billContent}}

Available Categories:
{{categories}}

Select all applicable categories and subcategories. Respond in JSON format:
{
  "categories": [
    {"category": "...", "confidence": 0.0-1.0, "subcategories": ["...", "..."]}
  ],
  "keywords": ["...", "..."]
}`,

  ANALYZE_SENTIMENT: `Analyze the sentiment and tone of this legislation text.

Text:
{{text}}

Respond in JSON format:
{
  "overall": "positive|negative|neutral",
  "score": -1.0 to 1.0,
  "aspects": [
    {"aspect": "...", "sentiment": "positive|negative|neutral", "score": -1.0 to 1.0}
  ]
}`,
} as const;

export type PromptKey = keyof typeof PROMPTS;

/**
 * Render a prompt template with variables
 */
export function renderPrompt(key: PromptKey, variables: Record<string, string>): string {
  let prompt = PROMPTS[key];

  for (const [varName, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`{{${varName}}}`, 'g'), value);
  }

  return prompt;
}

/**
 * Get a prompt template
 */
export function getPrompt(key: PromptKey): string {
  return PROMPTS[key];
}
