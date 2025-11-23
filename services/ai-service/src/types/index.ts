/**
 * AI Service Types
 * Core type definitions for AI/ML analysis services
 */

// ============================================================================
// LLM Types
// ============================================================================

export type LLMProvider = 'openai' | 'anthropic';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  maxTokens: number;
  temperature: number;
  apiKey?: string;
}

export interface LLMResponse {
  content: string;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
  finishReason: string;
}

// ============================================================================
// Summarization Types
// ============================================================================

export interface BillSummary {
  summary: string;
  keyPoints: string[];
  affectedGroups: string[];
  tldr: string;
  readingLevel: string;
  wordCount: number;
}

export interface SectionExplanation {
  section: string;
  explanation: string;
  legalTerms: TermDefinition[];
}

export interface TermDefinition {
  term: string;
  definition: string;
  context: string;
}

export interface ChangeExplanation {
  changeType: 'addition' | 'removal' | 'modification';
  originalText?: string;
  newText?: string;
  explanation: string;
  impact: string;
}

export interface DiffExplanation {
  changes: ChangeExplanation[];
  overallImpact: string;
  significanceLevel: 'minor' | 'moderate' | 'major' | 'critical';
}

// ============================================================================
// Compliance Types
// ============================================================================

export type IssueSeverity = 'critical' | 'warning' | 'info';

export interface ConstitutionalIssue {
  severity: IssueSeverity;
  article: string;
  section?: string;
  description: string;
  excerpt: string;
  suggestion: string;
  confidence: number;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  relevance: number;
}

export interface ComplianceReport {
  score: number;
  compliant: boolean;
  issues: ConstitutionalIssue[];
  relevantArticles: Article[];
  recommendations: string[];
  analysisDate: string;
  billId?: string;
}

export interface RightAnalysis {
  rightId: string;
  rightName: string;
  compliant: boolean;
  concerns: string[];
  protections: string[];
  analysis: string;
}

export interface LegalConflict {
  conflictingLawId: string;
  conflictingLawTitle: string;
  conflictType: 'direct' | 'indirect' | 'potential';
  description: string;
  resolution: string;
}

// ============================================================================
// Impact Prediction Types
// ============================================================================

export interface Factor {
  name: string;
  impact: number;
  description: string;
  confidence: number;
}

export interface PeopleImpact {
  score: number;
  factors: Factor[];
  affectedPopulation: number;
  inequalityImpact: string;
  demographics: string[];
}

export interface PlanetImpact {
  score: number;
  factors: Factor[];
  carbonImpact: number;
  resourceImpact: string;
  sustainabilityRating: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface ProfitImpact {
  score: number;
  factors: Factor[];
  economicImpact: number;
  jobsImpact: number;
  gdpEffect: string;
}

export interface TBLImpactReport {
  people: PeopleImpact;
  planet: PlanetImpact;
  profit: ProfitImpact;
  overall: number;
  confidence: number;
  methodology: string;
  region: string;
  analysisDate: string;
}

export interface RegionalComparison {
  billId: string;
  regions: {
    region: string;
    impact: TBLImpactReport;
  }[];
  summary: string;
}

// ============================================================================
// Chat Types
// ============================================================================

export interface Citation {
  source: string;
  section?: string;
  quote?: string;
  url?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: Citation[];
}

export interface ChatResponse {
  answer: string;
  sources: Citation[];
  relatedBills: RelatedBill[];
  followUpQuestions: string[];
  confidence: number;
}

export interface RelatedBill {
  id: string;
  title: string;
  relevance: number;
  relationship: string;
}

export interface VotingExplanation {
  whatYoureVotingOn: string;
  pros: string[];
  cons: string[];
  expertOpinions: ExpertOpinion[];
  howOthersVoted: VotingStats;
}

export interface ExpertOpinion {
  expert: string;
  credentials: string;
  opinion: string;
  stance: 'support' | 'oppose' | 'neutral';
}

export interface VotingStats {
  totalVotes: number;
  yesPercentage: number;
  noPercentage: number;
  abstainPercentage: number;
  byDemographic?: Record<string, { yes: number; no: number }>;
}

export interface DelegateRecommendation {
  delegateId: string;
  name: string;
  score: number;
  reasons: string[];
  votingHistory: string;
  expertise: string[];
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchFilters {
  categories?: string[];
  dateRange?: { start: string; end: string };
  status?: string[];
  region?: string;
  minRelevance?: number;
}

export interface ScoredBill {
  id: string;
  title: string;
  score: number;
  highlights: string[];
  matchedSections: string[];
}

export interface SimilarBill {
  id: string;
  title: string;
  similarity: number;
  sharedTopics: string[];
  differingAspects: string[];
}

export interface Precedent {
  caseId: string;
  caseName: string;
  relevance: number;
  summary: string;
  ruling: string;
  implications: string;
}

export interface RetrievedDocument {
  id: string;
  content: string;
  source: string;
  relevance: number;
  metadata: Record<string, unknown>;
}

export interface RAGResponse {
  answer: string;
  context: RetrievedDocument[];
  confidence: number;
  sources: Citation[];
}

// ============================================================================
// Embedding Types
// ============================================================================

export interface EmbeddingVector {
  id: string;
  values: number[];
  metadata: Record<string, unknown>;
}

export interface EmbeddingResult {
  id: string;
  embedding: number[];
  tokenCount: number;
}

// ============================================================================
// Analysis Types
// ============================================================================

export interface BillAnalysis {
  billId: string;
  summary: BillSummary;
  compliance: ComplianceReport;
  impact: TBLImpactReport;
  conflicts: LegalConflict[];
  categories: string[];
  keywords: string[];
  analysisDate: string;
}

export interface AmendmentAnalysis {
  originalBillId: string;
  amendmentId: string;
  changes: ChangeExplanation[];
  impactDelta: {
    people: number;
    planet: number;
    profit: number;
  };
  recommendation: string;
}

// ============================================================================
// Category & Classification Types
// ============================================================================

export interface CategoryClassification {
  category: string;
  confidence: number;
  subcategories: string[];
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  score: number;
  aspects: {
    aspect: string;
    sentiment: string;
    score: number;
  }[];
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  createdAt: string;
  expiresAt: string;
  hash: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}
