# Agent_C: AI/ML Analysis Services

## Mission
Build AI-powered services for bill analysis, impact prediction, constitutional compliance checking, and citizen assistance, making governance more accessible and informed.

## Branch
```
claude/agent-C-ai-services-{session-id}
```

## Priority: HIGH

## Context
AI can help citizens and officials by:
- Summarizing complex legislation in plain language
- Predicting policy impacts (TBL scoring)
- Checking constitutional compliance automatically
- Answering questions about bills and voting
- Detecting conflicts with existing laws
- Identifying similar historical legislation

## Target Directories
```
services/ai-service/
packages/ai-utils/
```

## Your Deliverables

### 1. AI Service Architecture

```
services/ai-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── analyze.ts              # Bill analysis endpoints
│   │   ├── summarize.ts            # Summarization endpoints
│   │   ├── compliance.ts           # Constitutional compliance
│   │   ├── predict.ts              # Impact prediction
│   │   ├── chat.ts                 # Conversational AI
│   │   └── search.ts               # Semantic search
│   ├── services/
│   │   ├── llm/
│   │   │   ├── client.ts           # LLM client (OpenAI/Anthropic)
│   │   │   ├── prompts.ts          # Prompt templates
│   │   │   └── chain.ts            # LangChain integration
│   │   ├── analysis/
│   │   │   ├── bill-analyzer.ts
│   │   │   ├── conflict-detector.ts
│   │   │   └── amendment-analyzer.ts
│   │   ├── prediction/
│   │   │   ├── impact-predictor.ts
│   │   │   ├── tbl-scorer.ts       # Triple Bottom Line
│   │   │   └── outcome-model.ts
│   │   ├── compliance/
│   │   │   ├── constitutional-check.ts
│   │   │   ├── rights-validator.ts
│   │   │   └── precedent-finder.ts
│   │   ├── embeddings/
│   │   │   ├── vectorstore.ts      # Vector database
│   │   │   ├── bill-embeddings.ts
│   │   │   └── semantic-search.ts
│   │   └── assistant/
│   │       ├── chat-handler.ts
│   │       ├── context-builder.ts
│   │       └── response-formatter.ts
│   ├── models/
│   │   ├── fine-tuned/             # Custom fine-tuned models
│   │   └── classifiers/
│   │       ├── category.ts
│   │       └── sentiment.ts
│   ├── lib/
│   │   ├── rag.ts                  # RAG implementation
│   │   └── cache.ts                # Response caching
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 2. Bill Analysis Features

#### Plain Language Summarization
```typescript
interface SummarizationService {
  // Generate plain-language summary
  summarizeBill(billContent: string): Promise<{
    summary: string;           // 2-3 paragraph summary
    keyPoints: string[];       // Bullet points
    affectedGroups: string[];  // Who this impacts
    tldr: string;              // One sentence
  }>;

  // Explain specific sections
  explainSection(section: string, context: string): Promise<string>;

  // Compare two versions
  explainChanges(original: string, amended: string): Promise<{
    changes: ChangeExplanation[];
    impact: string;
  }>;
}
```

#### Constitutional Compliance
```typescript
interface ComplianceService {
  // Check bill against constitution
  checkCompliance(billContent: string): Promise<{
    score: number;                    // 0-100
    compliant: boolean;
    issues: ConstitutionalIssue[];
    relevantArticles: Article[];
    recommendations: string[];
  }>;

  // Check specific right
  checkRight(billContent: string, rightId: string): Promise<RightAnalysis>;

  // Find conflicts with existing laws
  findConflicts(billContent: string): Promise<Conflict[]>;
}

interface ConstitutionalIssue {
  severity: 'critical' | 'warning' | 'info';
  article: string;
  description: string;
  excerpt: string;          // Problematic text
  suggestion: string;       // How to fix
}
```

#### Impact Prediction (Triple Bottom Line)
```typescript
interface ImpactPredictionService {
  // Predict TBL impact
  predictImpact(billContent: string, region: string): Promise<{
    people: {
      score: number;        // -100 to +100
      factors: Factor[];
      affectedPopulation: number;
      inequalityImpact: string;
    };
    planet: {
      score: number;
      carbonImpact: number; // tons CO2
      resourceImpact: string;
      sustainabilityRating: string;
    };
    profit: {
      score: number;
      economicImpact: number; // $ estimate
      jobsImpact: number;
      gdpEffect: string;
    };
    overall: number;
    confidence: number;
    methodology: string;
  }>;

  // Compare impact across regions
  compareRegionalImpact(billId: string, regions: string[]): Promise<RegionalComparison>;
}
```

### 3. Conversational AI Assistant

```typescript
// Citizen AI Assistant
interface CitizenAssistant {
  // Answer questions about legislation
  askAboutBill(billId: string, question: string): Promise<{
    answer: string;
    sources: Citation[];
    relatedBills: Bill[];
    followUpQuestions: string[];
  }>;

  // Help understand voting
  explainVotingSession(sessionId: string): Promise<{
    whatYoureVotingOn: string;
    pros: string[];
    cons: string[];
    expertOpinions: Opinion[];
    howOthersVoted: VotingStats;  // Aggregated, not individual
  }>;

  // Guide through delegation
  recommendDelegates(userId: string, category: string): Promise<{
    recommendations: DelegateRecommendation[];
    explanation: string;
  }>;

  // General governance questions
  chat(userId: string, message: string): Promise<ChatResponse>;
}
```

### 4. Semantic Search & RAG

```typescript
// Vector store for bills, laws, precedents
interface SemanticSearchService {
  // Search bills by meaning
  searchBills(query: string, filters?: SearchFilters): Promise<{
    results: ScoredBill[];
    suggestedFilters: Filter[];
  }>;

  // Find similar legislation
  findSimilar(billId: string, limit: number): Promise<SimilarBill[]>;

  // Find relevant precedents
  findPrecedents(billContent: string): Promise<Precedent[]>;

  // RAG-enhanced question answering
  answerWithContext(question: string): Promise<{
    answer: string;
    context: RetrievedDocument[];
    confidence: number;
  }>;
}
```

### 5. AI Utilities Package

```
packages/ai-utils/
├── src/
│   ├── prompts/
│   │   ├── summarization.ts
│   │   ├── compliance.ts
│   │   ├── analysis.ts
│   │   └── chat.ts
│   ├── schemas/
│   │   ├── bill-analysis.ts        # Structured output schemas
│   │   ├── compliance-report.ts
│   │   └── impact-report.ts
│   ├── utils/
│   │   ├── token-counter.ts
│   │   ├── chunker.ts              # Text chunking
│   │   └── citation.ts             # Citation extraction
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 6. Model Training Data Preparation

```typescript
// Prepare training data for fine-tuning
interface TrainingDataService {
  // Extract Q&A pairs from bills
  extractQAPairs(bills: Bill[]): QAPair[];

  // Generate synthetic examples
  generateExamples(template: string, count: number): Example[];

  // Prepare compliance training data
  prepareComplianceData(annotatedBills: AnnotatedBill[]): TrainingSet;
}
```

## API Endpoints

```yaml
Analysis:
  POST   /ai/analyze/bill              # Full bill analysis
  POST   /ai/analyze/section           # Section analysis
  POST   /ai/analyze/diff              # Diff explanation

Summarization:
  POST   /ai/summarize                 # Summarize text
  POST   /ai/summarize/bill/:id        # Summarize bill
  POST   /ai/explain                   # Explain in plain language

Compliance:
  POST   /ai/compliance/check          # Check constitutional compliance
  POST   /ai/compliance/conflicts      # Find legal conflicts
  GET    /ai/compliance/report/:billId # Get compliance report

Prediction:
  POST   /ai/predict/impact            # Predict TBL impact
  POST   /ai/predict/outcome           # Predict voting outcome
  GET    /ai/predict/comparison        # Regional comparison

Chat:
  POST   /ai/chat                      # Conversational interface
  POST   /ai/chat/bill/:id             # Chat about specific bill
  GET    /ai/chat/history              # Get chat history

Search:
  POST   /ai/search/semantic           # Semantic search
  GET    /ai/search/similar/:billId    # Find similar bills
  POST   /ai/search/precedents         # Find precedents
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Endpoints | 20-25 |
| Service Functions | 40-50 |
| Lines of Code | 6,000-8,000 |
| Response Time | <3s for analysis |
| Accuracy | 90%+ on compliance |

## Success Criteria

1. [ ] LLM integration working (OpenAI/Anthropic)
2. [ ] Bill summarization accurate and readable
3. [ ] Constitutional compliance checking functional
4. [ ] TBL impact prediction producing reasonable scores
5. [ ] Semantic search returning relevant results
6. [ ] Chat assistant answering questions correctly
7. [ ] RAG implementation with bill corpus
8. [ ] Response caching for performance
9. [ ] Rate limiting and cost controls

---

*Agent_C Assignment - AI/ML Analysis Services*
