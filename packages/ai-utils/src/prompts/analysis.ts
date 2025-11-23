/**
 * Analysis Prompt Templates
 */

export const ANALYSIS_PROMPTS = {
  TBL_IMPACT: `Analyze the Triple Bottom Line impact of this legislation.

Bill:
{bill}

Region: {region}

Evaluate impact on:
- PEOPLE: Health, education, equality, quality of life
- PLANET: Environment, carbon, resources, sustainability
- PROFIT: Economy, jobs, tax revenue, business

Score each from -100 to +100 with detailed factors.`,

  STAKEHOLDER_ANALYSIS: `Identify stakeholders affected by this legislation.

Bill:
{bill}

For each stakeholder group:
1. Identify their interest
2. Predict their likely position (support/oppose/neutral)
3. Assess their influence level
4. List main concerns`,

  CATEGORY_CLASSIFICATION: `Classify this legislation into appropriate categories.

Bill:
{bill}

Available Categories:
{categories}

Select all applicable categories with confidence scores.`,

  KEYWORD_EXTRACTION: `Extract key terms and concepts from this legislation.

Bill:
{bill}

Extract:
1. Legal terms
2. Policy concepts
3. Affected entities
4. Key phrases`,

  SENTIMENT_ANALYSIS: `Analyze the sentiment and tone of this legislation.

Text:
{text}

Evaluate:
1. Overall sentiment (positive/negative/neutral)
2. Aspects and their individual sentiments
3. Tone (formal, urgent, inclusive, etc.)`,

  OUTCOME_PREDICTION: `Predict the likely voting outcome for this bill.

Bill Summary:
{summary}

Historical Context:
{history}

Political Context:
{context}

Predict:
1. Likely outcome (pass/fail/uncertain)
2. Confidence level
3. Key factors influencing outcome
4. Swing voters/groups`,
};

export type AnalysisPromptKey = keyof typeof ANALYSIS_PROMPTS;

export function getAnalysisPrompt(key: AnalysisPromptKey): string {
  return ANALYSIS_PROMPTS[key];
}

export function renderAnalysisPrompt(
  key: AnalysisPromptKey,
  variables: Record<string, string>
): string {
  let prompt = ANALYSIS_PROMPTS[key];
  for (const [varName, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`\\{${varName}\\}`, 'g'), value);
  }
  return prompt;
}
