/**
 * Chat Handler Service
 * Manages conversational AI interactions with citizens
 */

import { getLLMClient, type LLMMessage } from '../llm/client.js';
import { renderPrompt } from '../llm/prompts.js';
import { getSemanticSearchService } from '../embeddings/semantic-search.js';
import type {
  ChatMessage,
  ChatResponse,
  Citation,
  RelatedBill,
  VotingExplanation,
  DelegateRecommendation,
} from '../../types/index.js';

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: Record<string, unknown>;
  createdAt: string;
  lastActiveAt: string;
}

export interface ChatConfig {
  maxHistoryLength: number;
  systemPrompt?: string;
  temperature?: number;
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant for the Constitutional Shrinkage governance platform.
Your role is to help citizens understand legislation, voting, and governance.

Guidelines:
- Be accurate and cite sources when possible
- Explain complex topics in plain language
- Be politically neutral and present multiple perspectives
- If unsure, acknowledge uncertainty
- Be respectful and helpful`;

export class ChatHandler {
  private client = getLLMClient();
  private searchService = getSemanticSearchService();
  private sessions: Map<string, ChatSession> = new Map();
  private config: ChatConfig;

  constructor(config?: Partial<ChatConfig>) {
    this.config = {
      maxHistoryLength: config?.maxHistoryLength || 20,
      systemPrompt: config?.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      temperature: config?.temperature || 0.7,
    };
  }

  /**
   * Process a chat message
   */
  async chat(
    userId: string,
    message: string,
    sessionId?: string
  ): Promise<ChatResponse> {
    // Get or create session
    const session = this.getOrCreateSession(userId, sessionId);

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Retrieve relevant context
    const contextResult = await this.searchService.answerWithContext(message);
    const context = contextResult.context
      .map((c) => `[${c.source}]: ${c.content.slice(0, 500)}`)
      .join('\n\n');

    // Build message history for LLM
    const history = this.formatHistory(session.messages.slice(-this.config.maxHistoryLength));

    const prompt = renderPrompt('CITIZEN_ASSISTANT', {
      question: message,
      context,
      history,
    });

    // Generate response
    const response = await this.client.complete({
      messages: [
        { role: 'system', content: this.config.systemPrompt || DEFAULT_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: this.config.temperature,
      jsonMode: true,
    });

    const result = JSON.parse(response.content);

    // Add assistant response to session
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: result.answer,
      timestamp: new Date().toISOString(),
      citations: result.sources,
    };
    session.messages.push(assistantMessage);
    session.lastActiveAt = new Date().toISOString();

    return {
      answer: result.answer,
      sources: result.sources || [],
      relatedBills: result.relatedBills || [],
      followUpQuestions: result.followUpQuestions || [],
      confidence: result.confidence || contextResult.confidence,
    };
  }

  /**
   * Ask about a specific bill
   */
  async askAboutBill(
    billId: string,
    billContent: string,
    question: string
  ): Promise<ChatResponse> {
    const prompt = `You are answering a question about a specific piece of legislation.

Bill ID: ${billId}

Bill Content:
${billContent.slice(0, 3000)}

Question: ${question}

Provide a clear, accurate answer based on the bill content.

Respond in JSON format:
{
  "answer": "...",
  "sources": [{"source": "...", "section": "...", "quote": "..."}],
  "relatedBills": [],
  "followUpQuestions": ["...", "..."],
  "confidence": 0.0-1.0
}`;

    const response = await this.client.complete({
      messages: [
        { role: 'system', content: this.config.systemPrompt || DEFAULT_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }

  /**
   * Explain a voting session
   */
  async explainVotingSession(
    sessionDetails: string,
    billSummary: string,
    expertOpinions?: string
  ): Promise<VotingExplanation> {
    const prompt = renderPrompt('EXPLAIN_VOTING_SESSION', {
      sessionDetails,
      billSummary,
      expertOpinions: expertOpinions || 'No expert opinions available.',
    });

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }

  /**
   * Recommend delegates
   */
  async recommendDelegates(
    preferences: string,
    category: string,
    delegates: string
  ): Promise<{
    recommendations: DelegateRecommendation[];
    explanation: string;
  }> {
    const prompt = renderPrompt('RECOMMEND_DELEGATES', {
      preferences,
      category,
      delegates,
    });

    const response = await this.client.complete({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      jsonMode: true,
    });

    return JSON.parse(response.content);
  }

  /**
   * Get or create a chat session
   */
  private getOrCreateSession(userId: string, sessionId?: string): ChatSession {
    if (sessionId && this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }

    const newSession: ChatSession = {
      id: sessionId || `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId,
      messages: [],
      context: {},
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    this.sessions.set(newSession.id, newSession);
    return newSession;
  }

  /**
   * Format message history for LLM
   */
  private formatHistory(messages: ChatMessage[]): string {
    return messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get user's sessions
   */
  getUserSessions(userId: string): ChatSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.userId === userId);
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Clear old sessions
   */
  clearOldSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleared = 0;

    for (const [id, session] of this.sessions) {
      const lastActive = new Date(session.lastActiveAt).getTime();
      if (now - lastActive > maxAgeMs) {
        this.sessions.delete(id);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Get chat statistics
   */
  getStats(): {
    totalSessions: number;
    totalMessages: number;
    activeUsers: number;
  } {
    const sessions = Array.from(this.sessions.values());
    const uniqueUsers = new Set(sessions.map((s) => s.userId));
    const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);

    return {
      totalSessions: sessions.length,
      totalMessages,
      activeUsers: uniqueUsers.size,
    };
  }
}

// Singleton instance
let handlerInstance: ChatHandler | undefined;

export function getChatHandler(config?: Partial<ChatConfig>): ChatHandler {
  if (config || !handlerInstance) {
    handlerInstance = new ChatHandler(config);
  }
  return handlerInstance;
}
